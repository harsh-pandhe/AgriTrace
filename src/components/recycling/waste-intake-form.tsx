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
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/hooks/use-firebase';
import { useAuth } from '@/context/auth-context';
import { PhotoUploader } from '@/components/photo-uploader';
import { CheckCircle, AlertCircle } from 'lucide-react';

const intakeSchema = z.object({
    wasteReportId: z.string().min(1, 'Waste report ID is required'),
    actualQuantity: z.coerce
        .number()
        .min(0.1, 'Quantity must be at least 0.1 tons'),
    wasteCondition: z.enum(['Fresh', 'Partial Decomposition', 'Fully Decomposed']),
    qualityNotes: z.string().max(500).optional(),
});

export function WasteIntakeForm({ wasteReportId }: { wasteReportId?: string }) {
    const { toast } = useToast();
    const { user } = useAuth();
    const { recordWasteIntake } = useFirebase();
    const [photos, setPhotos] = useState<string[]>([]);

    const form = useForm<z.infer<typeof intakeSchema>>({
        resolver: zodResolver(intakeSchema),
        defaultValues: {
            wasteReportId: wasteReportId || '',
            actualQuantity: 0,
            wasteCondition: 'Fresh',
            qualityNotes: '',
        },
    });

    async function onSubmit(values: z.infer<typeof intakeSchema>) {
        if (!user) {
            toast({
                variant: 'destructive',
                title: 'Not Authenticated',
                description: 'You must be logged in to record waste intake.',
            });
            return;
        }

        if (photos.length === 0) {
            toast({
                variant: 'destructive',
                title: 'No Documentation Photos',
                description: 'Please upload at least one photo of the waste received.',
            });
            return;
        }

        try {
            const intakeData = {
                ...values,
                recyclerId: user.uid,
                recyclerName: user.name || user.email,
                photos,
                intakeDate: new Date().toISOString(),
            };

            const id = await recordWasteIntake(intakeData);

            toast({
                title: 'Intake Recorded!',
                description: `Waste intake record (ID: ${id}) created successfully. Processing can now begin.`,
            });

            form.reset();
            setPhotos([]);
        } catch (error) {
            console.error('Error recording intake:', error);
            toast({
                variant: 'destructive',
                title: 'Recording Failed',
                description: (error as any)?.message || 'Failed to record waste intake.',
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
                            Waste Intake Documentation
                        </p>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                            Record the waste received from collection agents with photos and condition assessment
                        </p>
                    </div>
                </div>

                {/* Waste Report ID */}
                <FormField
                    control={form.control}
                    name="wasteReportId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Waste Report ID</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="e.g., RPT-2024-001"
                                    {...field}
                                    disabled={!!wasteReportId}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Actual Quantity Received */}
                <FormField
                    control={form.control}
                    name="actualQuantity"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Actual Quantity Received (tons)</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="e.g., 8.5" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Waste Condition */}
                <FormField
                    control={form.control}
                    name="wasteCondition"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Waste Condition at Intake</FormLabel>
                            <FormControl>
                                <div className="space-y-2">
                                    {['Fresh', 'Partial Decomposition', 'Fully Decomposed'].map(
                                        (condition) => (
                                            <label
                                                key={condition}
                                                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                            >
                                                <input
                                                    type="radio"
                                                    value={condition}
                                                    checked={field.value === condition}
                                                    onChange={(e) => field.onChange(e.target.value)}
                                                    className="h-4 w-4"
                                                />
                                                <span className="font-medium text-sm">{condition}</span>
                                            </label>
                                        )
                                    )}
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Quality Notes */}
                <FormField
                    control={form.control}
                    name="qualityNotes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Quality Assessment Notes</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="e.g., 'Contains significant moisture', 'Mixed with non-compostable materials'"
                                    className="resize-none"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Documentation Photos */}
                <div className="border-2 border-dashed border-green-200 dark:border-green-800 rounded-lg p-6 bg-green-50/50 dark:bg-green-900/10">
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                        📸 Intake Documentation
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Upload photos of the waste at intake for complete documentation and quality assurance
                    </p>
                    {user && (
                        <PhotoUploader
                            userId={user.uid}
                            wasteReportId={wasteReportId || 'intake'}
                            photos={photos}
                            onPhotoAdded={(url) => setPhotos([...photos, url])}
                            onPhotoRemoved={(url) => setPhotos(photos.filter((p) => p !== url))}
                            maxPhotos={8}
                        />
                    )}
                </div>

                {/* Submit Button */}
                <Button
                    type="submit"
                    disabled={form.formState.isSubmitting || photos.length === 0}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-2 h-11"
                    aria-busy={form.formState.isSubmitting}
                >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    {form.formState.isSubmitting ? 'Recording...' : 'Record Waste Intake'}
                </Button>

                {photos.length === 0 && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                        ⚠️ At least one documentation photo is required
                    </p>
                )}
            </form>
        </Form>
    );
}
