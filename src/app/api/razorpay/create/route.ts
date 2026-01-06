import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { listingId, amount, buyerId, sellerId } = body;
    if (!listingId || !amount || !buyerId || !sellerId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const key = process.env.RAZORPAY_KEY_ID;
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key || !secret) {
      return NextResponse.json({ error: 'Razorpay keys not configured' }, { status: 500 });
    }

    const amountPaise = Math.round(Number(amount) * 100);
    const receipt = `rcpt_${Date.now()}`;

    const resp = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(`${key}:${secret}`).toString('base64'),
      },
      body: JSON.stringify({ amount: amountPaise, currency: 'INR', receipt, payment_capture: 1 }),
    });

    const data = await resp.json();
    if (!resp.ok) {
      return NextResponse.json({ error: data.error?.description || 'Failed to create Razorpay order' }, { status: 500 });
    }

    return NextResponse.json({ ...data, key_id: key });
  } catch (err: any) {
    console.error('Razorpay create error:', err);
    return NextResponse.json({ error: err?.message || 'Unknown' }, { status: 500 });
  }
}