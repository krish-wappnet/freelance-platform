import { Contract } from "@prisma/client";
import Link from "next/link";

interface ContractListProps {
  contracts: (Contract & {
    project: {
      id: string;
      title: string;
      description: string;
      clientId: string;
      client: {
        id: string;
        name: string;
        email: string;
      };
    };
    milestones: {
      id: string;
      title: string;
      status: string;
      amount: number;
    }[];
  })[];
}

export function ContractList({ contracts }: ContractListProps) {
  return (
    <div className="space-y-4">
      {contracts.map((contract) => (
        <div key={contract.id} className="border p-4 rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <Link href={`/contracts/${contract.id}`} className="hover:underline">
                <h3 className="font-semibold text-lg">{contract.project.title}</h3>
              </Link>
              <p className="text-sm text-gray-600 mt-1">
                Client: {contract.project.client.name}
              </p>
              <div className="mt-2">
                <p className="text-sm">
                  Status: <span className="font-medium">{contract.stage}</span>
                </p>
                <p className="text-sm">
                  Amount: <span className="font-medium">${contract.amount}</span>
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">
                {contract.milestones.length} Milestones
              </p>
              <p className="text-sm text-gray-600">
                Created: {new Date(contract.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 