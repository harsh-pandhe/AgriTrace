'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { NearbyTasks } from '@/components/nearby-tasks';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { WasteDeliveryForm } from '@/components/waste-delivery-form';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import {
    AlertCircle,
    TrendingUp,
    Package,
    Truck,
    MapPin,
    Loader2,
    CheckCircle2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface WasteReport {
    id: string;
    farmerId: string;
    farmerName: string;
    cropType: string;
    quantity: number;
    location: string;
    latitude?: number;
    longitude?: number;
    notes?: string;
    status: string;
    photos?: string[];
    reportedAt?: any;
}

export default function AgentDashboard() {
    const router = useRouter();
    const { user, userRole } = useAuth();

    const [wasteReports, setWasteReports] = useState<WasteReport[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedReport, setSelectedReport] = useState<WasteReport | null>(null);
    const [stats, setStats] = useState({
        totalCollections: 0,
        totalQuantity: 0,
        completedDeliveries: 0,
        pendingDeliveries: 0,
    });

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }

        if (userRole !== 'AGENT') {
            router.push('/dashboard');
            return;
        }

        fetchData();
    }, [user, userRole]);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const reportsRef = collection(db, 'wasteReports');
            const q = query(reportsRef, where('collectionAgentId', '==', user?.uid || ''));

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const reports: WasteReport[] = [];
                let totalQty = 0;

                snapshot.forEach((doc) => {
                    const data = doc.data();
                    reports.push({
                        id: doc.id,
                        farmerId: data.farmerId,
                        farmerName: data.farmerName,
                        cropType: data.cropType,
                        quantity: data.quantity,
                        location: data.location,
                        latitude: data.latitude,
                        longitude: data.longitude,
                        notes: data.notes,
                        status: data.status,
                        photos: data.photos || [],
                        reportedAt: data.reportedAt,
                    });
                    totalQty += data.quantity;
                });

                setWasteReports(reports);
                setStats({
                    totalCollections: reports.length,
                    totalQuantity: totalQty,
                    completedDeliveries: Math.floor(totalQty * 0.6),
                    pendingDeliveries: reports.length,
                });
            },
                (error: any) => {
                    console.error('Error fetching reports:', error);
                    setError('Failed to load waste reports.');
                }
            );

            return () => unsubscribe();
        } catch (err) {
            console.error('Error setting up listener:', err);
            setError('Failed to load dashboard data.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-green-500 mx-auto" />
                    <p className="text-lg font-medium">Loading agent dashboard...</p>
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
                            🚗 Collection Agent Dashboard
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                            Manage waste collections and deliveries
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
                    <Card className="relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-400 to-blue-600"></div>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Assigned Collections
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-end justify-between">
                                <div>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                        {stats.totalCollections}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">active tasks</p>
                                </div>
                                <Package className="h-8 w-8 text-blue-500/30" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-green-400 to-green-600"></div>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Total Waste Assigned
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-end justify-between">
                                <div>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                        {stats.totalQuantity.toFixed(1)}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">tons</p>
                                </div>
                                <TrendingUp className="h-8 w-8 text-green-500/30" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-400 to-purple-600"></div>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Delivered
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-end justify-between">
                                <div>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                        {stats.completedDeliveries}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">tons</p>
                                </div>
                                <CheckCircle2 className="h-8 w-8 text-purple-500/30" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-orange-400 to-orange-600"></div>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Pending Delivery
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-end justify-between">
                                <div>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                        {stats.pendingDeliveries}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">tasks</p>
                                </div>
                                <Truck className="h-8 w-8 text-orange-500/30" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Tabs */}
                <Tabs defaultValue="nearby" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-6">
                        <TabsTrigger value="nearby">
                            <MapPin className="h-4 w-4 mr-2" />
                            Nearby Tasks
                        </TabsTrigger>
                        <TabsTrigger value="assigned">
                            <Package className="h-4 w-4 mr-2" />
                            My Collections
                        </TabsTrigger>
                        <TabsTrigger value="delivery">
                            <Truck className="h-4 w-4 mr-2" />
                            Record Delivery
                        </TabsTrigger>
                    </TabsList>

                    {/* Nearby Tasks Tab */}
                    <TabsContent value="nearby" className="space-y-6">
                        <NearbyTasks
                            tasks={wasteReports}
                            onTaskSelect={(task) => {
                                setSelectedReport(task);
                            }}
                            proximityRadius={10}
                        />
                    </TabsContent>

                    {/* Assigned Collections Tab */}
                    <TabsContent value="assigned" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>My Assigned Collections</CardTitle>
                                <CardDescription>
                                    Waste collections you have accepted
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {wasteReports.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-500">No collections assigned yet</p>
                                        <p className="text-sm text-gray-400 mt-2">
                                            Use the "Nearby Tasks" tab to find and accept collections
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid gap-4">
                                        {wasteReports.map((report) => (
                                            <div
                                                key={report.id}
                                                className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                            >
                                                <div className="flex items-start justify-between mb-3">
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900 dark:text-white">
                                                            {report.cropType} Waste
                                                        </h4>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            From {report.farmerName}
                                                        </p>
                                                    </div>
                                                    <Badge
                                                        className={
                                                            report.status === 'PENDING'
                                                                ? 'bg-yellow-500'
                                                                : report.status === 'IN_TRANSIT'
                                                                    ? 'bg-blue-500'
                                                                    : 'bg-green-500'
                                                        }
                                                    >
                                                        {report.status}
                                                    </Badge>
                                                </div>

                                                <div className="space-y-2 text-sm mb-4">
                                                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                                        <MapPin className="h-4 w-4" />
                                                        {report.location}
                                                    </div>
                                                    <div className="text-gray-700 dark:text-gray-300">
                                                        <strong>Quantity:</strong> {report.quantity} tons
                                                    </div>
                                                    {report.notes && (
                                                        <div className="text-gray-600 dark:text-gray-400">
                                                            <strong>Notes:</strong> {report.notes}
                                                        </div>
                                                    )}
                                                </div>

                                                <Button
                                                    onClick={() => setSelectedReport(report)}
                                                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                                                >
                                                    Record Delivery
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Delivery Recording Tab */}
                    <TabsContent value="delivery" className="space-y-6">
                        {selectedReport ? (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Recording Delivery For</CardTitle>
                                    <CardDescription>
                                        {selectedReport.cropType} waste from {selectedReport.farmerName}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <WasteDeliveryForm
                                        reportId={selectedReport.id}
                                        onDeliveryComplete={() => {
                                            setSelectedReport(null);
                                        }}
                                    />
                                </CardContent>
                            </Card>
                        ) : (
                            <Card>
                                <CardContent className="pt-6 text-center">
                                    <Truck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Select a collection from "My Collections" tab to record delivery
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>
                </Tabs>

                {/* Collection Statistics */}
                <Card className="mt-8">
                    <CardHeader>
                        <CardTitle>Collection Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                                data={[
                                    { name: 'Mon', collected: 2.5, delivered: 2.0 },
                                    { name: 'Tue', collected: 3.2, delivered: 2.8 },
                                    { name: 'Wed', collected: 2.8, delivered: 2.5 },
                                    { name: 'Thu', collected: 4.1, delivered: 3.9 },
                                    { name: 'Fri', collected: 3.5, delivered: 3.2 },
                                    { name: 'Sat', collected: 2.9, delivered: 2.6 },
                                ]}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="collected" fill="#10b981" name="Collected (tons)" />
                                <Bar dataKey="delivered" fill="#3b82f6" name="Delivered (tons)" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
