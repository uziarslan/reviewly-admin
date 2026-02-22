import React from 'react';
import DashNav from '../components/DashNav';
import Analytics from './Analytics';

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-[#F5F4FF]">
      <DashNav />
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-20 py-6">
        <Analytics />
      </div>
    </div>
  );
}
