"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminInsightsPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/admin');
  }, [router]);

  return null;
}
