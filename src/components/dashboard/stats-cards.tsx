'use client';
import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Leaf, AlertTriangle, Tractor, DollarSign } from 'lucide-react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/auth-context';
import type { WasteReport } from '@/lib/types';

export function StatsCards() {
  const { user } = useAuth();
  const [reports, setReports] = useState<WasteReport[]>([]);

  useEffect(() => {
    if (!user) return;

    const q =
      user.role === 'FARMER'
        ? query(collection(db, 'wasteReports'), where('farmerId', '==', user.uid))
        : query(collection(db, 'wasteReports')); // Agents see all reports

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const reportsData: WasteReport[] = [];
      querySnapshot.forEach((doc) => {
        reportsData.push({ id: doc.id, ...doc.data() } as WasteReport);
      });
      setReports(reportsData);
    });

    return () => unsubscribe();
  }, [user]);

  const totalWasteCollected = reports
    .filter((report) => report.status === 'Completed' || report.status === 'Processing' || report.status === 'Recycled')
    .reduce((sum, report) => sum + report.quantity, 0);

  const pendingReports = reports.filter(
    (report) => report.status === 'Pending Pickup'
  ).length;

  const inTransit = reports.filter(
    (report) => report.status === 'In Transit' || report.status === 'Delivered'
  ).length;

  const totalIncome = reports
    .filter((report) => report.paymentStatus === 'Paid')
    .reduce((sum, report) => sum + (report.payment || 0), 0);

  const stats = [
    {
      title: 'Total Waste Collected',
      value: `${totalWasteCollected.toFixed(1)} tons`,
      icon: <Leaf className="h-5 w-5 text-muted-foreground" />,
      description: 'Total biomass processed',
    },
    {
      title: 'Pending Reports',
      value: pendingReports,
      icon: <AlertTriangle className="h-5 w-5 text-muted-foreground" />,
      description: 'New waste reports awaiting collection',
    },
    {
      title: 'Collections In-Transit',
      value: inTransit,
      icon: <Tractor className="h-5 w-5 text-muted-foreground" />,
      description: 'Waste currently being transported',
    },
    {
      title: 'Total Income Generated',
      value: `$${(totalIncome / 1000).toFixed(1)}k`,
      icon: <DollarSign className="h-5 w-5 text-muted-foreground" />,
      description: 'Payments made to farmers',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            {stat.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
