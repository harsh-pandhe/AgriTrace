/**
 * Location Service - Handles geolocation and location-based queries
 */

export interface Location {
    latitude: number;
    longitude: number;
    address?: string;
    timestamp?: number;
}

export interface Task {
    id: string;
    location: Location;
    distance?: number; // in km
}

/**
 * Get user's current geolocation
 */
export const getCurrentLocation = (): Promise<Location> => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by your browser'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    timestamp: Date.now(),
                });
            },
            (error) => {
                reject(new Error(`Geolocation error: ${error.message}`));
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );
    });
};

/**
 * Watch user's location in real-time
 */
export const watchLocation = (
    onLocationChange: (location: Location) => void,
    onError?: (error: Error) => void
): number => {
    if (!navigator.geolocation) {
        onError?.(new Error('Geolocation is not supported'));
        return -1;
    }

    return navigator.geolocation.watchPosition(
        (position) => {
            onLocationChange({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                timestamp: Date.now(),
            });
        },
        (error) => {
            onError?.(new Error(`Geolocation error: ${error.message}`));
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
        }
    );
};

/**
 * Stop watching location
 */
export const stopWatchingLocation = (watchId: number): void => {
    if (watchId !== -1) {
        navigator.geolocation.clearWatch(watchId);
    }
};

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
};

/**
 * Filter tasks by proximity to user location
 */
export const filterTasksByProximity = (
    tasks: Task[],
    userLocation: Location,
    radiusKm: number = 10
): Task[] => {
    return tasks
        .map((task) => ({
            ...task,
            distance: calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                task.location.latitude,
                task.location.longitude
            ),
        }))
        .filter((task) => task.distance! <= radiusKm)
        .sort((a, b) => (a.distance || 0) - (b.distance || 0));
};

/**
 * Reverse geocoding (coordinates to address) - Using OpenStreetMap Nominatim
 */
export const getAddressFromCoordinates = async (
    latitude: number,
    longitude: number
): Promise<string> => {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            {
                headers: {
                    'Accept': 'application/json',
                },
            }
        );
        const data = await response.json();
        return data.address?.city || data.address?.town || `${latitude}, ${longitude}`;
    } catch (error) {
        return `${latitude}, ${longitude}`;
    }
};

/**
 * Forward geocoding (address to coordinates) - Using OpenStreetMap Nominatim
 */
export const getCoordinatesFromAddress = async (
    address: string
): Promise<Location | null> => {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
            {
                headers: {
                    'Accept': 'application/json',
                },
            }
        );
        const data = await response.json();
        if (data.length > 0) {
            return {
                latitude: parseFloat(data[0].lat),
                longitude: parseFloat(data[0].lon),
                address: data[0].display_name,
            };
        }
        return null;
    } catch (error) {
        return null;
    }
};
