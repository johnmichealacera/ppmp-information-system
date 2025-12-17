import { Suspense } from 'react';
import { PPMPDashboard } from '@/components/ppmp/dashboard';

export default function PPMPPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          PPMP Information System
        </h1>
        <p className="text-muted-foreground mt-2">
          Project Procurement Management Plan for Municipality of Socorro
        </p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <PPMPDashboard />
      </Suspense>
    </div>
  );
}
