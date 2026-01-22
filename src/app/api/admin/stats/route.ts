import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-server';

export async function GET() {
  try {
    const usersRef = db.collection('users');
    
    const [farmersSnap, agentsSnap, adminsSnap] = await Promise.all([
      usersRef.where('role', '==', 'FARMER').count().get(),
      usersRef.where('role', '==', 'AGENT').count().get(),
      usersRef.where('role', '==', 'ADMIN').count().get(),
    ]);

    const stats = {
      farmers: farmersSnap.data().count,
      agents: agentsSnap.data().count,
      admins: adminsSnap.data().count,
      totalUsers: farmersSnap.data().count + agentsSnap.data().count + adminsSnap.data().count,
    };

    return NextResponse.json(stats);
  } catch (error: any) {
    console.error('Failed to get admin stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
