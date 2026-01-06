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
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import type { WasteReport } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/auth-context';

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

const agentUpdateableStatuses: WasteReport['status'][] = [
  'In Transit' as WasteReport['status'],
  'Delivered' as WasteReport['status'],
  'Processing' as WasteReport['status'],
  'Recycled' as WasteReport['status'],
  'Completed' as WasteReport['status'],
];

export function RecyclingDashboardTable({ reports }: Props) {
  const { toast } = useToast();
  const { user } = useAuth();

  const handleStatusUpdate = async (reportId: string, newStatus: WasteReport['status']) => {
    if (!user) return;

    const reportRef = doc(db, 'wasteReports', reportId);
    try {
      const updateData: any = {
        status: newStatus,
        lastUpdate: serverTimestamp(),
      };
      if (newStatus === 'In Transit') {
        updateData.collectionAgent = user.name || user.email;
        updateData.collectionAgentId = user.uid;
      }
      await updateDoc(reportRef, updateData);
      toast({
        title: 'Status Updated',
        description: `Report ${reportId.substring(0, 7)} has been updated to "${newStatus}".`,
      });
    } catch (error) {
      console.error("Error updating status: ", error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Could not update the report status.',
      });
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Report ID</TableHead>
            <TableHead>Farmer</TableHead>
            <TableHead>Crop Type</TableHead>
            <TableHead className="text-right">Quantity (t)</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report) => (
            <TableRow key={report.id}>
              <TableCell className="font-medium">{report.id.substring(0, 7)}...</TableCell>
              <TableCell>{report.farmerName}</TableCell>
              <TableCell>{report.wasteType}</TableCell>
              <TableCell className="text-right">{report.quantity}</TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={cn(
                    'border-transparent',
                    statusColors[report.status]
                  )}
                >
                  {report.status}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button aria-haspopup="true" size="icon" variant="ghost">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Toggle menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>View Shipment Details</DropdownMenuItem>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>Update Status</DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        {agentUpdateableStatuses.map((status) => (
                          <DropdownMenuItem
                            key={status}
                            disabled={report.status === status}
                            onClick={() => handleStatusUpdate(report.id, status)}
                          >
                            {status}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
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
