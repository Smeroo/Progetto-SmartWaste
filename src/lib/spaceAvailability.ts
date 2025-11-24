import { prisma } from '@/lib/prisma';
import { startOfMonth, endOfMonth, format, eachDayOfInterval } from "date-fns";

export async function isDateAvailable(spaceId: number, date: Date): Promise<{ available: boolean, remainingSeats: number }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set the current time to midnight

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    if (startOfDay <= today) {
        return { available: false, remainingSeats: 0 }; // Date is not valid if it's today or in the past
    }

    const collectionPoint = await prisma.collectionPoint.findUnique({
        where: { id: spaceId },
        select: { seats: true, isFullSpaceBooking: true }
    });

    if (!collectionPoint) return { available: false, remainingSeats: 0 };

    const visits = await prisma.visit.findMany({
        where: {
            spaceId,
            bookingDate: { gte: startOfDay, lte: endOfDay }
        }
    });

    const remainingSeats = collectionPoint.isFullSpaceBooking
        ? (visits.length === 0 ? collectionPoint.seats : 0)
        : (collectionPoint.seats - visits.length);

    return { available: remainingSeats > 0, remainingSeats };
}


export async function getMonthlyAvailability(spaceId: number, year: number, month: number) {
    const collectionPoint = await prisma.collectionPoint.findUnique({
        where: { id: spaceId },
        select: { id: true, seats: true, isFullSpaceBooking: true }
    });

    if (!collectionPoint) return null;

    const start = startOfMonth(new Date(year, month - 1));
    const end = endOfMonth(start);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set the current time to midnight

    // Retrieve all visits for the month for that collectionPoint
    const visits = await prisma.visit.findMany({
        where: {
            spaceId,
            bookingDate: {
                gte: start,
                lte: end,
            }
        },
        select: { bookingDate: true }
    });

    // Count visits per day
    const bookingsPerDay: Record<string, number> = {};
    for (const visit of visits) {
        const dateStr = format(visit.bookingDate, "yyyy-MM-dd");
        bookingsPerDay[dateStr] = (bookingsPerDay[dateStr] || 0) + 1;
    }

    // Calculate available days
    const allDays = eachDayOfInterval({ start, end });
    const availableDates: string[] = [];

    for (const day of allDays) {
        if (day <= today) continue; // Exclude dates prior to the current day

        const dateStr = format(day, "yyyy-MM-dd");
        const bookingsCount = bookingsPerDay[dateStr] || 0;

        const isAvailable = collectionPoint.isFullSpaceBooking
            ? bookingsCount === 0
            : bookingsCount < collectionPoint.seats;

        if (isAvailable) {
            availableDates.push(dateStr);
        }
    }

    return availableDates;
}