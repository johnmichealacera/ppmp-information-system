'use client';

import { Suspense } from 'react';
import { PPMPListView } from '@/components/ppmp/list-view';

export default function PPMPListPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          PPMP List
        </h1>
        <p className="text-muted-foreground mt-2">
          View and manage all Project Procurement Management Plans
        </p>
      </div>

      <Suspense fallback={<div>Loading PPMP list...</div>}>
        <PPMPListView />
      </Suspense>
    </div>
  );
}
