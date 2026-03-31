import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { db } from '@/lib/firebase-server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { adminId } = body;

    if (!adminId) {
      return NextResponse.json(
        { error: 'Admin ID is required' },
        { status: 400 }
      );
    }

    const listingRef = db.collection('listings').doc(id);
    const listingDoc = await listingRef.get();

    if (!listingDoc.exists) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    const listing = listingDoc.data();
    
    if (listing?.status !== 'DELIVERED') {
      return NextResponse.json(
        { error: 'Listing must be delivered before marking as recycled' },
        { status: 400 }
      );
    }

    await listingRef.update({
      status: 'RECYCLED',
      recycledAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Listing marked as recycled' 
    });
  } catch (error) {
    console.error('Error marking listing as recycled:', error);
    return NextResponse.json(
      { error: 'Failed to mark as recycled' },
      { status: 500 }
    );
  }
}
