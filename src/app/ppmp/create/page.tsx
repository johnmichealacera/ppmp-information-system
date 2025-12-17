'use client';

import { Suspense } from 'react';
import { PPMPCreationWizard } from '@/components/ppmp/creation-wizard';

export default function CreatePPMPPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Create New PPMP
        </h1>
        <p className="text-muted-foreground mt-2">
          Set up a new Project Procurement Management Plan for your department
        </p>
      </div>

      <Suspense fallback={<div>Loading creation wizard...</div>}>
        <PPMPCreationWizard />
      </Suspense>
    </div>
  );
}
