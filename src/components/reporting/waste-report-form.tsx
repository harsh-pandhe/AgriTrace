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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/hooks/use-firebase';
import { Tractor, MapPin } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { PhotoUploader } from '@/components/photo-uploader';
import { LocationPicker } from '@/components/location-picker';
import { Location } from '@/lib/location-service';

const formSchema = z.object({
  cropType: z.enum(['Wheat', 'Corn', 'Rice', 'Sugarcane', 'Cotton']),
  quantity: z.coerce.number().min(0.1, 'Quantity must be at least 0.1 tons'),
  location: z.string().min(5, 'Please provide a more specific location'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  notes: z.string().max(500, 'Notes are too long').optional(),
});

export function WasteReportForm() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { createReport } = useFirebase();
  const [photos, setPhotos] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location & { address: string } | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quantity: 1,
      location: '',
      notes: '',
      latitude: undefined,
      longitude: undefined,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Not Authenticated',
        description: 'You must be logged in to submit a report.',
      });
      return;
    }

    if (photos.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No Photos',
        description: 'Please upload at least one photo of the waste.',
      });
      return;
    }

    try {
      const reportData = {
        ...values,
        farmerId: user.uid,
        farmerName: user.name || user.email,
        photos,
        latitude: selectedLocation?.latitude,
        longitude: selectedLocation?.longitude,
        address: selectedLocation?.address || values.location,
      };

      const id = await createReport(reportData);

      toast({
        title: 'Report Submitted!',
        description: `Your request (ID: ${id}) for ${values.quantity} tons of ${values.cropType} has been received.`,
      });
      form.reset();
      setPhotos([]);
      setSelectedLocation(null);
    } catch (error) {
      console.error('Error adding document: ', error);
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: (error as any)?.message || 'There was an error submitting your report. Please try again.',
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Info Box */}
        <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 flex gap-3">
          <span className="text-2xl flex-shrink-0">ℹ️</span>
          <div>
            <p className="font-semibold text-blue-900 text-sm">Waste Report Information</p>
            <p className="text-sm text-blue-800 mt-1">Provide accurate details about your agricultural waste. Photos help our collection agents assess quantity and condition.</p>
          </div>
        </div>

        {/* Crop Type and Quantity */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="cropType"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-slate-700">Crop Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="h-11 border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                      <SelectValue placeholder="Select a crop type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Wheat">🌾 Wheat</SelectItem>
                    <SelectItem value="Corn">🌽 Corn</SelectItem>
                    <SelectItem value="Rice">🍚 Rice</SelectItem>
                    <SelectItem value="Sugarcane">🎋 Sugarcane</SelectItem>
                    <SelectItem value="Cotton">☁️ Cotton</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-slate-700">Quantity (in tons)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="10"
                    {...field}
                    className="h-11 border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Location Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-900">📍 Location Details</h3>

          <LocationPicker
            onLocationSelected={(location) => {
              setSelectedLocation(location);
              form.setValue('location', location.address);
              form.setValue('latitude', location.latitude);
              form.setValue('longitude', location.longitude);
            }}
            initialAddress={selectedLocation?.address}
            initialLocation={selectedLocation || undefined}
          />

          {/* Fallback manual location field */}
          {!selectedLocation && (
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-emerald-600" />
                    Collection Address (if not using GPS)
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="123 Farm Road, Green Valley"
                      {...field}
                      className="h-11 border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {/* Photo Upload */}
        <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 bg-slate-50/50 hover:bg-slate-100/50 transition-colors">
          <h3 className="font-semibold text-lg text-slate-900 mb-2 flex items-center gap-2">
            📸 Waste Photos
          </h3>
          <p className="text-sm text-slate-600 mb-6">
            Upload clear photos of the waste to help collection agents assess the quantity and condition. Minimum 1 photo required.
          </p>
          {user && (
            <PhotoUploader
              userId={user.uid}
              wasteReportId="temp"
              photos={photos}
              onPhotoAdded={(url) => setPhotos([...photos, url])}
              onPhotoRemoved={(url) => setPhotos(photos.filter((p) => p !== url))}
              maxPhotos={5}
            />
          )}
        </div>

        {/* Additional Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold text-slate-700">Additional Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g., 'Easy access via main gate', 'Best time to collect: 6-8 AM', 'Waste is stored in shed'"
                  className="resize-none min-h-24 border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Status Message */}
        {photos.length === 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
            <span className="text-xl flex-shrink-0">⚠️</span>
            <div>
              <p className="font-semibold text-red-900 text-sm">Photos Required</p>
              <p className="text-sm text-red-800 mt-1">At least one photo is required to submit your waste report</p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={form.formState.isSubmitting || photos.length === 0}
          className={`w-full py-3 px-6 rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 ${photos.length === 0
              ? 'bg-slate-300 cursor-not-allowed'
              : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg shadow-emerald-200 hover:shadow-emerald-300 active:scale-95'
            }`}
          aria-busy={form.formState.isSubmitting}
        >
          <Tractor className="h-5 w-5" />
          {form.formState.isSubmitting ? 'Submitting...' : 'Schedule Collection'}
        </button>
      </form>
    </Form>
  );
}
