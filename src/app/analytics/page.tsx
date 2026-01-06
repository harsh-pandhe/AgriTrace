'use client';

import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { Header } from '@/components/layout/header';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

export default function AnalyticsDashboard() {
    const [platformData, setPlatformData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPlatformAnalytics();
    }, []);

    const fetchPlatformAnalytics = async () => {
        try {
            const response = await fetch('/api/analytics/platform');
            const data = await response.json();
            setPlatformData(data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-slate-50 min-h-screen">
                <SidebarNav />
                <Header />
                <main className="lg:ml-64 mt-16 flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
                        <p className="mt-4 text-slate-600">Loading analytics...</p>
                    </div>
                </main>
            </div>
        );
    }

    const userDistribution = Object.entries(platformData?.usersByRole || {}).map(([role, count]) => ({
        name: role,
        value: count,
    }));

    return (
        <div className="bg-slate-50 min-h-screen">
            <SidebarNav />
            <Header />

            <main className="lg:ml-64 mt-16 flex flex-col">
                <div className="flex-1 p-4 sm:p-8">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {/* Page Header */}
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Platform Analytics</h1>
                            <p className="text-slate-600 mt-1">Comprehensive insights into platform performance</p>
                        </div>

                        {/* Overview Stats */}
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            {/* Total Users */}
                            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-xl">
                                    <span>👥</span>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-slate-500 uppercase">Total Users</p>
                                    <h3 className="text-xl font-bold text-slate-800">{platformData?.totalUsers || 0}</h3>
                                </div>
                            </div>

                            {/* Waste Reported */}
                            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center text-xl">
                                    <span>📊</span>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-slate-500 uppercase">Waste Reported</p>
                                    <h3 className="text-xl font-bold text-slate-800">{platformData?.wasteMetrics?.totalReported || 0} tons</h3>
                                </div>
                            </div>

                            {/* Waste Collected */}
                            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center text-xl">
                                    <span>✅</span>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-slate-500 uppercase">Waste Collected</p>
                                    <h3 className="text-xl font-bold text-slate-800">{platformData?.wasteMetrics?.totalCollected || 0} tons</h3>
                                    <p className="text-xs text-emerald-600 font-medium">{platformData?.wasteMetrics?.collectionRate || 0}% collection rate</p>
                                </div>
                            </div>

                            {/* Waste Recycled */}
                            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl">
                                    <span>♻️</span>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-slate-500 uppercase">Waste Recycled</p>
                                    <h3 className="text-xl font-bold text-slate-800">{platformData?.wasteMetrics?.totalRecycled || 0} tons</h3>
                                    <p className="text-xs text-emerald-600 font-medium">{platformData?.wasteMetrics?.recyclingRate || 0}% recycling rate</p>
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <Tabs defaultValue="overview" className="space-y-4">
                            <TabsList className="bg-white border border-slate-200 rounded-lg p-1">
                                <TabsTrigger value="overview" className="rounded-md">Overview</TabsTrigger>
                                <TabsTrigger value="users" className="rounded-md">Users</TabsTrigger>
                                <TabsTrigger value="waste" className="rounded-md">Waste Metrics</TabsTrigger>
                                <TabsTrigger value="growth" className="rounded-md">Growth</TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview" className="space-y-4">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* User Distribution */}
                                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                                        <h3 className="text-lg font-bold text-slate-900 mb-4">User Distribution by Role</h3>
                                        <p className="text-sm text-slate-600 mb-6">Breakdown of users across different roles</p>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <PieChart>
                                                <Pie data={userDistribution} cx="50%" cy="50%" labelLine={false} label={(entry) => `${entry.name}: ${entry.value}`} outerRadius={80} fill="#8884d8" dataKey="value">
                                                    {userDistribution.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>

                                    {/* Waste Flow Overview */}
                                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                                        <h3 className="text-lg font-bold text-slate-900 mb-4">Waste Flow Overview</h3>
                                        <p className="text-sm text-slate-600 mb-6">Complete waste management pipeline</p>
                                        <div className="space-y-6">
                                            <div>
                                                <div className="flex justify-between mb-2">
                                                    <span className="text-sm font-medium text-slate-700">Reported</span>
                                                    <span className="text-lg font-bold text-blue-600">{platformData?.wasteMetrics?.totalReported || 0} tons</span>
                                                </div>
                                                <div className="w-full bg-slate-200 rounded-full h-2">
                                                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                                                </div>
                                            </div>

                                            <div>
                                                <div className="flex justify-between mb-2">
                                                    <span className="text-sm font-medium text-slate-700">Collected</span>
                                                    <span className="text-lg font-bold text-emerald-600">{platformData?.wasteMetrics?.totalCollected || 0} tons</span>
                                                </div>
                                                <div className="w-full bg-slate-200 rounded-full h-2">
                                                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${platformData?.wasteMetrics?.collectionRate || 0}%` }}></div>
                                                </div>
                                            </div>

                                            <div>
                                                <div className="flex justify-between mb-2">
                                                    <span className="text-sm font-medium text-slate-700">Recycled</span>
                                                    <span className="text-lg font-bold text-purple-600">{platformData?.wasteMetrics?.totalRecycled || 0} tons</span>
                                                </div>
                                                <div className="w-full bg-slate-200 rounded-full h-2">
                                                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${platformData?.wasteMetrics?.recyclingRate || 0}%` }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="users" className="space-y-4">
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                                    <h3 className="text-lg font-bold text-slate-900 mb-2">User Statistics</h3>
                                    <p className="text-sm text-slate-600 mb-6">Detailed breakdown by role</p>
                                    <ResponsiveContainer width="100%" height={400}>
                                        <BarChart data={userDistribution}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="value" fill="#10b981" name="Users" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </TabsContent>

                            <TabsContent value="waste" className="space-y-4">
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                                    <h3 className="text-lg font-bold text-slate-900 mb-2">Waste Management Efficiency</h3>
                                    <p className="text-sm text-slate-600 mb-6">Track collection and recycling performance</p>
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="space-y-2 p-4 rounded-lg bg-emerald-50 border border-emerald-200">
                                            <p className="text-sm text-emerald-700 font-medium">Collection Rate</p>
                                            <div className="text-3xl font-bold text-emerald-600">
                                                {platformData?.wasteMetrics?.collectionRate || 0}%
                                            </div>
                                            <p className="text-xs text-emerald-600">
                                                {platformData?.wasteMetrics?.totalCollected || 0} / {platformData?.wasteMetrics?.totalReported || 0} tons
                                            </p>
                                        </div>

                                        <div className="space-y-2 p-4 rounded-lg bg-purple-50 border border-purple-200">
                                            <p className="text-sm text-purple-700 font-medium">Recycling Rate</p>
                                            <div className="text-3xl font-bold text-purple-600">
                                                {platformData?.wasteMetrics?.recyclingRate || 0}%
                                            </div>
                                            <p className="text-xs text-purple-600">
                                                {platformData?.wasteMetrics?.totalRecycled || 0} / {platformData?.wasteMetrics?.totalCollected || 0} tons
                                            </p>
                                        </div>

                                        <div className="space-y-2 p-4 rounded-lg bg-blue-50 border border-blue-200">
                                            <p className="text-sm text-blue-700 font-medium">Overall Efficiency</p>
                                            <div className="text-3xl font-bold text-blue-600">
                                                {((platformData?.wasteMetrics?.recyclingRate || 0) * (platformData?.wasteMetrics?.collectionRate || 0) / 100).toFixed(1)}%
                                            </div>
                                            <p className="text-xs text-blue-600">End-to-end conversion</p>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="growth" className="space-y-4">
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                                    <h3 className="text-lg font-bold text-slate-900 mb-2">Platform Growth</h3>
                                    <p className="text-sm text-slate-600 mb-6">User and waste volume trends over time</p>
                                    <ResponsiveContainer width="100%" height={400}>
                                        <LineChart data={platformData?.growthData || []}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                            <XAxis dataKey="month" />
                                            <YAxis yAxisId="left" />
                                            <YAxis yAxisId="right" orientation="right" />
                                            <Tooltip />
                                            <Legend />
                                            <Line yAxisId="left" type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} name="Users" />
                                            <Line yAxisId="right" type="monotone" dataKey="waste" stroke="#10b981" strokeWidth={2} name="Waste (tons)" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </main>
        </div>
    );
}
