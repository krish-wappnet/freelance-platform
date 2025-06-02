import { redirect } from 'next/navigation';
import { hasRole } from '@/lib/auth';
import { UserRole } from '@prisma/client';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import FreelancerProjectList from '@/app/client/components/projects/FreelancerProjectList';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Briefcase, Search, Filter, Inbox, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default async function FreelancerProjects() {
  const user = await getCurrentUser();

  if (!user || !hasRole(user, UserRole.FREELANCER)) {
    redirect('/client/dashboard');
  }

  const projects = await prisma.project.findMany({
    where: {
      AND: [
        { status: 'OPEN' },
        {
          bids: {
            none: {
              freelancerId: user.id,
            },
          },
        },
      ],
    },
    select: {
      id: true,
      title: true,
      description: true,
      budget: true,
      deadline: true,
      category: true,
      skills: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      clientId: true,
      bids: {
        where: {
          status: 'PENDING',
        },
        include: {
          freelancer: {
            select: {
              name: true,
              avatar: true,
            },
          },
        },
      },
      client: {
        select: {
          name: true,
          avatar: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Convert project IDs to strings
  const cleanProjects = projects.map(project => ({
    ...project,
    id: project.id.toString()
  }));

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 md:space-y-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Find Your Next Project</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Discover opportunities that match your expertise and interests
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="hidden md:flex">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm" className="hidden md:flex">
            <Briefcase className="h-4 w-4 mr-2" />
            My Applications
          </Button>
        </div>
      </div>

      {/* Search and Filter Section */}
      <Card className="bg-muted/50">
        <CardHeader className="p-4 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by project title, skills, or category..."
                className="pl-9 bg-background"
              />
            </div>
            <div className="flex items-center gap-2 md:hidden">
              <Button variant="outline" size="sm" className="flex-1">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <Briefcase className="h-4 w-4 mr-2" />
                Applications
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Projects List Section */}
      <div className="rounded-lg border bg-card">
        <div className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">Project Opportunities</h2>
              <p className="text-sm text-muted-foreground">
                {cleanProjects.length === 0 
                  ? "No projects available at the moment"
                  : `${cleanProjects.length} ${cleanProjects.length === 1 ? 'project' : 'projects'} waiting for your expertise`
                }
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="hidden md:flex">
                Sort by: Latest
              </Button>
            </div>
          </div>

          {cleanProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="rounded-full bg-muted p-3 mb-4">
                <Inbox className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Projects Available</h3>
              <p className="text-sm text-muted-foreground max-w-sm mb-4">
                There are currently no open projects matching your criteria. Check back later or try adjusting your filters.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" size="sm">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Set Up Job Alerts
                </Button>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Modify Filters
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <FreelancerProjectList projects={cleanProjects} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
