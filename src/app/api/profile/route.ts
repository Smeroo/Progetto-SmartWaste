import { auth } from "@/auth"
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// Handles GET requests to /api/profile
// Fetch user data
export async function GET() {
  try {
    // Check if the user is authenticated
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    // Fetch user data based on role
    if (session.user.role === "CLIENT") {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          email: true,
          role: true,
          user: {
            select: {
              name: true,
              surname: true,
              cellphone: true,
              visits: {
                where: {
                  bookingDate: {
                    gt: new Date(), // Only visits after the current day
                  },
                },
                select: {
                  id: true,
                  bookingDate: true,
                  collectionPoint: {
                    select: {
                      id: true,
                      name: true,
                      address: true,
                    }
                  },
                }
              },
            }
          }
        }
      });
      return NextResponse.json(user);
    } else if (session.user.role === "AGENCY") {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          email: true,
          role: true,
          operator: {
            select: {
              userId: true,
              name: true,
              vatNumber: true,
              telephone: true,
              collectionPoints: {
                select: {
                  id: true,
                  name: true,
                  address: true,
                }
              },
            }
          }
        }
      });
      return NextResponse.json(user);
    } else {
      return NextResponse.json({ error: "Invalid user role" }, { status: 400 });
    }

  } catch (error) {
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

// Handles PUT requests to /api/profile
// Update user data
export async function PUT(request: Request) {
  try {
    // Check if the user is authenticated
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    const userData = await request.json();

    // Update user data based on role
    if (session.user.role === "CLIENT") {
      const updatedUser = await prisma.user.update({
        where: { id: session.user.id },
        data: {
          user: {
            update: {
              name: userData.name,
              surname: userData.surname,
              cellphone: userData.cellphone,
            }
          }
        },
        select: {
          email: true,
          role: true,
          user: true
        }
      });
      return NextResponse.json(updatedUser);
    } else if (session.user.role === "AGENCY") {
      const updatedUser = await prisma.user.update({
        where: { id: session.user.id },
        data: {
          operator: {
            update: {
              name: userData.name,
              vatNumber: userData.vatNumber,
              telephone: userData.telephone,
            }
          }
        },
        select: {
          email: true,
          role: true,
          operator: true
        }
      });
      return NextResponse.json(updatedUser, { status: 200 });
    } else {
      return NextResponse.json({ error: "Invalid user role" }, { status: 400 });
    }

  } catch (error) {
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

// Handles DELETE requests to /api/profile
// Delete user account
export async function DELETE() {
  try {
    // Check if the user is authenticated
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    // Delete user account
    await prisma.user.delete({
      where: { id: session.user.id }
    });

    return NextResponse.json({ message: "User account deleted successfully" }, { status: 200 });

  } catch (error) {
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}