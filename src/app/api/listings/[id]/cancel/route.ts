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
    const { farmerId } = body;

    if (!farmerId) {
      return NextResponse.json(
        { error: 'Farmer ID is required' },
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
    
    // Only allow cancellation if OPEN (or no status) and user is the owner
    if (listing.status && listing.status !== 'OPEN') {
      return NextResponse.json(
        { error: 'Can only cancel listings that are still open' },
        { status: 400 }
      );
    }

    if (listing.sellerId !== farmerId) {
      return NextResponse.json(
        { error: 'Only the listing owner can cancel' },
        { status: 403 }
      );
    }

    await updateDoc(listingRef, {
      status: 'CANCELLED',
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json({ success: true, message: 'Listing cancelled' });
  } catch (error) {
    console.error('Error cancelling listing:', error);
    return NextResponse.json(
      { error: 'Failed to cancel listing' },
      { status: 500 }
    );
  }
}
