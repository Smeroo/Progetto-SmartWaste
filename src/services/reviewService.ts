import { prisma } from '@/lib/prisma';
import { updateSpaceAvgRating } from '@/lib/reviewUtils';

/**
 * Service layer for Review business logic
 * Separates business logic from API route handlers
 */

export interface CreateReviewData {
  spaceId: number;
  userId: string;
  rating: number;
  comment?: string;
}

/**
 * Get all reviews for a specific collection point
 */
export async function getReviewsBySpaceId(spaceId: number) {
  return await prisma.review.findMany({
    where: { spaceId },
  });
}

/**
 * Create a new review
 */
export async function createReview(data: CreateReviewData) {
  // Create the review
  const newReview = await prisma.review.create({
    data: {
      spaceId: data.spaceId,
      userId: data.userId,
      rating: data.rating,
      comment: data.comment || null,
    },
  });

  // Update the average rating for the collection point
  await updateSpaceAvgRating(newReview.spaceId);

  return newReview;
}

/**
 * Delete a review
 * Verifies ownership before deleting
 */
export async function deleteReview(id: number, userId: string) {
  // Verify ownership
  const review = await prisma.review.findUnique({
    where: { id },
    select: { userId: true, spaceId: true },
  });

  if (!review) {
    throw new Error('Review not found');
  }

  if (review.userId !== userId) {
    throw new Error('Not authorized to delete this review');
  }

  // Delete the review
  await prisma.review.delete({
    where: { id },
  });

  // Update the average rating of the associated collection point
  await updateSpaceAvgRating(review.spaceId);
}

/**
 * Check if a user has already reviewed a collection point
 */
export async function checkExistingReview(spaceId: number, userId: string) {
  return await prisma.review.findFirst({
    where: {
      spaceId,
      userId,
    },
  });
}
