'use client';

import React, { useState, useEffect } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/auth-context';
import type { WasteReport } from '@/lib/types';

const chartConfig = {
  quantity: {
    label: 'Quantity (tons)',
    color: 'hsl(var(--primary))',
  },
};

export function WasteByTypeChart() {
  const { user } = useAuth();
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    let q;
    if (user.role === 'FARMER') {
      q = query(collection(db, 'wasteReports'), where('farmerId', '==', user.uid));
    } else {
      q = query(collection(db, 'wasteReports'));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reports = snapshot.docs.map(doc => doc.data() as WasteReport);

      const wasteByType = reports.reduce((acc, report) => {
        acc[report.wasteType] = (acc[report.wasteType] || 0) + report.quantity;
        return acc;
      }, {} as Record<string, number>);

      const chartData = Object.entries(wasteByType).map(([cropType, quantity]) => ({
        cropType,
        quantity,
      }));

      setData(chartData);
    });

    return () => unsubscribe();
  }, [user]);


  return (
    <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
      <BarChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="cropType"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <YAxis />
        <Tooltip cursor={false} content={<ChartTooltipContent />} />
        <Bar dataKey="quantity" fill="var(--color-quantity)" radius={8} />
      </BarChart>
    </ChartContainer>
  );
}
