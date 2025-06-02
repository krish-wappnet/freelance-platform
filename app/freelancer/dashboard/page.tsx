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
import { Skeleton } from '@/components/ui/skeleton';

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
      <div className="flex-1 space-y-8 p-8 pt-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[80px] mb-2" />
                <Skeleton className="h-4 w-[120px]" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 md:space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Freelancer Dashboard</h1>
        <div className="text-sm text-muted-foreground">
          Last updated: {format(new Date(), 'PPP')}
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <Briefcase className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{stats?.totalProjects || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.completedProjects || 0} completed
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
            <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeContracts || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              In progress
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats?.totalEarnings?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Lifetime earnings
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600 dark:text-orange-400" />
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
        <div className="relative">
          <TabsList className="w-full grid grid-cols-3 h-auto p-1 bg-muted/50 rounded-lg">
            <TabsTrigger 
              value="earnings" 
              className="flex flex-col items-center justify-center gap-1.5 py-3 px-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md transition-all"
            >
              <DollarSign className="h-5 w-5" />
              <span className="text-xs font-medium">Earnings</span>
            </TabsTrigger>
            <TabsTrigger 
              value="projects" 
              className="flex flex-col items-center justify-center gap-1.5 py-3 px-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md transition-all"
            >
              <Briefcase className="h-5 w-5" />
              <span className="text-xs font-medium">Projects</span>
            </TabsTrigger>
            <TabsTrigger 
              value="contracts" 
              className="flex flex-col items-center justify-center gap-1.5 py-3 px-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md transition-all"
            >
              <FileText className="h-5 w-5" />
              <span className="text-xs font-medium">Contracts</span>
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="earnings" className="mt-6">
          <div className="overflow-x-auto rounded-lg border bg-card">
            <Card>
              <CardHeader>
                <CardTitle>Earnings Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <FreelancerEarningsDashboard />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="projects" className="mt-6">
          <div className="overflow-x-auto rounded-lg border bg-card">
            <ProjectList projects={projects} role={UserRole.FREELANCER} />
          </div>
        </TabsContent>
        <TabsContent value="contracts" className="mt-6">
          <div className="overflow-x-auto rounded-lg border bg-card">
            <ContractList contracts={contracts} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}