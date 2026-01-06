import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { calculateDistance } from '@/lib/location-service';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const latitude = parseFloat(searchParams.get('latitude') || '0');
        const longitude = parseFloat(searchParams.get('longitude') || '0');
        const radius = parseFloat(searchParams.get('radius') || '10');

        if (!latitude || !longitude) {
            return NextResponse.json(
                { error: 'Latitude and longitude are required' },
                { status: 400 }
            );
        }

        // Get all pending waste reports
        const reportsRef = collection(db, 'wasteReports');
        const q = query(reportsRef, where('status', '==', 'PENDING'));
        const snapshot = await getDocs(q);

        const tasks: any[] = [];

        snapshot.forEach((doc) => {
            const data = doc.data();
            if (data.latitude && data.longitude) {
                const distance = calculateDistance(
                    latitude,
                    longitude,
                    data.latitude,
                    data.longitude
                );

                if (distance <= radius) {
                    tasks.push({
                        id: doc.id,
                        farmerId: data.farmerId,
                        farmerName: data.farmerName,
                        cropType: data.cropType,
                        quantity: data.quantity,
                        location: data.location,
                        latitude: data.latitude,
                        longitude: data.longitude,
                        distance: parseFloat(distance.toFixed(2)),
                        status: data.status,
                        notes: data.notes,
                        photos: data.photos || [],
                        reportedAt: data.reportedAt?.toDate?.()?.toISOString() || null,
                    });
                }
            }
        });

        // Sort by distance
        tasks.sort((a, b) => a.distance - b.distance);

        return NextResponse.json({
            tasks,
            count: tasks.length,
            radius,
        });
    } catch (error) {
        console.error('Error fetching nearby tasks:', error);
        return NextResponse.json(
            { error: 'Failed to fetch nearby tasks' },
            { status: 500 }
        );
    }
}
