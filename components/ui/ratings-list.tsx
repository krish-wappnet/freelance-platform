"use client";

import { Rating } from "@/types";
import { Star } from "lucide-react";
import { format } from "date-fns";

interface RatingsListProps {
  ratings: Rating[];
}

export function RatingsList({ ratings }: RatingsListProps) {
  if (!ratings.length) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No ratings yet
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {ratings.map((rating) => (
        <div key={rating.id} className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < rating.rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {format(new Date(rating.createdAt), "MMM d, yyyy")}
            </span>
          </div>
          {rating.review && (
            <p className="text-sm text-muted-foreground">{rating.review}</p>
          )}
        </div>
      ))}
    </div>
  );
} 