"use client"

import { useEffect, useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Activity,
  Briefcase,
  FileText,
  CreditCard,
} from 'lucide-react';
import ProjectFormModal from '@/components/projects/project-form-modal';
import Link from 'next/link';
import ProjectList from '@/components/projects/project-list';
import ContractList from '@/components/contracts/contract-list';
import { Button } from '@/components/ui/button';

interface DashboardContentProps {
  projects: any[];
  contracts: any[];
  stats: {
    totalProjects: number;
    activeProjects: number;
    totalBids: number;
    activeContracts: number;
  };
  role: 'CLIENT' | 'FREELANCER';
}

export default function DashboardContent({ projects, contracts, stats, role }: DashboardContentProps) {
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  const handleProjectCreated = (newProject: any) => {
    // Refresh the projects list or add the new project to the list
    // This will be implemented when we add state management
  };

  return (
    <main className="flex-1 overflow-y-auto p-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              Your active and completed projects
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeProjects}</div>
            <p className="text-xs text-muted-foreground">
              Currently in progress
            </p>
          </CardContent>
        </Card>
        {role === 'CLIENT' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Received Bids</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBids}</div>
              <p className="text-xs text-muted-foreground">
                Across all your projects
              </p>
            </CardContent>
          </Card>
        )}
        {role === 'FREELANCER' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bids</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBids}</div>
              <p className="text-xs text-muted-foreground">
                Across all your projects
              </p>
            </CardContent>
          </Card>
        )}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeContracts}</div>
            <p className="text-xs text-muted-foreground">
              Currently in progress
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="projects" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="projects">Projects</TabsTrigger>
          {role === 'CLIENT' && <TabsTrigger value="bids">Bids</TabsTrigger>}
          <TabsTrigger value="contracts">Contracts</TabsTrigger>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
        </TabsList>
        <TabsContent value="projects" className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recent Projects</h2>
              {role === 'CLIENT' && (
                <Button onClick={() => setIsProjectModalOpen(true)}>
                  Create Project
                </Button>
              )}
              {role === 'FREELANCER' && (
                <Link href="/projects" className="text-sm font-medium text-primary">
                  View all
                </Link>
              )}
            </div>
            <ProjectList projects={projects} role={'CLIENT'} />
          </div>
        </TabsContent>
        {role === 'CLIENT' && (
          <TabsContent value="bids" className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Received Bids</h2>
                <Link href="/client/bids" className="text-sm font-medium text-primary">
                  View all
                </Link>
              </div>
              <ProjectList projects={projects} role={'CLIENT'} />
            </div>
          </TabsContent>
        )}
        <TabsContent value="contracts" className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Active Contracts</h2>
              <Link href={`/client/contracts`} className="text-sm font-medium text-primary">
                View all
              </Link>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Active Contracts</CardTitle>
                <CardDescription>
                  Your current active contracts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ContractList contracts={contracts} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="earnings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Earnings Overview</CardTitle>
              <CardDescription>
                Your earnings and revenue trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ContractList contracts={contracts} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ProjectFormModal 
        open={isProjectModalOpen}
        onOpenChange={setIsProjectModalOpen}
        onProjectCreated={handleProjectCreated}
      />
    </main>
  );
}
