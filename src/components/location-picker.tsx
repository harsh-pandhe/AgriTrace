'use client';

import React, { useState } from 'react';
import { MapPin, Navigation, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    getCurrentLocation,
    getAddressFromCoordinates,
    getCoordinatesFromAddress,
    Location,
} from '@/lib/location-service';
import { useToast } from '@/hooks/use-toast';

interface LocationPickerProps {
    onLocationSelected: (location: Location & { address: string }) => void;
    initialLocation?: Location;
    initialAddress?: string;
}

export function LocationPicker({
    onLocationSelected,
    initialLocation,
    initialAddress,
}: LocationPickerProps) {
    const [location, setLocation] = useState<Location | null>(initialLocation || null);
    const [address, setAddress] = useState<string>(initialAddress || '');
    const [manualAddress, setManualAddress] = useState<string>(initialAddress || '');
    const [isLoading, setIsLoading] = useState(false);
    const [useManualEntry, setUseManualEntry] = useState(!initialLocation);
    const { toast } = useToast();

    // Get current location
    const handleGetCurrentLocation = async () => {
        try {
            setIsLoading(true);
            const currentLocation = await getCurrentLocation();
            setLocation(currentLocation);

            // Get address from coordinates
            const addressFromCoords = await getAddressFromCoordinates(
                currentLocation.latitude,
                currentLocation.longitude
            );
            setAddress(addressFromCoords);
            setManualAddress(addressFromCoords);

            onLocationSelected({
                ...currentLocation,
                address: addressFromCoords,
            });

            toast({
                title: 'Location captured',
                description: 'Your current location has been set',
            });
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Location access denied',
                description:
                    error instanceof Error ? error.message : 'Please enable location access',
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Handle manual address entry
    const handleSearchAddress = async () => {
        if (!manualAddress.trim()) {
            toast({
                variant: 'destructive',
                title: 'Empty address',
                description: 'Please enter an address',
            });
            return;
        }

        try {
            setIsLoading(true);
            const coords = await getCoordinatesFromAddress(manualAddress);

            if (coords) {
                setLocation(coords);
                setAddress(coords.address || manualAddress);

                onLocationSelected({
                    ...coords,
                    address: coords.address || manualAddress,
                });

                toast({
                    title: 'Address found',
                    description: 'Location has been set',
                });
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Address not found',
                    description: 'Please try a different address',
                });
            }
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Search failed',
                description: error instanceof Error ? error.message : 'Failed to search address',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full space-y-4">
            <Label>Location</Label>

            {/* Tab Toggle */}
            <div className="flex gap-2 rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
                <button
                    type="button"
                    onClick={() => setUseManualEntry(false)}
                    className={`flex-1 rounded-md px-4 py-2 font-medium text-sm transition-all ${!useManualEntry
                        ? 'bg-white dark:bg-gray-700 text-green-600 dark:text-green-400 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                        }`}
                >
                    <Navigation className="h-4 w-4 inline mr-2" />
                    Use GPS
                </button>
                <button
                    type="button"
                    onClick={() => setUseManualEntry(true)}
                    className={`flex-1 rounded-md px-4 py-2 font-medium text-sm transition-all ${useManualEntry
                        ? 'bg-white dark:bg-gray-700 text-green-600 dark:text-green-400 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                        }`}
                >
                    <MapPin className="h-4 w-4 inline mr-2" />
                    Manual
                </button>
            </div>

            {/* GPS Location */}
            {!useManualEntry && (
                <div className="space-y-3">
                    <Button
                        type="button"
                        onClick={handleGetCurrentLocation}
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold gap-2"
                    >
                        <Navigation className="h-4 w-4" />
                        {isLoading ? 'Getting Location...' : 'Get Current Location'}
                    </Button>

                    {location && (
                        <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4">
                            <div className="flex items-start gap-3">
                                <MapPin className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-green-900 dark:text-green-100">
                                        {address}
                                    </p>
                                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                                        Latitude: {location.latitude.toFixed(6)}
                                        <br />
                                        Longitude: {location.longitude.toFixed(6)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {!location && (
                        <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 flex gap-3">
                            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                Click the button above to capture your current location using GPS
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Manual Address Entry */}
            {useManualEntry && (
                <div className="space-y-3">
                    <div className="flex gap-2">
                        <Input
                            placeholder="e.g., District, State or City, Pin Code"
                            value={manualAddress}
                            onChange={(e) => setManualAddress(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    handleSearchAddress();
                                }
                            }}
                            className="flex-1 bg-white/[0.04] border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500/50"
                        />
                        <Button
                            type="button"
                            onClick={handleSearchAddress}
                            disabled={isLoading || !manualAddress.trim()}
                            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold px-4"
                        >
                            {isLoading ? 'Searching...' : 'Search'}
                        </Button>
                    </div>

                    {location && (
                        <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4">
                            <div className="flex items-start gap-3">
                                <MapPin className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-green-900 dark:text-green-100">
                                        {address}
                                    </p>
                                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                                        Latitude: {location.latitude.toFixed(6)}
                                        <br />
                                        Longitude: {location.longitude.toFixed(6)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default LocationPicker;
