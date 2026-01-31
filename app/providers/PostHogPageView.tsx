'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import posthog from 'posthog-js';

export default function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    posthog.capture('$pageview');
  }, [pathname, searchParams]);

  return null;
}
