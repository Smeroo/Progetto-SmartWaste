import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import { deleteReview } from '@/services/reviewService';

// Handles DELETE requests to /api/reviews/[id]
// Deletes a review
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        // Check if user is authenticated
        const session = await auth();

        if (!session || !session.user) {
            return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
        }

        if (session.user.role !== 'CLIENT') {
            return NextResponse.json({ error: "User not authorized" }, { status: 403 });
        }
        
        const { id } = params;

        // Convert the ID to a number
        const reviewId = parseInt(params.id);

        if (isNaN(reviewId)) {
            return NextResponse.json(
                { error: 'Invalid ID' },
                { status: 400 }
            );
        }

        await deleteReview(reviewId, session.user.id);
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === 'Review not found') {
                return NextResponse.json({ error: error.message }, { status: 404 });
            }
            if (error.message === 'Not authorized to delete this review') {
                return NextResponse.json({ error: error.message }, { status: 403 });
            }
        }
        return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 });
    }
}