'use client';

import React, { useState, useEffect } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, Tooltip } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { format, subDays, startOfDay } from 'date-fns';
import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/auth-context';
import type { WasteReport } from '@/lib/types';

const chartConfig = {
  quantity: {
    label: 'Quantity (tons)',
    color: 'hsl(var(--accent))',
  },
};

export function CollectionOverTimeChart() {
  const { user } = useAuth();
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    const thirtyDaysAgo = subDays(new Date(), 30);
    let q;

    if (user.role === 'FARMER') {
      q = query(
        collection(db, 'wasteReports'),
        where('farmerId', '==', user.uid),
        where('lastUpdate', '>=', thirtyDaysAgo),
        where('status', 'in', ['Completed', 'Processing'])
      );
    } else {
      q = query(
        collection(db, 'wasteReports'),
        where('lastUpdate', '>=', thirtyDaysAgo),
        where('status', 'in', ['Completed', 'Processing'])
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reports = snapshot.docs.map(doc => doc.data() as WasteReport);

      const dailyData = reports.reduce((acc, report) => {
        const date = (report.lastUpdate as Timestamp).toDate();
        const day = format(startOfDay(date), 'yyyy-MM-dd');
        acc[day] = (acc[day] || 0) + report.quantity;
        return acc;
      }, {} as Record<string, number>);

      const chartData = Object.entries(dailyData)
        .map(([date, quantity]) => ({ date, quantity }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      setData(chartData);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
      <AreaChart
        accessibilityLayer
        data={data}
        margin={{
          left: 12,
          right: 12,
        }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => format(new Date(value), 'MMM d')}
        />
        <Tooltip cursor={false} content={<ChartTooltipContent />} />
        <defs>
          <linearGradient id="fillQuantity" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-quantity)"
              stopOpacity={0.8}
            />
            <stop
              offset="95%"
              stopColor="var(--color-quantity)"
              stopOpacity={0.1}
            />
          </linearGradient>
        </defs>
        <Area
          dataKey="quantity"
          type="natural"
          fill="url(#fillQuantity)"
          fillOpacity={0.4}
          stroke="var(--color-quantity)"
          stackId="a"
        />
      </AreaChart>
    </ChartContainer>
  );
}
