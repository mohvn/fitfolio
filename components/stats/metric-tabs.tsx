"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function MetricTabs<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as T)}>
      <TabsList variant="line" className="h-7 gap-3 p-0">
        {options.map((o) => (
          <TabsTrigger key={o.value} value={o.value} className="flex-none px-0 text-[13px]">
            {o.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
