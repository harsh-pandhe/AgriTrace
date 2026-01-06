'use client';
import React from 'react';
import { WasteReportForm } from '@/components/reporting/waste-report-form';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { Header } from '@/components/layout/header';

export default function ReportingPage() {
  return (
    <div className="bg-slate-50 min-h-screen">
      <SidebarNav />
      <Header />

      <main className="lg:ml-64 mt-16 flex flex-col">
        <div className="flex-1 p-4 sm:p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Page Header */}
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Report Crop Waste</h1>
              <p className="text-slate-600">Fill out the form below to schedule a waste collection. Photos are required for collection agents to assess quantity and condition.</p>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
              <WasteReportForm />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
