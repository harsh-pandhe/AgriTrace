import { NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { db } from '@/lib/firebase-server';

export async function GET() {
  try {
    const usersRef = db.collection('users');
    const snapshot = await usersRef.orderBy('createdAt', 'desc').get();
    
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

export async function PUT(request: Request) {
  try {
    const { userId, name, phone, role } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const userRef = db.collection('users').doc(userId);
    const updateData: Record<string, any> = {};
    
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (role !== undefined) updateData.role = role;
    updateData.updatedAt = FieldValue.serverTimestamp();

    await userRef.update(updateData);

    return NextResponse.json({ success: true, message: 'User updated successfully' });
  } catch (error: any) {
    console.error('Failed to update user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
