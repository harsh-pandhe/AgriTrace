import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id: farmerId } = await context.params;

    try {
        if (!farmerId) {
            return NextResponse.json(
                { error: 'Farmer ID is required' },
                { status: 400 }
            );
        }

        const reportsRef = collection(db, 'wasteReports');
        const q = query(reportsRef, where('farmerId', '==', farmerId));
        const snapshot = await getDocs(q);

        let totalWasteReported = 0;
        let totalCollected = 0;
        let reportsThisMonth = 0;
        const reportsByMonth: { [key: string]: number } = {};

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        snapshot.forEach((doc) => {
            const data = doc.data();
            totalWasteReported += data.quantity || 0;

            if (data.status !== 'PENDING') {
                totalCollected += data.quantity || 0;
            }

            const reportDate = data.reportedAt?.toDate?.();
            if (reportDate) {
                if (reportDate.getMonth() === currentMonth && reportDate.getFullYear() === currentYear) {
                    reportsThisMonth++;
                }

                const monthKey = reportDate.toLocaleString('default', { month: 'short' });
                reportsByMonth[monthKey] = (reportsByMonth[monthKey] || 0) + (data.quantity || 0);
            }
        });

        const averageQuantityPerReport = snapshot.size > 0
            ? parseFloat((totalWasteReported / snapshot.size).toFixed(2))
            : 0;

        const totalEarnings = Math.floor(totalCollected * 100);

        const monthlyTrends = Object.entries(reportsByMonth).map(([month, quantity]) => ({
            month,
            quantity: parseFloat(quantity.toFixed(2)),
        }));

        return NextResponse.json({
            totalWasteReported: parseFloat(totalWasteReported.toFixed(2)),
            totalCollected: parseFloat(totalCollected.toFixed(2)),
            totalEarnings,
            averageQuantityPerReport,
            reportsThisMonth,
            totalReports: snapshot.size,
            collectionRate: totalWasteReported > 0
                ? parseFloat(((totalCollected / totalWasteReported) * 100).toFixed(1))
                : 0,
            monthlyTrends,
        });
    } catch (error) {
        console.error('Error fetching farmer analytics:', error);
        return NextResponse.json(
            { error: 'Failed to fetch analytics' },
            { status: 500 }
        );
    }
}
