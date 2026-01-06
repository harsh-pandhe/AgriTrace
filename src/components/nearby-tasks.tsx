'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatINR } from '@/lib/utils';
import { getCurrentLocation, calculateDistance } from '@/lib/location-service';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TaskWithDistance {
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
    reportedAt?: any;
    estimatedCost?: number;
    distance?: number;
}

interface NearbyTasksProps {
    tasks: TaskWithDistance[];
    onTaskSelect?: (task: TaskWithDistance) => void;
    proximityRadius?: number;
}

export function NearbyTasks({ tasks, onTaskSelect, proximityRadius = 10 }: NearbyTasksProps) {
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [filteredTasks, setFilteredTasks] = useState<TaskWithDistance[]>([]);
    const [searchRadius, setSearchRadius] = useState(proximityRadius);
    const { toast } = useToast();

    const loadUserLocation = async () => {
        try {
            setIsLoading(true);
            const location = await getCurrentLocation();
            setUserLocation(location);

            // Filter tasks by proximity and calculate distances
            const tasksWithDistance = tasks
                .filter((task) => {
                    if (!task.latitude || !task.longitude) return false;
                    const distance = calculateDistance(
                        location.latitude,
                        location.longitude,
                        task.latitude,
                        task.longitude
                    );
                    return distance <= searchRadius;
                })
                .map((task) => ({
                    ...task,
                    distance: calculateDistance(
                        location.latitude,
                        location.longitude,
                        task.latitude || 0,
                        task.longitude || 0
                    ),
                }))
                .sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));

            setFilteredTasks(tasksWithDistance);

            if (tasksWithDistance.length === 0) {
                toast({
                    title: 'No nearby tasks',
                    description: `No waste collection tasks found within ${searchRadius}km`,
                });
            } else {
                toast({
                    title: `Found ${tasksWithDistance.length} nearby tasks`,
                    description: `Sorted by distance from your location`,
                });
            }
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Location access denied',
                description: error instanceof Error ? error.message : 'Unable to access your location',
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (userLocation && tasks.length > 0) {
            loadUserLocation();
        }
    }, [searchRadius]);

    return (
        <div className="space-y-6">
            {/* Location Control Panel */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Navigation className="h-5 w-5" />
                        Find Nearby Collections
                    </CardTitle>
                    <CardDescription>
                        Get your current location and find waste collection tasks near you
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {!userLocation ? (
                        <>
                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    Click the button below to enable location services and find nearby tasks
                                </AlertDescription>
                            </Alert>
                            <Button
                                onClick={loadUserLocation}
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Getting Location...
                                    </>
                                ) : (
                                    <>
                                        <Navigation className="h-4 w-4" />
                                        Get My Location
                                    </>
                                )}
                            </Button>
                        </>
                    ) : (
                        <div className="space-y-4">
                            {/* Current Location Display */}
                            <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4">
                                <p className="text-sm font-semibold text-green-900 dark:text-green-100 mb-2">
                                    ✓ Location Enabled
                                </p>
                                <p className="text-xs text-green-700 dark:text-green-300">
                                    Latitude: {userLocation.latitude.toFixed(6)}, Longitude: {userLocation.longitude.toFixed(6)}
                                </p>
                            </div>

                            {/* Search Radius Control */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Search Radius: {searchRadius}km</label>
                                <input
                                    type="range"
                                    min="1"
                                    max="50"
                                    value={searchRadius}
                                    onChange={(e) => setSearchRadius(Number(e.target.value))}
                                    className="w-full"
                                />
                                <div className="flex gap-2 text-xs">
                                    <Button
                                        size="sm"
                                        variant={searchRadius === 5 ? 'default' : 'outline'}
                                        onClick={() => setSearchRadius(5)}
                                    >
                                        5km
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant={searchRadius === 10 ? 'default' : 'outline'}
                                        onClick={() => setSearchRadius(10)}
                                    >
                                        10km
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant={searchRadius === 25 ? 'default' : 'outline'}
                                        onClick={() => setSearchRadius(25)}
                                    >
                                        25km
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant={searchRadius === 50 ? 'default' : 'outline'}
                                        onClick={() => setSearchRadius(50)}
                                    >
                                        50km
                                    </Button>
                                </div>
                            </div>

                            {/* Refresh Button */}
                            <Button
                                onClick={loadUserLocation}
                                disabled={isLoading}
                                variant="outline"
                                className="w-full"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        Refreshing...
                                    </>
                                ) : (
                                    'Refresh Locations'
                                )}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Nearby Tasks List */}
            {userLocation && (
                <div>
                    <h3 className="text-lg font-semibold mb-4">
                        {filteredTasks.length > 0 ? (
                            <>
                                <Badge className="mr-2 bg-green-500">{filteredTasks.length}</Badge>
                                Nearby Tasks
                            </>
                        ) : (
                            'No Tasks Found'
                        )}
                    </h3>

                    {filteredTasks.length === 0 ? (
                        <Card>
                            <CardContent className="pt-6 text-center">
                                <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-600 dark:text-gray-400">
                                    No waste collection tasks within {searchRadius}km of your location
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                                    Try increasing your search radius or check back later
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4">
                            {filteredTasks.map((task, idx) => (
                                <motion.div
                                    key={task.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <Card
                                        className="hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-green-500"
                                        onClick={() => onTaskSelect?.(task)}
                                    >
                                        <CardContent className="pt-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-lg">{task.cropType} Waste</h3>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        from {task.farmerName}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <Badge className="bg-blue-500 mb-2">
                                                        <Navigation className="h-3 w-3 mr-1" />
                                                        {task.distance?.toFixed(1)}km away
                                                    </Badge>
                                                    <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                                                        {formatINR(task.estimatedCost || 0)}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="space-y-2 text-sm mb-4">
                                                <div className="flex items-start gap-2">
                                                    <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                                                    <span className="text-gray-700 dark:text-gray-300">{task.location}</span>
                                                </div>
                                                <div>
                                                    <p className="text-gray-600 dark:text-gray-400">
                                                        <strong>Quantity:</strong> {task.quantity} tons
                                                    </p>
                                                </div>
                                                {task.notes && (
                                                    <div>
                                                        <p className="text-gray-600 dark:text-gray-400">
                                                            <strong>Notes:</strong> {task.notes}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={() => onTaskSelect?.(task)}
                                                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                                                >
                                                    Accept Collection
                                                </Button>
                                                <Button variant="outline" className="flex-1">
                                                    View Details
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
