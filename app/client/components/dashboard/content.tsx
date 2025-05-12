'use client'

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatsCard } from '@/app/client/components/stats-card';
import { Contract } from '@prisma/client';
import { format } from 'date-fns';
import { useAuth } from '@/lib/client-auth';
import { useRouter } from 'next/navigation';
import { Briefcase, Users, Clock, Calendar, DollarSign } from 'lucide-react';
import FreelancerProjectList from '@/app/client/components/projects/FreelancerProjectList';

interface DashboardContentProps {
  projects: any[];
  contracts: Contract[];
  stats: {
    totalProjects: number;
    totalContracts: number;
    totalEarnings: number;
  };
  role: 'CLIENT' | 'FREELANCER';
}

export default function DashboardContent({
  projects,
  contracts,
  stats,
  role,
}: DashboardContentProps) {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          icon={<Briefcase className="h-4 w-4" />}
          label="Total Projects"
          value={stats.totalProjects}
        />
        <StatsCard
          icon={<Users className="h-4 w-4" />}
          label="Total Contracts"
          value={stats.totalContracts}
        />
        <StatsCard
          icon={<DollarSign className="h-4 w-4" />}
          label="Total Earnings"
          value={`₹${stats.totalEarnings.toLocaleString()}`}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Active Contracts</CardTitle>
            <CardDescription>
              Your current active contracts
            </CardDescription>
          </CardHeader>
          <CardContent>
            {contracts.length === 0 ? (
              <div className="flex items-center justify-center py-6">
                <p className="text-sm text-muted-foreground">
                  No active contracts yet
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {contracts.map((contract) => (
                  <div
                    key={contract.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <h3 className="font-medium">{contract.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {contract.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        ₹{contract.amount.toLocaleString()}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(contract.createdAt), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {role === 'FREELANCER' ? (
          <Card>
            <CardHeader>
              <CardTitle>Available Projects</CardTitle>
              <CardDescription>
                Projects you can bid on
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FreelancerProjectList projects={projects} />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Your Projects</CardTitle>
              <CardDescription>
                Projects you have created
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FreelancerProjectList projects={projects} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
