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
import { CheckCircle, AlertCircle } from 'lucide-react';

const processingSchema = z.object({
    intakeId: z.string().min(1, 'Intake record ID is required'),
    processingMethod: z.enum([
        'Composting',
        'Biogas',
        'Animal Feed',
        'Soil Amendment',
        'Mulching',
        'Other',
    ]),
    outputQuantity: z.coerce.number().min(0.1, 'Output must be at least 0.1 tons'),
    outputType: z.string().min(3, 'Output type is required'),
    processingDuration: z.coerce.number().min(1, 'Processing duration must be at least 1 day'),
    finalProduct: z.string().max(500).optional(),
    certificationDetails: z.string().max(500).optional(),
});

export function WasteProcessingForm({ intakeId }: { intakeId?: string }) {
    const { toast } = useToast();
    const { user } = useAuth();
    const { recordWasteProcessing } = useFirebase();
    const [photos, setPhotos] = useState<string[]>([]);

    const form = useForm<z.infer<typeof processingSchema>>({
        resolver: zodResolver(processingSchema),
        defaultValues: {
            intakeId: intakeId || '',
            processingMethod: 'Composting',
            outputQuantity: 0,
            outputType: '',
            processingDuration: 30,
            finalProduct: '',
            certificationDetails: '',
        },
    });

    async function onSubmit(values: z.infer<typeof processingSchema>) {
        if (!user) {
            toast({
                variant: 'destructive',
                title: 'Not Authenticated',
                description: 'You must be logged in to record waste processing.',
            });
            return;
        }

        if (photos.length === 0) {
            toast({
                variant: 'destructive',
                title: 'No Final Product Photos',
                description: 'Please upload at least one photo of the final processed product.',
            });
            return;
        }

        try {
            const processingData = {
                ...values,
                recyclerId: user.uid,
                recyclerName: user.name || user.email,
                photos,
                completionDate: new Date().toISOString(),
                status: 'RECYCLED',
            };

            const id = await recordWasteProcessing(processingData);

            toast({
                title: 'Processing Complete!',
                description: `Waste processing record (ID: ${id}) has been recorded. Waste marked as recycled.`,
            });

            form.reset();
            setPhotos([]);
        } catch (error) {
            console.error('Error recording processing:', error);
            toast({
                variant: 'destructive',
                title: 'Recording Failed',
                description: (error as any)?.message || 'Failed to record waste processing.',
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
                            Waste Processing Completion
                        </p>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                            Record the completion of waste processing with output details and final product photos
                        </p>
                    </div>
                </div>

                {/* Intake Record ID */}
                <FormField
                    control={form.control}
                    name="intakeId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Intake Record ID</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., INT-2024-001" {...field} disabled={!!intakeId} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Processing Method */}
                <FormField
                    control={form.control}
                    name="processingMethod"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Processing Method</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Composting">Composting</SelectItem>
                                    <SelectItem value="Biogas">Biogas Generation</SelectItem>
                                    <SelectItem value="Animal Feed">Animal Feed Production</SelectItem>
                                    <SelectItem value="Soil Amendment">Soil Amendment</SelectItem>
                                    <SelectItem value="Mulching">Mulching</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Processing Duration */}
                <FormField
                    control={form.control}
                    name="processingDuration"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Processing Duration (days)</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="e.g., 30" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Output Type and Quantity */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="outputType"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Final Product Type</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="e.g., Organic Fertilizer, Biochar"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="outputQuantity"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Output Quantity (tons)</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="e.g., 3.5" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Final Product Description */}
                <FormField
                    control={form.control}
                    name="finalProduct"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Final Product Details</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Describe the final product characteristics, quality, and specifications"
                                    className="resize-none"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Certification Details */}
                <FormField
                    control={form.control}
                    name="certificationDetails"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Certification & Quality Standards</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="e.g., 'ISO 9001 certified', 'Meets BIS standards', 'Third-party tested'"
                                    className="resize-none"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Final Product Photos */}
                <div className="border-2 border-dashed border-green-200 dark:border-green-800 rounded-lg p-6 bg-green-50/50 dark:bg-green-900/10">
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                        📸 Final Product Photos
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Upload photos of the final recycled product for quality verification
                    </p>
                    {user && (
                        <PhotoUploader
                            userId={user.uid}
                            wasteReportId={intakeId || 'processing'}
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
                    {form.formState.isSubmitting ? 'Recording...' : 'Complete Processing & Recycle'}
                </Button>

                {photos.length === 0 && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                        ⚠️ At least one product photo is required
                    </p>
                )}
            </form>
        </Form>
    );
}
