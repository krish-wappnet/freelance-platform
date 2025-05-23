import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { ProgressUpdateForm } from '@/components/milestones/progress-update-form';
import { ProgressTimeline } from '@/components/milestones/progress-timeline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { MilestoneStatus, type Milestone, type User } from '@prisma/client';

type MilestoneWithProgress = Milestone & {
  progressUpdates: Array<{
    id: string;
    description: string;
    status: MilestoneStatus;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    milestoneId: string;
    user: Pick<User, 'id' | 'name' | 'email'>;
  }>;
  contract: {
    freelancerId: string;
    clientId: string;
  };
};

export default async function MilestoneDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();
  
  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Get the milestone with contract info
  // Get the milestone with contract and progress updates using a raw query
  const milestoneResult = await prisma.$queryRaw<Array<{
    id: string;
    title: string;
    description: string;
    amount: number;
    "dueDate": Date | null;
    status: MilestoneStatus;
    "createdAt": Date;
    "updatedAt": Date;
    "contractId": string;
    "projectId": string;
    contract: string;
    progressupdates: string | null;
  }>>`
    SELECT 
      m.*,
      json_build_object(
        'id', c.id,
        'freelancerId', c."freelancerId",
        'clientId', c."clientId"
      ) as contract,
      (
        SELECT COALESCE(json_agg(
          json_build_object(
            'id', mp.id,
            'description', mp.description,
            'status', mp.status,
            'createdAt', mp."createdAt",
            'updatedAt', mp."updatedAt",
            'userId', mp."userId",
            'milestoneId', mp."milestoneId",
            'user', json_build_object(
              'id', u.id,
              'name', u.name,
              'email', u.email
            )
          )
          ORDER BY mp."createdAt" DESC
        ), '[]'::json)
        FROM "milestone_progress" mp
        JOIN "users" u ON mp."userId" = u.id
        WHERE mp."milestoneId" = m.id
      ) as "progressupdates"
    FROM "milestones" m
    JOIN "contracts" c ON m."contractId" = c.id
    WHERE m.id = ${params.id}::uuid
  `;

  const rawMilestone = milestoneResult?.[0];
  
  if (!rawMilestone) {
    notFound();
  }

  // Parse the raw data into a properly typed object
  const milestone = {
    id: rawMilestone.id,
    title: rawMilestone.title,
    description: rawMilestone.description,
    amount: rawMilestone.amount,
    dueDate: rawMilestone.dueDate,
    status: rawMilestone.status,
    createdAt: rawMilestone.createdAt,
    updatedAt: rawMilestone.updatedAt,
    contractId: rawMilestone.contractId,
    projectId: rawMilestone.projectId,
    contract: JSON.parse(rawMilestone.contract),
    progressUpdates: rawMilestone.progressupdates ? JSON.parse(rawMilestone.progressupdates) : [],
  };

  // Use the parsed milestone data
  const milestoneWithUpdates = milestone;

  // Check if the current user is authorized to view this milestone
  const isFreelancer = user.role === 'FREELANCER' && user.id === milestone.contract.freelancerId;
  const isClient = user.role === 'CLIENT' && user.id === milestone.contract.clientId;
  const isAdmin = user.role === 'ADMIN';

  if (!isFreelancer && !isClient && !isAdmin) {
    return new Response('Forbidden', { status: 403 });
  }

  const statusBadge = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    IN_PROGRESS: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-green-100 text-green-800',
    PAYMENT_REQUESTED: 'bg-purple-100 text-purple-800',
    PAID: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
  }[milestone.status] || 'bg-gray-100 text-gray-800';

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 max-w-7xl ml-0 md:ml-[200px] lg:ml-[250px]">
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{milestone.title}</h1>
                <p className="text-muted-foreground">
                  Project: {milestone.contract?.project?.title || 'Unknown Project'}
                </p>
              </div>
              <Badge className={statusBadge}>
                {milestone.status?.toString().replace(/_/g, ' ') || 'UNKNOWN'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Description</h3>
                <p className="text-muted-foreground">{milestone.description}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Amount</h4>
                  <p>${milestone.amount ? milestone.amount.toFixed(2) : '0.00'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Due Date</h4>
                  <p>{milestone.dueDate ? format(new Date(milestone.dueDate), 'MMM d, yyyy') : 'No due date'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Created</h4>
                  <p>{milestone.createdAt ? format(new Date(milestone.createdAt), 'MMM d, yyyy') : 'N/A'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Progress Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <ProgressTimeline updates={milestoneWithUpdates.progressUpdates} />
            </CardContent>
          </Card>

          {isFreelancer && (
            <Card>
              <CardHeader>
                <CardTitle>Update Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <ProgressUpdateForm 
                  milestoneId={milestone.id}
                  currentStatus={milestone.status}
                  onUpdate={() => window.location.reload()}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
