import { Suspense } from 'react';
import { PPMPDashboard } from '@/components/ppmp/dashboard';
import { Header } from '@/components/layout/header';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Suspense fallback={<div className="flex justify-center py-8">Loading dashboard...</div>}>
          <PPMPDashboard />
        </Suspense>
      </main>
    </div>
  );
}