import { NextResponse } from 'next/server';
import { collection, query, where, getCountFromServer } from 'firebase/firestore';
import { db } from '@/lib/firebase-server';

export async function GET() {
  try {
    const usersRef = collection(db, 'users');
    const farmersQuery = query(usersRef, where('role', '==', 'FARMER'));
    const agentsQuery = query(usersRef, where('role', '==', 'AGENT'));
    const adminsQuery = query(usersRef, where('role', '==', 'ADMIN'));
    
    const [farmersSnap, agentsSnap, adminsSnap] = await Promise.all([
      getCountFromServer(farmersQuery),
      getCountFromServer(agentsQuery),
      getCountFromServer(adminsQuery),
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
