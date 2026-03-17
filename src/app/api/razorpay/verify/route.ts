import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, listingId, buyerId, sellerId, price } = body;
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !listingId || !buyerId || !sellerId || !price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) return NextResponse.json({ error: 'Razorpay secret not configured' }, { status: 500 });

    const expected = crypto.createHmac('sha256', secret).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest('hex');
    if (expected !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Signature valid — create our order record in Firestore using Admin SDK
    try {
      const { db } = await import('@/lib/firebase-server');
      const { FieldValue } = await import('firebase-admin/firestore');

      // 1. Create the order
      const orderPayload = {
        listingId,
        buyerId,
        sellerId,
        price,
        status: 'Pending',
        createdAt: FieldValue.serverTimestamp(),
      };

      const orderRef = await db.collection('orders').add(orderPayload);
      const orderId = orderRef.id;

      // 2. Update the listing document
      await db.collection('listings').doc(listingId).update({
        paymentStatus: 'PAID',
        orderId: orderId,
        updatedAt: FieldValue.serverTimestamp(),
      });

      return NextResponse.json({ ok: true, orderId });
    } catch (dbErr: any) {
      console.error('Firestore operation failed in verify route:', dbErr);
      return NextResponse.json({ error: 'Failed to record transaction' }, { status: 500 });
    }
  } catch (err: any) {
    console.error('Razorpay verify error:', err);
    return NextResponse.json({ error: err?.message || 'Unknown' }, { status: 500 });
  }
}