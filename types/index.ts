export interface Rating {
  id: string;
  rating: number;
  review: string;
  createdAt: Date;
  updatedAt: Date;
  milestoneId: string;
  contractId: string;
  clientId: string;
  freelancerId: string;
} 