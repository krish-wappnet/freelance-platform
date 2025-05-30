import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const ratingSchema = z.object({
  rating: z.number().min(0.5).max(5).multipleOf(0.5),
  review: z.string().min(10).max(500),
  contractId: z.string(),
  freelancerId: z.string(),
  clientId: z.string(),
});

export async function POST(req: Request) {
  try {
    // Get token from cookies
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return new NextResponse("Unauthorized - No token provided", { status: 401 });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; role: string };
    if (!decoded || decoded.role !== 'CLIENT') {
      return new NextResponse("Unauthorized - Invalid token or role", { status: 401 });
    }

    const body = await req.json();
    const validatedData = ratingSchema.parse(body);

    // Verify that the client ID matches the token
    if (validatedData.clientId !== decoded.id) {
      return new NextResponse("Unauthorized - Client ID mismatch", { status: 401 });
    }

    // Check if a rating already exists for this contract
    const existingRating = await prisma.rating.findFirst({
      where: {
        contractId: validatedData.contractId,
        ratingUserId: validatedData.clientId,
      },
    });

    if (existingRating) {
      return new NextResponse("You have already rated this contract", { status: 400 });
    }

    // Create the rating
    const newRating = await prisma.rating.create({
      data: {
        rating: validatedData.rating,
        review: validatedData.review,
        contractId: validatedData.contractId,
        ratedUserId: validatedData.freelancerId,
        ratingUserId: validatedData.clientId,
      },
    });

    // Calculate and update freelancer's average rating
    const freelancerRatings = await prisma.rating.findMany({
      where: {
        ratedUserId: validatedData.freelancerId,
      },
    });

    const averageRating =
      freelancerRatings.reduce((acc, curr) => acc + curr.rating, 0) /
      freelancerRatings.length;

    await prisma.user.update({
      where: {
        id: validatedData.freelancerId,
      },
      data: {
        averageRating,
      },
    });

    return NextResponse.json(newRating);
  } catch (error) {
    console.error("[RATINGS_POST]", error);
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid rating data", { status: 400 });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return new NextResponse("Invalid token", { status: 401 });
    }
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const freelancerId = searchParams.get('freelancerId');

    if (!freelancerId) {
      return new NextResponse("Freelancer ID is required", { status: 400 });
    }

    const ratings = await prisma.rating.findMany({
      where: { 
        ratedUserId: freelancerId 
      },
      include: {
        ratingUser: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
        contract: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ ratings });
  } catch (error) {
    console.error("[RATINGS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 