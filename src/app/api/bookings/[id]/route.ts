import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

// Handles DELETE request to /api/visits/[id]
// Deletes a visit by ID
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        // Check if the user is authenticated
        const session = await auth();
        
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        
        const { id } = params;

        const bookingId = parseInt(id);

        if (!bookingId) {
            throw new Error("Visit ID is required to delete a visit.");
        }

        // Delete the visit from the database
        const visit = await prisma.visit.delete({
            where: { id: bookingId }
        });

        return NextResponse.json({ message: "Visit deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting visit:", error);
        return NextResponse.json({ error: 'Error deleting visit' + error }, { status: 500 });
    }
}