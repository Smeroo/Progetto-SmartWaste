import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import {
  getCollectionPoints,
  createCollectionPoint,
  CollectionPointFilters,
} from '@/services/collectionPointService';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const filters: CollectionPointFilters = {
      typology: searchParams.get('typology') || undefined,
      maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined,
      searchQuery: searchParams.get('q') || undefined,
    };

    const collectionPoints = await getCollectionPoints(filters);
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
    // Check if user is authenticated
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    if (session.user.role !== 'OPERATOR' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "User not authorized" }, { status: 403 });
    }

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

    const collectionPoint = await createCollectionPoint({
      name,
      description,
      operatorId,
      address,
      wasteTypeIds,
      schedule,
      accessibility,
      capacity,
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