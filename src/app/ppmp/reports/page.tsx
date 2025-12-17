'use client';

import { Suspense } from 'react';
import { PPMPReports } from '@/components/ppmp/reports';

export default function PPMPReportsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          PPMP Reports
        </h1>
        <p className="text-muted-foreground mt-2">
          Procurement monitoring reports and analytics
        </p>
      </div>

      <Suspense fallback={<div>Loading reports...</div>}>
        <PPMPReports />
      </Suspense>
    </div>
  );
}
