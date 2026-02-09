'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

declare global {
    interface Window {
        Razorpay: any;
    }
}

interface PaymentButtonProps {
    amount: number;
    listingId: string;
    buyerId: string;
    sellerId: string;
    onSuccess?: (orderId: string) => void;
    onError?: (error: any) => void;
    children?: React.ReactNode;
}

export default function PaymentButton({
    amount,
    listingId,
    buyerId,
    sellerId,
    onSuccess,
    onError,
    children,
}: PaymentButtonProps) {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePayment = async () => {
        if (!listingId || !buyerId || !sellerId) {
            toast({
                title: 'Payment Error',
                description: 'Missing payment details. Please try again.',
                variant: 'destructive',
            });
            return;
        }

        if (!amount || amount <= 0) {
            toast({
                title: 'Invalid Amount',
                description: 'Payment amount must be greater than zero.',
                variant: 'destructive',
            });
            return;
        }

        setLoading(true);

        try {
            // Load Razorpay script
            const scriptLoaded = await loadRazorpayScript();
            if (!scriptLoaded) {
                throw new Error('Failed to load Razorpay SDK');
            }

            // Create order
            const orderResponse = await fetch('/api/razorpay/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount,
                    listingId,
                    buyerId,
                    sellerId,
                }),
            });

            const orderData = await orderResponse.json();

            if (!orderResponse.ok) {
                throw new Error(orderData.error || 'Failed to create order');
            }

            // Open Razorpay checkout
            const options = {
                key: orderData.key_id,
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'AgriTrace',
                description: 'Payment for agricultural waste collection',
                order_id: orderData.id,
                handler: async function (response: any) {
                    try {
                        // Verify payment
                        const verifyResponse = await fetch('/api/razorpay/verify', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                listingId,
                                buyerId,
                                sellerId,
                                price: amount,
                            }),
                        });

                        const verifyData = await verifyResponse.json();

                        if (verifyResponse.ok && verifyData.ok) {
                            toast({
                                title: 'Payment Successful',
                                description: `Order ID: ${verifyData.orderId}`,
                            });
                            onSuccess?.(verifyData.orderId);
                        } else {
                            throw new Error(verifyData.error || 'Payment verification failed');
                        }
                    } catch (error: any) {
                        toast({
                            title: 'Verification Failed',
                            description: error.message,
                            variant: 'destructive',
                        });
                        onError?.(error);
                    }
                },
                prefill: {
                    name: 'AgriTrace User',
                },
                theme: {
                    color: '#10b981',
                },
            };

            const razorpay = new window.Razorpay(options);
            razorpay.on('payment.failed', function (response: any) {
                toast({
                    title: 'Payment Failed',
                    description: response.error.description,
                    variant: 'destructive',
                });
                onError?.(response.error);
            });

            razorpay.open();
        } catch (error: any) {
            console.error('Payment error:', error);
            toast({
                title: 'Payment Error',
                description: error.message || 'Failed to initiate payment',
                variant: 'destructive',
            });
            onError?.(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button onClick={handlePayment} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {children || `Pay ₹${amount}`}
        </Button>
    );
}
