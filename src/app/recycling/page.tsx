'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RecyclingDashboardTable } from '@/components/recycling/recycling-dashboard-table';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { Header } from '@/components/layout/header';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/auth-context';
import type { WasteReport } from '@/lib/types';
import { WasteReportsTableSkeleton } from '@/components/tracking/waste-reports-table-skeleton';
import { Info } from 'lucide-react';

export default function RecyclingPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<WasteReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [queryIndexUrl, setQueryIndexUrl] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [retryCounter, setRetryCounter] = useState(0);
  const pollRef = useRef<number | null>(null);

  useEffect(() => {
    // For agents, show all non-completed reports.
    // In a real-world scenario, you'd likely filter by agent assignment.
    const q = query(
      collection(db, 'wasteReports'),
      where('status', '!=', 'Completed'),
      orderBy('status'),
      orderBy('reportedAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const reportsData: WasteReport[] = [];
        querySnapshot.forEach((doc) => {
          reportsData.push({ id: doc.id, ...doc.data() } as WasteReport);
        });
        setReports(reportsData);
        setLoading(false);
        // If polling for index readiness, stop once we successfully receive data
        if (pollRef.current) {
          window.clearInterval(pollRef.current);
          pollRef.current = null;
          setIsPolling(false);
        }
        setQueryError(null);
        setQueryIndexUrl(null);
      },
      (err) => {
        // Surface indexing / permissions errors without crashing the app
        console.error('Firestore listener error:', err);
        setLoading(false);
        const message = err?.message || String(err);
        const match = message.match(/https?:\/\/[^\s)\"]+/);
        const indexUrl = match ? match[0] : 'https://console.firebase.google.com/project/agritrace-7bb41/firestore/indexes';
        setQueryIndexUrl(indexUrl);
        const isBuilding = /building/i.test(message) || /currently building/i.test(message);
        if (isBuilding) {
          setQueryError('The index is currently building and cannot be used yet.');
          // start polling to retry the query every 30s
          if (!pollRef.current) {
            setIsPolling(true);
            pollRef.current = window.setInterval(() => setRetryCounter((c) => c + 1), 30000);
          }
        } else {
          setQueryError('The current query requires a composite index which is missing or still building.');
        }
      }
    );

    return () => unsubscribe();
  }, [user, retryCounter]);

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarNav />
      </Sidebar>
      <SidebarInset className="flex min-h-svh flex-col">
        <Header />
        <main className="flex-grow p-4 md:p-6 lg:p-8">
          <div className="flex flex-col gap-6">
            <h1 className="font-headline text-3xl font-bold tracking-tight">
              Assigned Collections
            </h1>
            <Card>
              <CardHeader>
                <CardTitle>Incoming Waste</CardTitle>
                <CardDescription>
                  Manage and track all active waste collections.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {queryError ? (
                  <div className="rounded-md border border-yellow-400 bg-yellow-50 p-4">
                    <h3 className="font-semibold">Firestore index required</h3>
                    <p className="text-sm text-muted-foreground">
                      The current query requires a composite index which is missing or still building.
                    </p>
                    <div className="mt-3 flex gap-3 items-center">
                      <a
                        className="text-blue-600 underline"
                        href={queryIndexUrl ?? 'https://console.firebase.google.com/project/agritrace-7bb41/firestore/indexes'}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open Firestore Indexes Console
                      </a>
                      <button
                        className="text-sm px-3 py-1 rounded bg-slate-100 hover:bg-slate-200"
                        onClick={() => setRetryCounter((c) => c + 1)}
                      >
                        Retry now
                      </button>

                      {isPolling ? (
                        <button
                          className="text-sm px-3 py-1 rounded bg-red-100 hover:bg-red-200"
                          onClick={() => {
                            if (pollRef.current) {
                              window.clearInterval(pollRef.current);
                              pollRef.current = null;
                            }
                            setIsPolling(false);
                          }}
                        >
                          Stop checking
                        </button>
                      ) : (
                        <button
                          className="text-sm px-3 py-1 rounded bg-slate-100 hover:bg-slate-200"
                          onClick={() => {
                            if (!pollRef.current) {
                              setIsPolling(true);
                              pollRef.current = window.setInterval(() => setRetryCounter((c) => c + 1), 30000);
                            }
                          }}
                        >
                          Auto Retry
                        </button>
                      )}
                    </div>
                    {isPolling && <p className="mt-2 text-xs text-muted-foreground">Checking index status — will retry automatically every 30s.</p>}
                    {!isPolling && <p className="mt-2 text-xs text-muted-foreground">If the index is building, wait a few minutes then Retry.</p>}
                  </div>
                ) : loading ? (
                  <WasteReportsTableSkeleton />
                ) : reports.length > 0 ? (
                  <RecyclingDashboardTable reports={reports} />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-4 rounded-md border border-dashed p-8 text-center">
                    <Info className="h-10 w-10 text-muted-foreground" />
                    <h2 className="text-xl font-semibold">No Pending Collections</h2>
                    <p className="text-muted-foreground">
                      There are currently no active waste reports assigned.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
