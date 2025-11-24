import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      email,
      password,
      role, // "CLIENT" || "AGENCY"
      name,
      surname, // for User
      cellphone,
      vatNumber, // for Operator
      telephone, // for Operator
    } = body;

    // validation of required fields
    if (!email || !password || !role) {
      return NextResponse.json({ message: "Missing Data" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { message: "Email already registered." },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
        oauthProvider: "APP", // credentials
        oauthId: null, // for compatibility with schema.prisma
      },
    });

    if (role === "CLIENT" && (!name || !surname || !cellphone)) {
      return NextResponse.json(
        { message: "Missing User data" },
        { status: 400 }
      );
    }

    if (role === "AGENCY" && (!name || !vatNumber || !telephone)) {
      return NextResponse.json(
        { message: "Missing Operator data" },
        { status: 400 }
      );
    }

    // create profile based on role
    if (role === "CLIENT") {
      await prisma.user.create({
        data: {
          name,
          surname,
          cellphone,
          user: {
            connect: { id: newUser.id }, 
          },
        },
      });
    } else if (role === "AGENCY") {
      await prisma.operator.create({
        data: {
          name,
          vatNumber,
          telephone,
          user: {
            connect: { id: newUser.id },
          },
        },
      });
    }

    return NextResponse.json({ message: "User created successfully" });
  } catch (error) {
    console.error("Error during the registration", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
