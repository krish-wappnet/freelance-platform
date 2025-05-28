'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EarningsDashboard } from '@/components/dashboard/earnings-dashboard';
import ProjectList from '@/components/projects/project-list';
import ContractList from '@/components/contracts/contract-list';
import { Loader2, Briefcase, FileText, Users, Plus, Download, TrendingUp, DollarSign, Calendar } from 'lucide-react';
import { UserRole, ContractStage, Payment } from '@prisma/client';
import { Button } from '@/components/ui/button';
import ProjectFormModal from '@/components/projects/project-form-modal';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

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

interface PaymentWithDetails extends Payment {
  milestone: {
    title: string;
  };
}

export default function ClientDashboard() {
  const { user, loading } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [payments, setPayments] = useState<PaymentWithDetails[]>([]);

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
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await fetch('/api/payments/client');
        const data = await response.json();
        setPayments(data);
      } catch (error) {
        console.error('Error fetching payments:', error);
      } finally {
        setLoadingPayments(false);
      }
    };

    if (user) {
      fetchPayments();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name}</h1>
          <p className="text-muted-foreground">Here's an overview of your projects and earnings</p>
        </div>
        <Button onClick={() => setShowCreateProject(true)} className="bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Create Project
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <Briefcase className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalProjects || 0}</div>
            <p className="text-xs text-muted-foreground">Active and completed projects</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
            <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeContracts || 0}</div>
            <p className="text-xs text-muted-foreground">Ongoing contracts</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats?.totalSpent?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">Total project spending</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Spending</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(stats?.totalSpent ? stats.totalSpent / 12 : 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Average monthly spending</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="earnings" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
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

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>Recent payments and invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loadingPayments ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : payments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No payments found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-4 bg-card rounded-lg border hover:bg-accent/50 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{payment.milestone.title}</p>
                        <Badge variant={payment.status === 'COMPLETED' ? 'default' : 'secondary'}>
                          {payment.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(payment.createdAt), "PPP")}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium">₹{payment.amount.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">Payment ID: {payment.id.slice(0, 8)}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/api/payments/${payment.id}/invoice`, '_blank')}
                        className="hover:bg-primary hover:text-primary-foreground"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Invoice
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}