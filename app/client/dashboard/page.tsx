'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EarningsDashboard } from '@/components/dashboard/earnings-dashboard';
import ProjectList from '@/components/projects/project-list';
import ContractList from '@/components/contracts/contract-list';
import { Loader2, Briefcase, FileText, Users, Plus } from 'lucide-react';
import { UserRole, ContractStage } from '@prisma/client';
import { Button } from '@/components/ui/button';
import ProjectFormModal from '@/components/projects/project-form-modal';

interface DashboardStats {
  totalProjects: number;
  activeContracts: number;
  totalSpent: number;
}

interface Project {
  id: string;
  title: string;
  description: string;
  budget: number;
  status: string;
  createdAt: string;
}

interface Contract {
  id: string;
  title: string;
  description: string;
  amount: number;
  stage: ContractStage;
  createdAt: string;
  updatedAt: string;
  project: {
    id: string;
    title: string;
  };
  bid: {
    freelancer: {
      id: string;
      name: string;
      avatar: string | null;
    };
  };
  milestones: Array<{
    id: string;
    title: string;
    status: string;
  }>;
}

export default function ClientDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateProject, setShowCreateProject] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, projectsRes, contractsRes] = await Promise.all([
          fetch('/api/client/stats'),
          fetch('/api/projects'),
          fetch('/api/contracts')
        ]);

        if (!statsRes.ok || !projectsRes.ok || !contractsRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const [statsData, projectsData, contractsData] = await Promise.all([
          statsRes.json(),
          projectsRes.json(),
          contractsRes.json()
        ]);

        setStats(statsData);
        setProjects(projectsData);
        setContracts(contractsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <Button onClick={() => setShowCreateProject(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Project
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalProjects || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeContracts || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats?.totalSpent?.toLocaleString() || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="earnings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="contracts">Contracts</TabsTrigger>
        </TabsList>
        <TabsContent value="earnings" className="space-y-4">
          <EarningsDashboard />
        </TabsContent>
        <TabsContent value="projects" className="space-y-4">
          <ProjectList projects={projects} role={UserRole.CLIENT} />
        </TabsContent>
        <TabsContent value="contracts" className="space-y-4">
          <ContractList contracts={contracts} />
        </TabsContent>
      </Tabs>

      <ProjectFormModal
        open={showCreateProject}
        onOpenChange={setShowCreateProject}
        onProjectCreated={(newProject) => {
          setProjects([newProject, ...projects]);
          setStats(prev => prev ? {
            ...prev,
            totalProjects: prev.totalProjects + 1
          } : null);
        }}
      />
    </div>
  );
}