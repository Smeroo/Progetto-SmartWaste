import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { NextResponse, NextRequest } from "next/server";
import { isDateAvailable } from "@/lib/spaceAvailability";

// Handles POST request to /api/visits
// Creates new visits for a collectionPoint for multiple dates
export async function POST(request: NextRequest) {
    try {
        // Check if the user is authenticated
        const session = await auth();
        
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        
        const { bookingDates, spaceId, clientId } = await request.json();

        if (!Array.isArray(bookingDates) || bookingDates.length === 0) {
            return NextResponse.json({ error: "Invalid or no dates selected" }, { status: 400 });
        }

        const createdBookings = [];
        for (const bookingDate of bookingDates) {
            // Check if the visit already exists for the given date and collectionPoint
            const existing = await prisma.visit.findFirst({
                where: {
                    bookingDate: {
                        gte: new Date(new Date(bookingDate).setHours(0, 0, 0, 0)),
                        lte: new Date(new Date(bookingDate).setHours(23, 59, 59, 999))
                    },
                    spaceId: spaceId,
                    clientId: clientId
                }
            });

            if (existing) {
                return NextResponse.json({ error: `Visit already exists for date ${bookingDate}` }, { status: 400 });
            }

            // Double-check availability
            const { available } = await isDateAvailable(parseInt(spaceId), new Date(bookingDate));

            if (!available) {
                return NextResponse.json({ error: `Selected date ${bookingDate} is not available` }, { status: 400 });
            }

            // Create the visit
            const visit = await prisma.visit.create({
                data: {
                    bookingDate: new Date(bookingDate),
                    spaceId: spaceId,
                    clientId: clientId
                }
            });

            // Add the created visit to the list
            createdBookings.push(visit);
        }

        return NextResponse.json({ visits: createdBookings });
    }
    catch (error) {
        console.error("Error creating visits:", error);
        return NextResponse.json({ error: 'Error creating visits: ' + error }, { status: 500 });
    }
}