"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminClassesPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/admin');
  }, [router]);

  return null;
}
