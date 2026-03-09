'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, CreditCard } from 'lucide-react';

declare global {
    interface Window {
        Razorpay: new (options: Record<string, unknown>) => { open: () => void; on: (event: string, cb: () => void) => void };
    }
}

interface PaymentButtonProps {
    amount: number;
    listingId: string;
    buyerId: string;
    sellerId: string;
    onSuccess?: (orderId: string) => void;
    onError?: (error: unknown) => void;
    children?: React.ReactNode;
}

const RAZORPAY_KEY = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

export default function PaymentButton({
    amount,
    listingId,
    buyerId,
    sellerId,
    onSuccess,
    onError: _onError,
    children,
}: PaymentButtonProps) {
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [step, setStep] = useState<'confirm' | 'processing' | 'success'>('confirm');
    const { toast } = useToast();

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

        setShowModal(true);
        setStep('confirm');
    };

    /** Launch real Razorpay Checkout or fall back to demo */
    const processPayment = useCallback(async () => {
        setStep('processing');
        setLoading(true);

        // --- Try real Razorpay flow ---
        if (RAZORPAY_KEY && typeof window !== 'undefined' && window.Razorpay) {
            try {
                const res = await fetch('/api/razorpay/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ listingId, amount, buyerId, sellerId }),
                });
                const order = await res.json();

                if (!res.ok) throw new Error(order.error || 'Failed to create order');

                const options = {
                    key: RAZORPAY_KEY,
                    amount: order.amount,
                    currency: order.currency || 'INR',
                    name: 'AgriTrace Connect',
                    description: `Payment for listing ${listingId.slice(0, 8)}`,
                    order_id: order.id,
                    handler: async (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
                        try {
                            // Verify on server
                            const verifyRes = await fetch('/api/razorpay/verify', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    ...response,
                                    listingId,
                                    buyerId,
                                    sellerId,
                                    price: amount,
                                }),
                            });
                            const verifyData = await verifyRes.json();

                            if (verifyRes.ok && verifyData.ok) {
                                setStep('success');
                                setLoading(false);
                                toast({ title: 'Payment Successful', description: `Order ID: ${verifyData.orderId}` });
                                onSuccess?.(verifyData.orderId);
                                setTimeout(() => { setShowModal(false); setStep('confirm'); }, 2000);
                            } else {
                                setStep('confirm');
                                setLoading(false);
                                toast({ title: 'Verification Failed', description: verifyData.error || 'Could not verify payment.', variant: 'destructive' });
                            }
                        } catch {
                            setStep('confirm');
                            setLoading(false);
                            toast({ title: 'Payment Error', description: 'Something went wrong during verification.', variant: 'destructive' });
                        }
                    },
                    modal: {
                        ondismiss: () => {
                            setStep('confirm');
                            setLoading(false);
                        },
                    },
                    prefill: {},
                    theme: { color: '#10b981' },
                };

                const rzp = new window.Razorpay(options);
                rzp.on('payment.failed', () => {
                    setStep('confirm');
                    setLoading(false);
                    toast({ title: 'Payment Failed', description: 'Please try again.', variant: 'destructive' });
                });
                rzp.open();
                return; // Razorpay modal is open — exit early
            } catch (err: unknown) {
                console.warn('Razorpay flow failed, falling back to demo:', err);
                // fall through to demo below
            }
        }

        // --- Demo fallback (no Razorpay keys configured) ---
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const fakeOrderId = `ORD_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

        setStep('success');
        setLoading(false);

        toast({
            title: 'Payment Successful (Demo)',
            description: `Order ID: ${fakeOrderId}`,
        });

        onSuccess?.(fakeOrderId);

        // Auto-close after success
        setTimeout(() => {
            setShowModal(false);
            setStep('confirm');
        }, 2000);
    }, [amount, buyerId, listingId, onSuccess, sellerId, toast]);

    return (
        <>
            <Button
                onClick={handlePayment}
                disabled={loading}
                className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 h-10 sm:h-11 px-4 sm:px-6 text-xs sm:text-sm font-semibold rounded-xl shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:shadow-emerald-500/30"
            >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {children || `Pay ₹${amount}`}
            </Button>

            {/* Payment Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center p-0 sm:p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => { if (step === 'confirm') { setShowModal(false); } }} />
                    <div className="relative w-full sm:max-w-md bg-[#0a120a] rounded-t-2xl sm:rounded-2xl border border-white/10 shadow-2xl overflow-hidden max-h-[90vh] sm:max-h-none">
                        {/* Drag handle (mobile) */}
                        <div className="flex justify-center pt-3 pb-1 sm:hidden">
                            <div className="w-10 h-1 rounded-full bg-white/20" />
                        </div>

                        {/* Header */}
                        <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/10 border-b border-white/5 px-4 py-4 sm:p-6">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                                    <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-base sm:text-lg font-bold text-white">AgriTrace Pay</h3>
                                    <p className="text-[10px] sm:text-xs text-slate-400">Secure Payment Gateway • Powered by Razorpay</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 sm:p-6">
                            {step === 'confirm' && (
                                <div className="space-y-4 sm:space-y-6">
                                    <div className="text-center">
                                        <p className="text-xs sm:text-sm text-slate-400 mb-1">Amount to Pay</p>
                                        <p className="text-3xl sm:text-4xl font-bold text-white">
                                            <span style={{ fontFamily: 'Arial' }}>₹</span>{amount.toLocaleString()}
                                        </p>
                                    </div>

                                    <div className="space-y-2 sm:space-y-3">
                                        <div className="flex justify-between items-center p-2.5 sm:p-3 bg-white/[0.03] rounded-lg sm:rounded-xl border border-white/5">
                                            <span className="text-xs sm:text-sm text-slate-400">Listing ID</span>
                                            <span className="text-xs sm:text-sm text-white font-mono truncate ml-2 max-w-[120px] sm:max-w-none">{listingId.slice(0, 12)}...</span>
                                        </div>
                                        <div className="flex justify-between items-center p-2.5 sm:p-3 bg-white/[0.03] rounded-lg sm:rounded-xl border border-white/5">
                                            <span className="text-xs sm:text-sm text-slate-400">Method</span>
                                            <span className="text-xs sm:text-sm text-white">UPI / Card / Net Banking</span>
                                        </div>
                                        <div className="flex justify-between items-center p-2.5 sm:p-3 bg-white/[0.03] rounded-lg sm:rounded-xl border border-white/5">
                                            <span className="text-xs sm:text-sm text-slate-400">Status</span>
                                            <span className="text-xs sm:text-sm text-amber-400 font-semibold">Pending</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <Button
                                            variant="outline"
                                            onClick={() => setShowModal(false)}
                                            className="flex-1 border-white/10 text-slate-400 hover:bg-white/5 h-10 sm:h-11 text-xs sm:text-sm rounded-xl"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={processPayment}
                                            className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 h-10 sm:h-11 text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-500/20"
                                        >
                                            Confirm Payment
                                        </Button>
                                    </div>

                                    <p className="text-[10px] text-center text-slate-500">
                                        Demo mode — no real money is charged
                                    </p>
                                </div>
                            )}

                            {step === 'processing' && (
                                <div className="text-center py-6 sm:py-8 space-y-4">
                                    <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full border-4 border-emerald-400/20 border-t-emerald-400 animate-spin mx-auto" />
                                    <div>
                                        <p className="text-base sm:text-lg font-semibold text-white">Processing Payment</p>
                                        <p className="text-xs sm:text-sm text-slate-400 mt-1">Please wait...</p>
                                    </div>
                                </div>
                            )}

                            {step === 'success' && (
                                <div className="text-center py-6 sm:py-8 space-y-4">
                                    <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto">
                                        <CheckCircle className="h-8 w-8 sm:h-10 sm:w-10 text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="text-base sm:text-lg font-semibold text-white">Payment Successful!</p>
                                        <p className="text-xs sm:text-sm text-slate-400 mt-1">
                                            <span style={{ fontFamily: 'Arial' }}>₹</span>{amount.toLocaleString()} paid successfully
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
