import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createOrder } from '@/lib/firebase-service';

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

    // Signature valid — create our order record in Firestore
    const orderId = await createOrder({ listingId, buyerId, sellerId, price });

    return NextResponse.json({ ok: true, orderId });
  } catch (err: any) {
    console.error('Razorpay verify error:', err);
    return NextResponse.json({ error: err?.message || 'Unknown' }, { status: 500 });
  }
}