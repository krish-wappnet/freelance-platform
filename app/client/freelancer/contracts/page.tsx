import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.config";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import ContractList from "@/components/contracts/contract-list";

export default async function FreelancerContractsPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  const contracts = await prisma.contract.findMany({
    where: {
      freelancerId: session.user.id,
    },
    include: {
      project: {
        select: {
          id: true,
          title: true,
          description: true,
          clientId: true,
          client: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      bid: {
        select: {
          freelancer: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      },
      milestones: {
        select: {
          id: true,
          title: true,
          status: true,
          amount: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Ensure contracts is an array and has the required fields
  const formattedContracts = Array.isArray(contracts) 
    ? contracts
        .filter(contract => contract.bid !== null)
        .map(contract => ({
          ...contract,
          createdAt: contract.createdAt.toISOString(),
          updatedAt: contract.updatedAt.toISOString(),
          bid: contract.bid!,
        }))
    : [];

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">My Contracts</h1>
      <ContractList contracts={formattedContracts} />
    </div>
  );
}
