'use client';

import { Suspense } from 'react';
import { PPMPApprovalsQueue } from '@/components/ppmp/approvals-queue';

export default function PPMPApprovalsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          PPMP Approvals
        </h1>
        <p className="text-muted-foreground mt-2">
          Review and approve submitted Project Procurement Management Plans
        </p>
      </div>

      <Suspense fallback={<div>Loading approvals queue...</div>}>
        <PPMPApprovalsQueue />
      </Suspense>
    </div>
  );
}
