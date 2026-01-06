import React from 'react';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { WasteByTypeChart } from '@/components/dashboard/waste-by-type-chart';
import { CollectionOverTimeChart } from '@/components/dashboard/collection-over-time-chart';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '../ui/button';
import { ArrowRight } from 'lucide-react';

export default function AgentDashboard() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-headline text-3xl font-bold tracking-tight">
        Agent Dashboard
      </h1>

      <StatsCards />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Waste by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <WasteByTypeChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Collection Volume (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <CollectionOverTimeChart />
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Needs Attention</CardTitle>
          <CardDescription>
            View and manage all incoming waste collection reports.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <p className="text-muted-foreground mb-4">There are new reports that require your attention.</p>
           <Button asChild>
             <Link href="/recycling">
               View Assigned Collections <ArrowRight className="ml-2" />
             </Link>
           </Button>
        </CardContent>
      </Card>

    </div>
  );
}
