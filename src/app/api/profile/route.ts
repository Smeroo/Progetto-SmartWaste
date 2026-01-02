import { auth } from "@/auth"
import { NextResponse } from 'next/server'
import { getUserProfile, updateUserProfile, deleteUserAccount } from '@/services/userService'

// Handles GET requests to /api/profile
export async function GET() {
  try {
    const session = await auth();

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    const user = await getUserProfile(session.user.email);
    return NextResponse.json(user);

  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: error instanceof Error && error.message === "User not found" ? 404 : 500 }
    );
  }
}

// Handles PUT requests to /api/profile
export async function PUT(request: Request) {
  try {
    const session = await auth();

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    const userData = await request.json();
    const updatedUser = await updateUserProfile(session.user.email, userData);
    return NextResponse.json(updatedUser);

  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

// Handles DELETE requests to /api/profile
export async function DELETE() {
  try {
    const session = await auth();

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    await deleteUserAccount(session.user.email);
    return new NextResponse(null, { status: 204 });

  } catch (error) {
    console.error("Error deleting profile:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}