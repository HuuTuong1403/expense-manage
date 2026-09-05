"use client";

import * as React from "react";
import { BillsTable } from "@/components/bills/bills-table";
import { BillCardList } from "@/components/bills/bill-card-list";
import { BulkActionBar } from "@/components/bills/bulk-action-bar";
import type { BillPlain, CategoryPlain, UserPlain } from "@/lib/types";

export function BillsWorkspace({
  bills,
  filterTotal,
  categories,
  members,
}: {
  bills: BillPlain[];
  filterTotal: number;
  categories: CategoryPlain[];
  members: UserPlain[];
}) {
  const [selected, setSelected] = React.useState<Set<string>>(new Set());

  function toggle(code: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  }

  function toggleAll(checked: boolean) {
    setSelected(checked ? new Set(bills.map((bill) => bill.code)) : new Set());
  }

  return (
    <div className="flex flex-col gap-3">
      <BulkActionBar
        codes={[...selected]}
        filterTotal={filterTotal}
        onClear={() => setSelected(new Set())}
      />
      <BillsTable
        bills={bills}
        selected={selected}
        onToggle={toggle}
        onToggleAll={toggleAll}
        categories={categories}
        members={members}
      />
      <BillCardList
        bills={bills}
        selected={selected}
        onToggle={toggle}
        categories={categories}
        members={members}
      />
    </div>
  );
}
