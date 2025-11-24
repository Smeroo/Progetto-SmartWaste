import { prisma } from '@/lib/prisma';

export async function updateSpaceAvgRating(spaceId: number): Promise<void> {
    try {
        const reviews = await prisma.review.findMany({
            where: {
                spaceId: spaceId,
            },
            select: {
                rating: true
            }
        });

        // Calculate the average of the ratings
        if (reviews.length > 0) {
            const totalRatings = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
            const averageRating = totalRatings / reviews.length;
            
            // Round to 1 decimal place
            const roundedAverage = Math.round(averageRating * 10) / 10;

            // Update the collectionPoint with the new average
            await prisma.collectionPoint.update({
                where: { id: spaceId },
                data: {
                    avgRating: roundedAverage,
                }
            });
        } else {
            // If there are no reviews, set the average to null
            await prisma.collectionPoint.update({
                where: { id: spaceId },
                data: {
                    avgRating: null,
                }
            });
        }
    } catch (error) {
        console.error(`Error updating average rating for collectionPoint ${spaceId}:`, error);
        throw error; // Rethrow the error to handle it in the caller
    }
}