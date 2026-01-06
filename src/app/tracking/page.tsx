'use client';
import React, { useEffect, useState } from 'react';
import { WasteReportsTable } from '@/components/tracking/waste-reports-table';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { Header } from '@/components/layout/header';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/auth-context';
import type { WasteReport } from '@/lib/types';
import { WasteReportsTableSkeleton } from '@/components/tracking/waste-reports-table-skeleton';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function TrackingPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<WasteReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'wasteReports'),
      where('farmerId', '==', user.uid),
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
      },
      (error) => {
        console.error('Error fetching reports: ', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  return (
    <div className="bg-slate-50 min-h-screen">
      <SidebarNav />
      <Header />

      <main className="lg:ml-64 mt-16 flex flex-col">
        <div className="flex-1 p-4 sm:p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Page Header */}
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Waste Tracking</h1>
              <p className="text-slate-600">Live status of all your agricultural waste collections</p>
            </div>

            {/* Content Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Card Header */}
              <div className="px-6 sm:px-8 py-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
                <h2 className="text-xl font-bold text-slate-900">All Waste Reports</h2>
                <p className="text-sm text-slate-600 mt-1">Track the status of your reported waste from collection to recycling</p>
              </div>

              {/* Card Content */}
              <div className="px-6 sm:px-8 py-6">
                {loading ? (
                  <WasteReportsTableSkeleton />
                ) : reports.length > 0 ? (
                  <WasteReportsTable reports={reports} />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-4 py-12">
                    <div className="text-5xl">📋</div>
                    <h2 className="text-lg font-semibold text-slate-900">No Reports Found</h2>
                    <p className="text-slate-600 text-center max-w-sm">
                      You haven't reported any waste yet. Start by creating your first waste report.
                    </p>
                    <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white">
                      <Link href="/reporting">Report Waste Now</Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
