'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FreelancerEarningsDashboard } from '@/components/dashboard/freelancer-earnings-dashboard';
import ProjectList from '@/components/projects/project-list';
import ContractList from '@/components/contracts/contract-list';
import { Loader2, Briefcase, FileText, DollarSign, TrendingUp, Calendar } from 'lucide-react';
import { UserRole, ContractStage } from '@prisma/client';
import { format } from 'date-fns';

interface DashboardStats {
  totalProjects: number;
  activeContracts: number;
  totalEarnings: number;
  monthlyEarnings: number;
  completedProjects: number;
  averageProjectValue: number;
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
  milestones: any[];
}

export default function FreelancerDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, projectsRes, contractsRes] = await Promise.all([
          fetch('/api/freelancer/stats'),
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
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Freelancer Dashboard</h1>
        <div className="text-sm text-muted-foreground">
          Last updated: {format(new Date(), 'PPP')}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalProjects || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.completedProjects || 0} completed
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeContracts || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              In progress
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats?.totalEarnings?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Lifetime earnings
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats?.monthlyEarnings?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="earnings" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="earnings" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Earnings
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Projects
          </TabsTrigger>
          <TabsTrigger value="contracts" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Contracts
          </TabsTrigger>
        </TabsList>
        <TabsContent value="earnings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Earnings Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <FreelancerEarningsDashboard />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <ProjectList projects={projects} role={UserRole.FREELANCER} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="contracts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Contracts</CardTitle>
            </CardHeader>
            <CardContent>
              <ContractList contracts={contracts} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}