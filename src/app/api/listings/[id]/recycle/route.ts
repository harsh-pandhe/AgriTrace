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

    // Record carbon credits for the farmer
    const wasteType = listing?.category || 'Other';
    const quantity = listing?.quantity || 0;
    const CARBON_FACTORS: Record<string, number> = {
      'Rice Husk': 1320, 'Rice Residue': 1280, 'Wheat Stubble': 1150,
      'Sugarcane Bagasse': 980, 'Cotton Stalks': 1050, 'Corn Stover': 1100,
      'Paddy Straw': 1300, 'Coconut Shell': 1400, 'Groundnut Shell': 1200,
      'Mustard Stalks': 1080, 'Other': 1000,
    };
    const carbonOffsetKg = (CARBON_FACTORS[wasteType] || 1000) * quantity;

    if (listing?.sellerId && quantity > 0) {
      // Carbon credit for the farmer
      await db.collection('carbonCredits').add({
        userId: listing.sellerId,
        userRole: 'farmer',
        listingId: id,
        wasteType,
        quantityMT: quantity,
        carbonOffsetKg,
        creditDate: FieldValue.serverTimestamp(),
        status: 'verified',
      });

      // Reward for the farmer
      await db.collection('rewards').add({
        userId: listing.sellerId,
        type: 'carbon_offset',
        title: `${carbonOffsetKg.toFixed(1)} kg CO₂ offset`,
        description: `${quantity} MT of ${wasteType} recycled`,
        points: Math.round(carbonOffsetKg),
        earnedAt: FieldValue.serverTimestamp(),
        redeemed: false,
      });

      // Reward for the agent too
      if (listing?.assignedAgentId) {
        await db.collection('rewards').add({
          userId: listing.assignedAgentId,
          type: 'carbon_offset',
          title: `Collected ${quantity} MT`,
          description: `Pickup & delivery of ${wasteType}`,
          points: Math.round(carbonOffsetKg * 0.3),
          earnedAt: FieldValue.serverTimestamp(),
          redeemed: false,
        });
      }
    }

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
