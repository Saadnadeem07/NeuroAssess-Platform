"use client";

import { Clock } from "lucide-react";

export function PendingApprovalBanner() {
  return (
    <div className="mb-6 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-amber-100 text-amber-600">
        <Clock className="h-5 w-5" />
      </span>
      <div>
        <p className="font-semibold text-amber-800">Your account is pending approval</p>
        <p className="text-sm text-amber-700">
          An administrator is reviewing your credentials. You&apos;ll be able to accept appointments and message
          patients as soon as you&apos;re approved — we&apos;ll email you.
        </p>
      </div>
    </div>
  );
}
