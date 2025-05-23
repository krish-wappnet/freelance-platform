import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();

  if (!user || user.role !== "CLIENT") {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  try {
    const contracts = await prisma.contract.findMany({
      where: {
        clientId: user.id,
      },
      include: {
        freelancer: true,
        bid: true,
        milestones: {
          include: {
            payments: true
          }
        },
      },
    });

    return NextResponse.json(contracts);
  } catch (error) {
    console.error("Error fetching client contracts:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 