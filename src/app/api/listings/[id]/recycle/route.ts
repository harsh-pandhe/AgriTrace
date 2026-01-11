import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
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

    const listingRef = doc(db, 'listings', id);
    const listingDoc = await getDoc(listingRef);

    if (!listingDoc.exists()) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    const listing = listingDoc.data();
    
    if (listing.status !== 'DELIVERED') {
      return NextResponse.json(
        { error: 'Listing must be delivered before marking as recycled' },
        { status: 400 }
      );
    }

    await updateDoc(listingRef, {
      status: 'RECYCLED',
      recycledAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
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
