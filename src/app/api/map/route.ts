import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// Handles GET requests to the /api/map
// Returns all collectionPoints with their coordinates
export async function GET() {
    try {
        // Fetch all collectionPoints with their coordinates
        const collectionPoints = await prisma.collectionPoint.findMany({
            select: {
                id: true,
                name: true,
                address: {
                    select: {
                        street: true,
                        number: true,
                        city: true,
                        latitude: true,
                        longitude: true
                    }
                }
            }
        });

        // Return the collectionPoints as JSON response
        return NextResponse.json(collectionPoints);
    }
    catch (error) {
        // Handle any errors that occur during the fetch
        return NextResponse.json({ error: 'Failed to fetch collectionPoints coordinates' }, { status: 500 });
    }
}