import { NextResponse } from 'next/server';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase-server';

export async function GET() {
  try {
    const usersRef = collection(db, 'users');
    const usersQuery = query(usersRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(usersQuery);
    
    const users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error('Failed to get users:', error);
    return NextResponse.json({ error: 'Failed to fetch users', users: [] }, { status: 500 });
  }
}
