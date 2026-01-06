'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { WasteReport } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Timestamp } from 'firebase/firestore';

type Props = {
  reports: WasteReport[];
};

const statusColors: Record<WasteReport['status'], string> = {
  'Pending Pickup': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  'In Transit': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  'Delivered': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  'Processing': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  'Recycled': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  'Rejected': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  'Completed': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
};

const formatDate = (date: Date | Timestamp | undefined) => {
  if (!date) return 'N/A';
  const jsDate = date instanceof Timestamp ? date.toDate() : date;
  return formatDistanceToNow(jsDate, { addSuffix: true });
};

export function WasteReportsTable({ reports }: Props) {
  return (
    <div className="overflow-x-auto">
      <Table className="w-full">
        <TableHeader className="bg-slate-50">
          <TableRow className="border-b border-slate-200 hover:bg-slate-50">
            <TableHead className="text-xs font-bold text-slate-700 uppercase tracking-wide py-4">Report ID</TableHead>
            <TableHead className="text-xs font-bold text-slate-700 uppercase tracking-wide py-4">Farmer</TableHead>
            <TableHead className="text-xs font-bold text-slate-700 uppercase tracking-wide py-4">Crop Type</TableHead>
            <TableHead className="text-right text-xs font-bold text-slate-700 uppercase tracking-wide py-4">Quantity (t)</TableHead>
            <TableHead className="text-xs font-bold text-slate-700 uppercase tracking-wide py-4">Status</TableHead>
            <TableHead className="text-xs font-bold text-slate-700 uppercase tracking-wide py-4">Last Update</TableHead>
            <TableHead className="text-xs font-bold text-slate-700 uppercase tracking-wide py-4">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report, index) => (
            <TableRow
              key={report.id}
              className={`border-b border-slate-200 hover:bg-emerald-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}
            >
              <TableCell className="font-mono text-sm text-slate-900 py-4">{report.id.substring(0, 8)}</TableCell>
              <TableCell className="font-medium text-slate-900 py-4">{report.farmerName}</TableCell>
              <TableCell className="text-slate-700 py-4">
                <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 text-sm font-medium">
                  {report.wasteType}
                </span>
              </TableCell>
              <TableCell className="text-right font-semibold text-slate-900 py-4">{report.quantity}</TableCell>
              <TableCell className="py-4">
                <Badge
                  variant="outline"
                  className={cn(
                    'border-transparent text-xs font-semibold',
                    statusColors[report.status]
                  )}
                >
                  {report.status}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-slate-600 py-4">
                {formatDate(report.lastUpdate)}
              </TableCell>
              <TableCell className="py-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button aria-haspopup="true" size="icon" variant="ghost" className="h-8 w-8 hover:bg-slate-100">
                      <MoreHorizontal className="h-4 w-4 text-slate-500" />
                      <span className="sr-only">Toggle menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="text-sm">View Details</DropdownMenuItem>
                    <DropdownMenuItem className="text-sm">Download Report</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
