"use client";

import { format } from "date-fns";

interface MilestoneUpdate {
  id: string;
  description: string;
  createdAt: Date;
}

interface UpdatesListProps {
  updates: MilestoneUpdate[];
}

export function UpdatesList({ updates }: UpdatesListProps) {
  if (!updates.length) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No updates yet
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {updates.map((update) => (
        <div key={update.id} className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-2">
            {format(new Date(update.createdAt), "MMM d, yyyy")}
          </p>
          <p>{update.description}</p>
        </div>
      ))}
    </div>
  );
} 