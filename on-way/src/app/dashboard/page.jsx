"use client";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { user, isLoading, status } = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (status === "unauthenticated") {
        router.push("/login");
        return;
      }

      const role = user?.role || "passenger";
      router.replace(`/dashboard/${role}`);
    }
  }, [user, isLoading, status, router]);

  return (
    <div className="flex h-screen items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-2">
        <span className="loading loading-ring loading-lg text-primary"></span>
        <p className="text-sm font-medium text-zinc-500 animate-pulse">
          Verifying your access...
        </p>
      </div>
    </div>
  );
}