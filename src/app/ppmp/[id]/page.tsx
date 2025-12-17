'use client';

import React, { Suspense } from 'react';
import { PPMPDetail } from '@/components/ppmp/detail';

interface PPMPDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function PPMPDetailPage({ params }: PPMPDetailPageProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div>Loading PPMP details...</div>}>
        <PPMPDetailWrapper params={params} />
      </Suspense>
    </div>
  );
}

function PPMPDetailWrapper({ params }: PPMPDetailPageProps) {
  const [id, setId] = React.useState<string>('');

  React.useEffect(() => {
    params.then((resolvedParams) => {
      setId(resolvedParams.id);
    });
  }, [params]);

  if (!id) {
    return <div>Loading...</div>;
  }

  return <PPMPDetail id={id} />;
}
