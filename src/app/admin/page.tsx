'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    PieChart,
    Pie,
    Cell,
} from 'recharts';
import {
    AlertCircle,
    Users,
    Building2,
    TrendingUp,
    MoreVertical,
    Loader2,
    Trash2,
    Edit2,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function AdminDashboard() {
    const router = useRouter();
    const { user, userRole } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [stats, setStats] = useState({
        totalUsers: 0,
        totalFarmers: 0,
        totalAgents: 0,
        totalRecyclers: 0,
        totalWasteReports: 0,
        totalWasteCollected: 0,
        totalWasteRecycled: 0,
    });

    const [users, setUsers] = useState<any[]>([]);
    const [facilities, setFacilities] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }

        if (userRole !== 'ADMIN') {
            router.push('/dashboard');
            return;
        }

        fetchData();
    }, [user, userRole]);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Simulated data - replace with actual API calls
            setStats({
                totalUsers: 2450,
                totalFarmers: 1200,
                totalAgents: 800,
                totalRecyclers: 450,
                totalWasteReports: 3400,
                totalWasteCollected: 45000,
                totalWasteRecycled: 38000,
            });

            setUsers([
                { id: '1', name: 'Rajesh Kumar', email: 'rajesh@example.com', role: 'FARMER', status: 'Active', joinDate: '2024-01-15' },
                { id: '2', name: 'Priya Singh', email: 'priya@example.com', role: 'AGENT', status: 'Active', joinDate: '2024-02-20' },
                { id: '3', name: 'Amit Patel', email: 'amit@example.com', role: 'RECYCLER', status: 'Active', joinDate: '2024-03-10' },
            ]);

            setFacilities([
                { id: '1', name: 'Green Earth Recycling', location: 'Gujarat', capacity: 500, status: 'Active' },
                { id: '2', name: 'EcoProcess Ltd', location: 'Maharashtra', capacity: 300, status: 'Active' },
                { id: '3', name: 'Sustainable Solutions', location: 'Punjab', capacity: 400, status: 'Inactive' },
            ]);
        } catch (err) {
            console.error('Error fetching admin data:', err);
            setError('Failed to load dashboard data. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-orange-500 mx-auto" />
                    <p className="text-lg font-medium">Loading admin dashboard...</p>
                </div>
            </div>
        );
    }

    const filteredUsers = users.filter((u) =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 p-6">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                            ⚙️ Admin Dashboard
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                            Manage platform, users, and facilities
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
                                Total Users
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-end justify-between">
                                <div>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                        {stats.totalUsers.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">Active users</p>
                                </div>
                                <Users className="h-8 w-8 text-blue-500/30" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-green-400 to-green-600"></div>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Total Facilities
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-end justify-between">
                                <div>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                        {stats.totalRecyclers}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">Recycling facilities</p>
                                </div>
                                <Building2 className="h-8 w-8 text-green-500/30" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-400 to-purple-600"></div>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Waste Collected
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-end justify-between">
                                <div>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                        {(stats.totalWasteCollected / 1000).toFixed(1)}K
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">tons</p>
                                </div>
                                <TrendingUp className="h-8 w-8 text-purple-500/30" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-orange-400 to-orange-600"></div>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Waste Recycled
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-end justify-between">
                                <div>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                        {(stats.totalWasteRecycled / 1000).toFixed(1)}K
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">tons</p>
                                </div>
                                <div className="h-8 w-8 bg-orange-500/10 rounded-lg"></div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Tabs */}
                <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 mb-6">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="users">Users</TabsTrigger>
                        <TabsTrigger value="facilities">Facilities</TabsTrigger>
                        <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* User Distribution */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>User Distribution</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={[
                                                    { name: 'Farmers', value: stats.totalFarmers },
                                                    { name: 'Agents', value: stats.totalAgents },
                                                    { name: 'Recyclers', value: stats.totalRecyclers },
                                                ]}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, value }) => `${name}: ${value}`}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                <Cell fill="#10b981" />
                                                <Cell fill="#3b82f6" />
                                                <Cell fill="#a855f7" />
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            {/* Waste Flow */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Waste Processing Flow</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart
                                            data={[
                                                { name: 'Reported', value: stats.totalWasteReports },
                                                { name: 'Collected', value: stats.totalWasteCollected },
                                                { name: 'Recycled', value: stats.totalWasteRecycled },
                                            ]}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="value" fill="#10b981" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Summary Stats */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Platform Summary</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                                        <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Farmers</p>
                                        <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                                            {stats.totalFarmers}
                                        </p>
                                    </div>
                                    <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                                        <p className="text-sm text-green-600 dark:text-green-400 font-medium">Agents</p>
                                        <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                                            {stats.totalAgents}
                                        </p>
                                    </div>
                                    <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                                        <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Recyclers</p>
                                        <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                                            {stats.totalRecyclers}
                                        </p>
                                    </div>
                                    <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                                        <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">Reports</p>
                                        <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                                            {stats.totalWasteReports}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Users Tab */}
                    <TabsContent value="users" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Manage Users</CardTitle>
                                <CardDescription>
                                    View and manage platform users
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Search */}
                                <Input
                                    placeholder="Search by name or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="max-w-sm"
                                />

                                {/* Users Table */}
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left py-3 px-4 font-semibold">Name</th>
                                                <th className="text-left py-3 px-4 font-semibold">Email</th>
                                                <th className="text-left py-3 px-4 font-semibold">Role</th>
                                                <th className="text-left py-3 px-4 font-semibold">Status</th>
                                                <th className="text-left py-3 px-4 font-semibold">Join Date</th>
                                                <th className="text-right py-3 px-4 font-semibold">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredUsers.map((user) => (
                                                <tr key={user.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                                                    <td className="py-3 px-4 font-medium">{user.name}</td>
                                                    <td className="py-3 px-4">{user.email}</td>
                                                    <td className="py-3 px-4">
                                                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs font-medium">
                                                            {user.role}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span
                                                            className={`px-2 py-1 rounded text-xs font-medium ${user.status === 'Active'
                                                                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                                                                }`}
                                                        >
                                                            {user.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-gray-500">
                                                        {new Date(user.joinDate).toLocaleDateString()}
                                                    </td>
                                                    <td className="py-3 px-4 text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                                    <MoreVertical className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem>
                                                                    <Edit2 className="h-4 w-4 mr-2" />
                                                                    Edit User
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem className="text-red-600">
                                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                                    Deactivate
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Facilities Tab */}
                    <TabsContent value="facilities" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Recycling Facilities</CardTitle>
                                <CardDescription>
                                    Manage recycling facilities and capacity
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4">
                                    {facilities.map((facility) => (
                                        <div
                                            key={facility.id}
                                            className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-gray-900 dark:text-white">
                                                        {facility.name}
                                                    </h4>
                                                    <p className="text-sm text-gray-500 mt-1">📍 {facility.location}</p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                                        Capacity: {facility.capacity} tons/month
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-xs font-medium ${facility.status === 'Active'
                                                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                                                            }`}
                                                    >
                                                        {facility.status}
                                                    </span>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem>
                                                                <Edit2 className="h-4 w-4 mr-2" />
                                                                Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem className="text-red-600">
                                                                <Trash2 className="h-4 w-4 mr-2" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Analytics Tab */}
                    <TabsContent value="analytics" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Growth Trends</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={400}>
                                    <LineChart
                                        data={[
                                            { month: 'Jan', users: 100, waste: 500 },
                                            { month: 'Feb', users: 300, waste: 1200 },
                                            { month: 'Mar', users: 600, waste: 2500 },
                                            { month: 'Apr', users: 1000, waste: 5000 },
                                            { month: 'May', users: 1500, waste: 8000 },
                                            { month: 'Jun', users: 2450, waste: 45000 },
                                        ]}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis yAxisId="left" />
                                        <YAxis yAxisId="right" orientation="right" />
                                        <Tooltip />
                                        <Legend />
                                        <Line
                                            yAxisId="left"
                                            type="monotone"
                                            dataKey="users"
                                            stroke="#3b82f6"
                                            name="Users"
                                        />
                                        <Line
                                            yAxisId="right"
                                            type="monotone"
                                            dataKey="waste"
                                            stroke="#10b981"
                                            name="Waste (tons)"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
