import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import { getReviewsBySpaceId, createReview } from '@/services/reviewService';

// Handles GET requests to /api/reviews?spaceId
// Returns all reviews for a collectionPoint
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const spaceId = searchParams.get('spaceId');

    if (!spaceId) {
        return NextResponse.json({ error: 'spaceId is required' }, { status: 400 });
    }

    try {
        const reviews = await getReviewsBySpaceId(parseInt(spaceId));
        return NextResponse.json(reviews);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
    }
}

// Handles POST requests to /api/reviews
// Creates a new review
export async function POST(request: Request) {
    try {
        // Check if user is authenticated
        const session = await auth();

        if (!session || !session.user) {
            return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
        }

        if (session.user.role !== 'CLIENT') {
            return NextResponse.json({ error: "User not authorized" }, { status: 403 });
        }

        const body = await request.json();
        const { spaceId, userId, rating, comment } = body;

        if (!spaceId || !userId || !rating) {
            return NextResponse.json({ error: 'spaceId, userId, and rating are required' }, { status: 400 });
        }

        const newReview = await createReview({
            spaceId: parseInt(spaceId),
            userId,
            rating: parseInt(rating),
            comment,
        });

        return NextResponse.json(newReview, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
    }
}