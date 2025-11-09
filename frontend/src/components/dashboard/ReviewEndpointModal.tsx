"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Endpoint, reviewsApi } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";
import { Star } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ReviewEndpointModalProps {
  endpoint: Endpoint | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserWallet?: string;
  onReviewSubmitted?: () => void;
}

export function ReviewEndpointModal({
  endpoint,
  open,
  onOpenChange,
  currentUserWallet,
  onReviewSubmitted,
}: ReviewEndpointModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [existingRating, setExistingRating] = useState<number | null>(null);

  useEffect(() => {
    if (open && endpoint && isAuthenticated()) {
      reviewsApi
        .getMyReview(endpoint.id)
        .then((review) => {
          setRating(review.rating);
          setExistingRating(review.rating);
        })
        .catch(() => {
          setRating(0);
          setExistingRating(null);
        });
    }
  }, [open, endpoint]);

  const handleSubmit = async () => {
    if (!endpoint || rating === 0) return;

    if (!isAuthenticated()) {
      toast.error("Please sign in to leave a review");
      return;
    }

    if (currentUserWallet && endpoint.userWallet === currentUserWallet) {
      toast.error("You cannot review your own endpoint");
      return;
    }

    setSubmitting(true);
    try {
      await reviewsApi.createReview({
        endpointId: endpoint.id,
        rating,
      });
      toast.success(existingRating ? "Review updated successfully" : "Review submitted successfully");
      onReviewSubmitted?.();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStar = (index: number) => {
    const isFilled = index <= (hoveredRating || rating);
    return (
      <button
        key={index}
        type="button"
        onMouseEnter={() => setHoveredRating(index)}
        onMouseLeave={() => setHoveredRating(0)}
        onClick={() => setRating(index)}
        className="transition-transform hover:scale-110"
      >
        <Star
          className={`w-12 h-12 ${isFilled
              ? "fill-green-500 text-green-500"
              : "text-gray-300"
            }`}
        />
      </button>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rate Endpoint</DialogTitle>
          <DialogDescription>
            {existingRating
              ? "Update your rating for this endpoint"
              : "Rate your experience with this endpoint"}
          </DialogDescription>
        </DialogHeader>

        {endpoint && (
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="font-medium">{endpoint.name}</p>
              <p className="text-sm text-muted-foreground">
                by @{endpoint.username}
              </p>
            </div>

            <div className="flex justify-center gap-2 py-4">
              {[1, 2, 3, 4, 5].map((index) => renderStar(index))}
            </div>

            {rating > 0 && (
              <p className="text-center text-sm text-muted-foreground">
                {rating === 1 && "Poor"}
                {rating === 2 && "Fair"}
                {rating === 3 && "Good"}
                {rating === 4 && "Very Good"}
                {rating === 5 && "Excellent"}
              </p>
            )}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="hero"
            onClick={handleSubmit}
            disabled={rating === 0 || submitting}
          >
            {submitting ? "Submitting..." : existingRating ? "Update Review" : "Submit Review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

