'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useFirebase } from '@/hooks/use-firebase';
import { WasteIntakeForm } from '@/components/recycling/waste-intake-form';
import { WasteProcessingForm } from '@/components/recycling/waste-processing-form';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertCircle,
  TrendingUp,
  Package,
  Zap,
  MoreVertical,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RecyclerDashboard() {
  const router = useRouter();
  const { user, userRole } = useAuth();
  const { getRecyclerDashboardStats, getWasteIntakeRecords } =
    useFirebase();

  const [stats, setStats] = useState<any>(null);
  const [intakeRecords, setIntakeRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (userRole !== 'RECYCLER' && userRole !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }

    fetchData();
  }, [user, userRole]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const statsData = await getRecyclerDashboardStats(user?.uid || '');
      setStats(statsData || {});

      // These return queries, not data arrays
      const intakeQuery = getWasteIntakeRecords(user?.uid || '');
      const processingQuery = getProcessingRecords(user?.uid || '');

      // Execute the queries
      const [intakeSnapshot, processingSnapshot] = await Promise.all([
        getDocs(intakeQuery),
        getDocs(processingQuery),
      ]);

      const intakeData = intakeSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const processingData = processingSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setIntakeRecords(intakeData);
      setProcessingRecords(processingData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-green-500 mx-auto" />
          <p className="text-lg font-medium">Loading recycler dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              ♻️ Recycler Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage waste intake, processing, and recycling operations
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="max-w-7xl mx-auto mb-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Waste Received */}
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-green-400 to-green-600"></div>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Waste Received
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stats?.totalWasteReceived || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">tons</p>
                </div>
                <Package className="h-8 w-8 text-green-500/30" />
              </div>
            </CardContent>
          </Card>

          {/* Waste Processed */}
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-400 to-blue-600"></div>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Waste Processed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stats?.totalWasteProcessed || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">tons</p>
                </div>
                <Zap className="h-8 w-8 text-blue-500/30" />
              </div>
            </CardContent>
          </Card>

          {/* Products Generated */}
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-400 to-purple-600"></div>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Products Generated
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stats?.totalProductOutput || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">tons</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500/30" />
              </div>
            </CardContent>
          </Card>

          {/* Processing Rate */}
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-orange-400 to-orange-600"></div>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Processing Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stats?.processingRate || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">%</p>
                </div>
                <div className="h-8 w-8 bg-orange-500/10 rounded-lg"></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="intake" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="intake">Record Intake</TabsTrigger>
            <TabsTrigger value="processing">Record Processing</TabsTrigger>
            <TabsTrigger value="history">Intake History</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Intake Tab */}
          <TabsContent value="intake" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Record New Waste Intake</CardTitle>
                <CardDescription>
                  Document waste received from collection agents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WasteIntakeForm />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Processing Tab */}
          <TabsContent value="processing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Complete Waste Processing</CardTitle>
                <CardDescription>
                  Document the processing of waste into final products
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WasteProcessingForm />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Intake History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Intake Records</CardTitle>
                <CardDescription>
                  History of all waste intake records
                </CardDescription>
              </CardHeader>
              <CardContent>
                {intakeRecords.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No intake records yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-semibold">
                            Report ID
                          </th>
                          <th className="text-left py-3 px-4 font-semibold">
                            Quantity
                          </th>
                          <th className="text-left py-3 px-4 font-semibold">
                            Condition
                          </th>
                          <th className="text-left py-3 px-4 font-semibold">
                            Date
                          </th>
                          <th className="text-right py-3 px-4 font-semibold">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {intakeRecords.map((record: any) => (
                          <tr key={record.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td className="py-3 px-4 font-medium">
                              {record.wasteReportId}
                            </td>
                            <td className="py-3 px-4">{record.actualQuantity} tons</td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-xs font-medium">
                                {record.wasteCondition}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-gray-500">
                              {new Date(
                                record.intakeDate
                              ).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    className="h-8 w-8 p-0"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    View Photos
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Processing Trends */}
              <Card>
                <CardHeader>
                  <CardTitle>Processing Trends</CardTitle>
                  <CardDescription>
                    Monthly waste intake and processing
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={stats?.monthlyTrends || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="received"
                        stroke="#10b981"
                        name="Received (tons)"
                      />
                      <Line
                        type="monotone"
                        dataKey="processed"
                        stroke="#3b82f6"
                        name="Processed (tons)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Processing Methods */}
              <Card>
                <CardHeader>
                  <CardTitle>Processing Methods</CardTitle>
                  <CardDescription>
                    Distribution of processing methods
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stats?.processingMethods || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="method" />
                      <YAxis />
                      <Tooltip />
                      <Bar
                        dataKey="quantity"
                        fill="#10b981"
                        name="Quantity (tons)"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Product Quality Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Product Quality Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(stats?.productsSummary || []).map((product: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <p className="font-medium">{product.type}</p>
                        <p className="text-sm text-gray-500">{product.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{product.quantity} tons</p>
                        <p className="text-xs text-gray-500">{product.methods}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
