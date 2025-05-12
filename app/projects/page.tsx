import { Metadata } from 'next';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Clock, DollarSign, Search, Tag } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

// This page will be dynamically rendered because it uses cookies

export const metadata: Metadata = {
  title: 'Browse Projects | WorkWave',
  description: 'Find freelance projects that match your skills and expertise',
};



export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: { category?: string; skill?: string; q?: string };
}) {
  const user = await getCurrentUser();
  
  // Build filter conditions
  const where: any = {
    status: 'OPEN',
  };
  
  if (searchParams.category) {
    where.category = searchParams.category;
  }
  
  if (searchParams.skill) {
    where.skills = {
      has: searchParams.skill,
    };
  }
  
  if (searchParams.q) {
    where.OR = [
      { title: { contains: searchParams.q, mode: 'insensitive' } },
      { description: { contains: searchParams.q, mode: 'insensitive' } },
    ];
  }
  
  // Fetch projects with filters
  const projects = await prisma.project.findMany({
    where,
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      client: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
      bids: {
        select: {
          id: true,
        },
      },
    },
  });
  
  // Fetch categories for filter
  const categories = await prisma.project.findMany({
    select: {
      category: true,
    },
    distinct: ['category'],
  });
  
  // Fetch all unique skills across projects
  const skills = await prisma.project.findMany({
    select: {
      skills: true,
    },
  });
  
  const uniqueSkills = Array.from(
    new Set(skills.flatMap(project => project.skills))
  ).sort();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Browse Projects</h1>
          <p className="text-muted-foreground mt-2">
            Find projects that match your skills and expertise
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search projects..."
              className="pl-10"
              defaultValue={searchParams.q}
            />
          </div>
          
          <Select defaultValue={searchParams.category || 'all'}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(({ category }) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select defaultValue={searchParams.skill || 'all'}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Skill" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Skills</SelectItem>
              {uniqueSkills.map(skill => (
                <SelectItem key={skill} value={skill}>
                  {skill}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="line-clamp-2">
                    <Link
                      href={`/projects/₹{project.id}`}
                      className="hover:text-primary transition-colors"
                    >
                      {project.title}
                    </Link>
                  </CardTitle>
                  <CardDescription>
                    Posted by{' '}
                    <Link
                      href={`/clients/₹{project.client.id}`}
                      className="font-medium text-foreground hover:text-primary transition-colors"
                    >
                      {project.client.name}
                    </Link>
                  </CardDescription>
                </div>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={project.client.avatar || undefined} />
                  <AvatarFallback>{project.client.name[0]}</AvatarFallback>
                </Avatar>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 space-y-4">
              <p className="line-clamp-3 text-muted-foreground">
                {project.description}
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  <span>Budget: ₹{project.budget}</span>
                </div>
                
                {project.deadline && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Due: {new Date(project.deadline).toLocaleDateString()}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Briefcase className="h-4 w-4" />
                  <span>{project.bids.length} bids</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Skills:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {project.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
            
            <div className="p-6 pt-0">
              <Button asChild className="w-full">
                <Link href={`/projects/₹{project.id}`}>
                  View Details
                </Link>
              </Button>
            </div>
          </Card>
        ))}
      </div>
      
      {projects.length === 0 && (
        <div className="text-center py-12">
          <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-medium mb-2">No projects found</h2>
          <p className="text-muted-foreground">
            Try adjusting your search or filters to find more projects
          </p>
        </div>
      )}
    </div>
  );
}