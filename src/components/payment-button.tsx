'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, CreditCard } from 'lucide-react';

interface PaymentButtonProps {
    amount: number;
    listingId: string;
    buyerId: string;
    sellerId: string;
    onSuccess?: (orderId: string) => void;
    onError?: (error: unknown) => void;
    children?: React.ReactNode;
}

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

    const processPayment = async () => {
        setStep('processing');
        setLoading(true);

        // Simulate payment processing delay
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const fakeOrderId = `ORD_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

        setStep('success');
        setLoading(false);

        toast({
            title: 'Payment Successful',
            description: `Order ID: ${fakeOrderId}`,
        });

        onSuccess?.(fakeOrderId);

        // Auto-close after success
        setTimeout(() => {
            setShowModal(false);
            setStep('confirm');
        }, 2000);
    };

    return (
        <>
            <Button onClick={handlePayment} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {children || `Pay ₹${amount}`}
            </Button>

            {/* Fake Payment Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => { if (step === 'confirm') { setShowModal(false); } }} />
                    <div className="relative w-full max-w-md bg-[#0a120a] rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/10 border-b border-white/5 p-6">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                                    <CreditCard className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">AgriTrace Pay</h3>
                                    <p className="text-xs text-slate-400">Secure Payment Gateway</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6">
                            {step === 'confirm' && (
                                <div className="space-y-6">
                                    <div className="text-center">
                                        <p className="text-sm text-slate-400 mb-1">Amount to Pay</p>
                                        <p className="text-4xl font-bold text-white">
                                            <span style={{ fontFamily: 'Arial' }}>₹</span>{amount.toLocaleString()}
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between p-3 bg-white/[0.03] rounded-xl border border-white/5">
                                            <span className="text-sm text-slate-400">Listing ID</span>
                                            <span className="text-sm text-white font-mono">{listingId.slice(0, 12)}...</span>
                                        </div>
                                        <div className="flex justify-between p-3 bg-white/[0.03] rounded-xl border border-white/5">
                                            <span className="text-sm text-slate-400">Method</span>
                                            <span className="text-sm text-white">UPI / Net Banking</span>
                                        </div>
                                        <div className="flex justify-between p-3 bg-white/[0.03] rounded-xl border border-white/5">
                                            <span className="text-sm text-slate-400">Status</span>
                                            <span className="text-sm text-amber-400 font-semibold">Pending</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <Button
                                            variant="outline"
                                            onClick={() => setShowModal(false)}
                                            className="flex-1 border-white/10 text-slate-400 hover:bg-white/5"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={processPayment}
                                            className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0"
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
                                <div className="text-center py-8 space-y-4">
                                    <div className="h-16 w-16 rounded-full border-4 border-emerald-400/20 border-t-emerald-400 animate-spin mx-auto" />
                                    <div>
                                        <p className="text-lg font-semibold text-white">Processing Payment</p>
                                        <p className="text-sm text-slate-400 mt-1">Please wait...</p>
                                    </div>
                                </div>
                            )}

                            {step === 'success' && (
                                <div className="text-center py-8 space-y-4">
                                    <div className="h-16 w-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto">
                                        <CheckCircle className="h-10 w-10 text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="text-lg font-semibold text-white">Payment Successful!</p>
                                        <p className="text-sm text-slate-400 mt-1">
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
