'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/hooks/use-firebase';
import { useAuth } from '@/context/auth-context';
import { PhotoUploader } from '@/components/photo-uploader';
import { AlertCircle, Truck } from 'lucide-react';

const deliverySchema = z.object({
    reportId: z.string().min(1, 'Waste report ID is required'),
    recipientName: z.string().min(2, 'Recipient name is required'),
    recipientFacility: z.string().min(2, 'Facility name is required'),
    actualQuantityDelivered: z.coerce
        .number()
        .min(0.1, 'Quantity must be at least 0.1 tons'),
    deliveryLocation: z.string().min(5, 'Location is required'),
    wasteCondition: z.enum(['Good', 'Fair', 'Poor']),
    notes: z.string().max(500).optional(),
});

interface WasteDeliveryFormProps {
    reportId?: string;
    onDeliveryComplete?: (deliveryId: string) => void;
}

export function WasteDeliveryForm({ reportId, onDeliveryComplete }: WasteDeliveryFormProps) {
    const { toast } = useToast();
    const { user } = useAuth();
    const { recordWasteDelivery } = useFirebase();
    const [photos, setPhotos] = useState<string[]>([]);

    const form = useForm<z.infer<typeof deliverySchema>>({
        resolver: zodResolver(deliverySchema),
        defaultValues: {
            reportId: reportId || '',
            recipientName: '',
            recipientFacility: '',
            actualQuantityDelivered: 0,
            deliveryLocation: '',
            wasteCondition: 'Good',
            notes: '',
        },
    });

    async function onSubmit(values: z.infer<typeof deliverySchema>) {
        if (!user) {
            toast({
                variant: 'destructive',
                title: 'Not Authenticated',
                description: 'You must be logged in to record delivery.',
            });
            return;
        }

        if (photos.length === 0) {
            toast({
                variant: 'destructive',
                title: 'No Proof of Delivery',
                description: 'Please upload at least one proof of delivery photo.',
            });
            return;
        }

        try {
            const deliveryData = {
                ...values,
                agentId: user.uid,
                agentName: user.name || user.email,
                photos,
                deliveryDate: new Date().toISOString(),
            };

            const id = await recordWasteDelivery(deliveryData);

            toast({
                title: 'Delivery Recorded!',
                description: `Delivery record (ID: ${id}) created. Waste marked as in transit.`,
            });

            form.reset();
            setPhotos([]);
            onDeliveryComplete?.(id);
        } catch (error) {
            console.error('Error recording delivery:', error);
            toast({
                variant: 'destructive',
                title: 'Recording Failed',
                description: (error as any)?.message || 'Failed to record delivery.',
            });
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Information Card */}
                <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 flex gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-semibold text-blue-900 dark:text-blue-100 text-sm">
                            Waste Delivery Documentation
                        </p>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                            Record the delivery of waste to the recycling facility with proof photos
                        </p>
                    </div>
                </div>

                {/* Waste Report ID */}
                <FormField
                    control={form.control}
                    name="reportId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Waste Report ID</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="e.g., RPT-2024-001"
                                    {...field}
                                    disabled={!!reportId}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Recipient Information */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="recipientName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Facility Contact Person</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., Rajesh Kumar" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="recipientFacility"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Facility Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., Green Earth Recycling" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Delivery Location */}
                <FormField
                    control={form.control}
                    name="deliveryLocation"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Delivery Location</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., Plot 123, Industrial Area, Gujarat" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Actual Quantity Delivered */}
                <FormField
                    control={form.control}
                    name="actualQuantityDelivered"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Actual Quantity Delivered (tons)</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="e.g., 9.5" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Waste Condition at Delivery */}
                <FormField
                    control={form.control}
                    name="wasteCondition"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Waste Condition at Delivery</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Good">Good - No damage or deterioration</SelectItem>
                                    <SelectItem value="Fair">Fair - Minor deterioration acceptable</SelectItem>
                                    <SelectItem value="Poor">Poor - Significant damage or loss</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Additional Notes */}
                <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Delivery Notes</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="e.g., 'Weather conditions', 'Any issues during transport'"
                                    className="resize-none"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Proof of Delivery Photos */}
                <div className="border-2 border-dashed border-blue-200 dark:border-blue-800 rounded-lg p-6 bg-blue-50/50 dark:bg-blue-900/10">
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                        📸 Proof of Delivery
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Upload photos showing the waste delivery at the facility (e.g., weighing scale, facility entrance, waste stack)
                    </p>
                    {user && (
                        <PhotoUploader
                            userId={user.uid}
                            wasteReportId={reportId || 'delivery'}
                            photos={photos}
                            onPhotoAdded={(url) => setPhotos([...photos, url])}
                            onPhotoRemoved={(url) => setPhotos(photos.filter((p) => p !== url))}
                            maxPhotos={6}
                        />
                    )}
                </div>

                {/* Submit Button */}
                <Button
                    type="submit"
                    disabled={form.formState.isSubmitting || photos.length === 0}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2 h-11"
                    aria-busy={form.formState.isSubmitting}
                >
                    <Truck className="mr-2 h-4 w-4" />
                    {form.formState.isSubmitting ? 'Recording Delivery...' : 'Record Waste Delivery'}
                </Button>

                {photos.length === 0 && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                        ⚠️ At least one proof of delivery photo is required
                    </p>
                )}
            </form>
        </Form>
    );
}
