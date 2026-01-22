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
    const { agentId } = body;

    if (!agentId) {
      return NextResponse.json(
        { error: 'Agent ID is required' },
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
    
    if (listing?.status !== 'ASSIGNED') {
      return NextResponse.json(
        { error: 'Listing must be assigned before starting pickup' },
        { status: 400 }
      );
    }

    if (listing?.assignedAgentId !== agentId) {
      return NextResponse.json(
        { error: 'Only the assigned agent can start pickup' },
        { status: 403 }
      );
    }

    await listingRef.update({
      status: 'IN_TRANSIT',
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true, message: 'Pickup started' });
  } catch (error) {
    console.error('Error starting pickup:', error);
    return NextResponse.json(
      { error: 'Failed to start pickup' },
      { status: 500 }
    );
  }
}
