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
    const { agentId, agentEmail } = body;

    console.log('Claim request:', { id, agentId, agentEmail });

    if (!agentId || !agentEmail) {
      console.log('Missing agentId or agentEmail');
      return NextResponse.json(
        { error: 'Agent ID and email are required' },
        { status: 400 }
      );
    }

    const listingRef = doc(db, 'listings', id);
    const listingDoc = await getDoc(listingRef);

    if (!listingDoc.exists()) {
      console.log('Listing not found:', id);
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    const listing = listingDoc.data();
    console.log('Listing status:', listing.status);
    
    // Allow claiming if status is OPEN or undefined (for legacy listings)
    if (listing.status && listing.status !== 'OPEN') {
      return NextResponse.json(
        { error: 'Listing is not available for claiming' },
        { status: 400 }
      );
    }

    await updateDoc(listingRef, {
      status: 'ASSIGNED',
      assignedAgentId: agentId,
      assignedAgentEmail: agentEmail,
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json({ success: true, message: 'Listing claimed successfully' });
  } catch (error) {
    console.error('Error claiming listing:', error);
    return NextResponse.json(
      { error: 'Failed to claim listing' },
      { status: 500 }
    );
  }
}
