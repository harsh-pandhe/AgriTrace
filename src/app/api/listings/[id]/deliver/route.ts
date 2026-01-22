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
    
    if (listing?.status !== 'IN_TRANSIT') {
      return NextResponse.json(
        { error: 'Listing must be in transit before marking delivered' },
        { status: 400 }
      );
    }

    if (listing?.assignedAgentId !== agentId) {
      return NextResponse.json(
        { error: 'Only the assigned agent can mark as delivered' },
        { status: 403 }
      );
    }

    await listingRef.update({
      status: 'DELIVERED',
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true, message: 'Listing marked as delivered' });
  } catch (error) {
    console.error('Error marking delivered:', error);
    return NextResponse.json(
      { error: 'Failed to mark as delivered' },
      { status: 500 }
    );
  }
}
