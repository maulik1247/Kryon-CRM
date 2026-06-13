"use client";

import type { Customer } from "@/lib/types";

function chunkIntoPairs(items: string[]): [string, string][] {
  if (items.length === 0) return [];

  const pairs: [string, string][] = [];
  for (let index = 0; index < items.length; index += 2) {
    pairs.push([items[index], items[index + 1] ?? ""]);
  }
  return pairs;
}

function NestedDetailTable({
  title,
  columnHeaders,
  rows,
  emptyMessage = "None added",
}: {
  title: string;
  columnHeaders: [string, string];
  rows: [string, string][];
  emptyMessage?: string;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      <div className="overflow-x-auto overflow-hidden rounded-md border bg-background">
        <table className="w-full min-w-[280px] caption-bottom text-sm">
          <thead className="border-b bg-muted/40">
            <tr>
              <th className="h-9 whitespace-nowrap px-3 text-left align-middle text-xs font-medium text-muted-foreground">
                {columnHeaders[0]}
              </th>
              <th className="h-9 whitespace-nowrap px-3 text-left align-middle text-xs font-medium text-muted-foreground">
                {columnHeaders[1]}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={2}
                  className="px-3 py-3 text-sm text-muted-foreground"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b last:border-0">
                  <td className="max-w-[200px] truncate px-3 py-2 align-middle">
                    {row[0] || "—"}
                  </td>
                  <td className="max-w-[200px] truncate px-3 py-2 align-middle">
                    {row[1] || "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function CustomerExpandedDetails({ customer }: { customer: Customer }) {
  const documents = customer.registrationDocuments.map((doc) => doc.name);

  return (
    <div className="flex flex-col gap-4">
      <NestedDetailTable
        title="Plant Locations"
        columnHeaders={["Plant Location", "Plant Location"]}
        rows={chunkIntoPairs(customer.plantLocations)}
        emptyMessage="No plant locations added"
      />
      <NestedDetailTable
        title="Registration Documents"
        columnHeaders={["Document", "Document"]}
        rows={chunkIntoPairs(documents)}
        emptyMessage="No documents uploaded"
      />
    </div>
  );
}
