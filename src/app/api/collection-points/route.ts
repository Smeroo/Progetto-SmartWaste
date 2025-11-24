import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const collectionPoints = await prisma.collectionPoint.findMany({
      where: {
        isActive: true,
      },
      include: {
        address: true,
        wasteTypes: true,
        schedule: true,
        operator: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(collectionPoints);
  } catch (error) {
    console.error('Error fetching collection points:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collection points' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      name,
      description,
      operatorId,
      address,
      wasteTypeIds,
      schedule,
      accessibility,
      capacity,
    } = body;

    const collectionPoint = await prisma.collectionPoint.create({
      data: {
        name,
        description,
        operatorId,
        accessibility,
        capacity,
        address: address ? {
          create: {
            street: address.street,
            number: address.number,
            city: address.city,
            zip: address.zip,
            country: address.country || 'Italy',
            latitude: address.latitude,
            longitude: address.longitude,
          },
        } : undefined,
        wasteTypes: wasteTypeIds ? {
          connect: wasteTypeIds.map((id: number) => ({ id })),
        } : undefined,
        schedule: schedule ? {
          create: {
            monday: schedule.monday || false,
            tuesday: schedule.tuesday || false,
            wednesday: schedule.wednesday || false,
            thursday: schedule.thursday || false,
            friday: schedule.friday || false,
            saturday: schedule.saturday || false,
            sunday: schedule.sunday || false,
            openingTime: schedule.openingTime,
            closingTime: schedule.closingTime,
            notes: schedule.notes,
            isAlwaysOpen: schedule.isAlwaysOpen || false,
          },
        } : undefined,
      },
      include: {
        address: true,
        wasteTypes: true,
        schedule: true,
      },
    });

    return NextResponse.json(collectionPoint, { status: 201 });
  } catch (error) {
    console.error('Error creating collection point:', error);
    return NextResponse.json(
      { error: 'Failed to create collection point' },
      { status: 500 }
    );
  }
}