"use client";

import { useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PERIODS, type PeriodKey } from "@/lib/stats";

export function PeriodTabs({ value }: { value: PeriodKey }) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  return (
    <Tabs
      value={value}
      onValueChange={(next) =>
        startTransition(() => router.push(`${pathname}?periodo=${next}`, { scroll: false }))
      }
      className={pending ? "opacity-60 transition-opacity" : "transition-opacity"}
    >
      <TabsList className="squircle">
        {(Object.keys(PERIODS) as PeriodKey[]).map((key) => (
          <TabsTrigger key={key} value={key} className="squircle text-[13px]">
            {PERIODS[key].label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
