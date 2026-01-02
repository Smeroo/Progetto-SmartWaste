import { prisma } from '@/lib/prisma';

/**
 * Service layer for CollectionPoint business logic
 * Separates business logic from API route handlers
 */

export interface CollectionPointFilters {
  typology?: string;
  maxPrice?: number;
  searchQuery?: string;
}

export interface CreateCollectionPointData {
  name: string;
  description: string;
  operatorId: string;
  address?: {
    street: string;
    number?: string;
    city: string;
    zip: string;
    country?: string;
    latitude: number;
    longitude: number;
  };
  wasteTypeIds?: number[];
  schedule?: {
    monday?: boolean;
    tuesday?: boolean;
    wednesday?: boolean;
    thursday?: boolean;
    friday?: boolean;
    saturday?: boolean;
    sunday?: boolean;
    openingTime?: string;
    closingTime?: string;
    notes?: string;
    isAlwaysOpen?: boolean;
  };
  accessibility?: string;
  capacity?: string;
}

export interface UpdateCollectionPointData {
  name?: string;
  description?: string;
  address?: {
    street: string;
    number?: string;
    city: string;
    zip: string;
    country?: string;
    latitude: number;
    longitude: number;
  };
  wasteTypeIds?: number[];
  accessibility?: string;
  capacity?: string;
}

/**
 * Get all collection points with optional filters
 */
export async function getCollectionPoints(filters?: CollectionPointFilters) {
  const where: any = {
    isActive: true,
  };

  if (filters?.typology) {
    where.typology = filters.typology;
  }

  if (filters?.maxPrice) {
    where.price = {
      lte: filters.maxPrice,
    };
  }

  if (filters?.searchQuery) {
    const searchQuery = filters.searchQuery.toLowerCase();
    where.OR = [
      { name: { contains: searchQuery, mode: 'insensitive' } },
      {
        address: {
          city: { contains: searchQuery, mode: 'insensitive' },
        },
      },
    ];
  }

  return await prisma.collectionPoint.findMany({
    where,
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
}

/**
 * Get a single collection point by ID
 */
export async function getCollectionPointById(id: number) {
  return await prisma.collectionPoint.findUnique({
    where: { id },
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
  });
}

/**
 * Create a new collection point
 */
export async function createCollectionPoint(data: CreateCollectionPointData) {
  return await prisma.collectionPoint.create({
    data: {
      name: data.name,
      description: data.description,
      operatorId: data.operatorId,
      accessibility: data.accessibility,
      capacity: data.capacity,
      address: data.address
        ? {
            create: {
              street: data.address.street,
              number: data.address.number,
              city: data.address.city,
              zip: data.address.zip,
              country: data.address.country || 'Italy',
              latitude: data.address.latitude,
              longitude: data.address.longitude,
            },
          }
        : undefined,
      wasteTypes: data.wasteTypeIds
        ? {
            connect: data.wasteTypeIds.map((id) => ({ id })),
          }
        : undefined,
      schedule: data.schedule
        ? {
            create: {
              monday: data.schedule.monday || false,
              tuesday: data.schedule.tuesday || false,
              wednesday: data.schedule.wednesday || false,
              thursday: data.schedule.thursday || false,
              friday: data.schedule.friday || false,
              saturday: data.schedule.saturday || false,
              sunday: data.schedule.sunday || false,
              openingTime: data.schedule.openingTime,
              closingTime: data.schedule.closingTime,
              notes: data.schedule.notes,
              isAlwaysOpen: data.schedule.isAlwaysOpen || false,
            },
          }
        : undefined,
    },
    include: {
      address: true,
      wasteTypes: true,
      schedule: true,
    },
  });
}

/**
 * Update an existing collection point
 * Verifies ownership before updating
 */
export async function updateCollectionPoint(
  id: number,
  userId: string,
  data: UpdateCollectionPointData
) {
  // Verify ownership
  const collectionPoint = await prisma.collectionPoint.findUnique({
    where: { id },
    select: { operatorId: true },
  });

  if (!collectionPoint) {
    throw new Error('Collection point not found');
  }

  if (collectionPoint.operatorId !== userId) {
    throw new Error('Not authorized to update this resource');
  }

  // Update the collection point
  return await prisma.collectionPoint.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      accessibility: data.accessibility,
      capacity: data.capacity,
      ...(data.address && {
        address: {
          update: {
            street: data.address.street,
            number: data.address.number,
            city: data.address.city,
            zip: data.address.zip,
            country: data.address.country || 'Italy',
            latitude: data.address.latitude,
            longitude: data.address.longitude,
          },
        },
      }),
      ...(data.wasteTypeIds && {
        wasteTypes: {
          set: data.wasteTypeIds.map((id) => ({ id })),
        },
      }),
    },
    include: {
      address: true,
      wasteTypes: true,
      schedule: true,
    },
  });
}

/**
 * Delete a collection point
 * Verifies ownership before deleting
 */
export async function deleteCollectionPoint(id: number, userId: string) {
  // Verify ownership
  const collectionPoint = await prisma.collectionPoint.findUnique({
    where: { id },
    select: { operatorId: true },
  });

  if (!collectionPoint) {
    throw new Error('Collection point not found');
  }

  if (collectionPoint.operatorId !== userId) {
    throw new Error('Not authorized to delete this resource');
  }

  // Delete the collection point
  await prisma.collectionPoint.delete({
    where: { id },
  });
}
