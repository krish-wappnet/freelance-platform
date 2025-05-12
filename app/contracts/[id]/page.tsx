'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, Loader2 } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { ContractStage } from '@prisma/client';

export default function ContractDetails() {
  const router = useRouter();
  const { id } = useParams();
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user] = useState(getCurrentUser());

  useEffect(() => {
    const fetchContract = async () => {
      try {
        const response = await fetch(`/api/contracts/${id}`);
        if (!response.ok) throw new Error('Failed to fetch contract');
        const data = await response.json();
        setContract(data);
      } catch (err) {
        setError('Failed to load contract details');
      } finally {
        setLoading(false);
      }
    };

    fetchContract();
  }, [id]);

  if (loading) return <div className="flex items-center justify-center h-64">Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!contract) return null;

  const isClient = contract.clientId === user?.id;
  const isFreelancer = contract.freelancerId === user?.id;

  const handleStageChange = async (newStage: ContractStage) => {
    try {
      const response = await fetch(`/api/contracts/${id}/stage`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage }),
      });

      if (!response.ok) throw new Error('Failed to update contract stage');

      const updatedContract = await response.json();
      setContract(updatedContract);
    } catch (err) {
      console.error('Error updating contract stage:', err);
    }
  };

  const handleTermsAccept = async () => {
    try {
      const response = await fetch(`/api/contracts/${id}/accept`, {
        method: 'PUT',
      });

      if (!response.ok) throw new Error('Failed to accept terms');

      const updatedContract = await response.json();
      setContract(updatedContract);
    } catch (err) {
      console.error('Error accepting terms:', err);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{contract.title}</CardTitle>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded-full text-xs ${
                contract.stage === 'PROPOSAL' ? 'bg-blue-100 text-blue-700' :
                contract.stage === 'APPROVAL' ? 'bg-green-100 text-green-700' :
                contract.stage === 'PAYMENT' ? 'bg-yellow-100 text-yellow-700' :
                contract.stage === 'REVIEW' ? 'bg-purple-100 text-purple-700' :
                contract.stage === 'COMPLETED' ? 'bg-gray-100 text-gray-700' :
                'bg-red-100 text-red-700'
              }`}>
                {contract.stage}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Project Details */}
            <div>
              <h3 className="font-semibold mb-2">Project Details</h3>
              <div className="space-y-2">
                <p><strong>Title:</strong> {contract.project.title}</p>
                <p><strong>Description:</strong> {contract.project.description}</p>
                <p><strong>Budget:</strong> ₹{contract.amount.toLocaleString()}</p>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div>
              <h3 className="font-semibold mb-2">Terms and Conditions</h3>
              <div className="space-y-2">
                <p>{contract.terms}</p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={handleTermsAccept}
                    disabled={contract.termsAccepted}
                  >
                    {contract.termsAccepted ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Terms Accepted
                      </>
                    ) : (
                      <>
                        <X className="h-4 w-4 mr-2" />
                        Accept Terms
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Milestones */}
            <div>
              <h3 className="font-semibold mb-2">Milestones</h3>
              <div className="space-y-4">
                {contract.milestones.map((milestone: any) => (
                  <div key={milestone.id} className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">{milestone.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      {milestone.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span>₹{milestone.amount.toLocaleString()}</span>
                      <span>{milestone.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4">
              {contract.stage === 'PROPOSAL' && (
                <Button
                  onClick={() => handleStageChange('APPROVAL')}
                  disabled={!contract.termsAccepted}
                >
                  Move to Approval
                </Button>
              )}
              {contract.stage === 'APPROVAL' && (
                <Button
                  onClick={() => handleStageChange('PAYMENT')}
                  disabled={!contract.termsAccepted}
                >
                  Move to Payment
                </Button>
              )}
              {contract.stage === 'PAYMENT' && (
                <Button
                  onClick={() => handleStageChange('REVIEW')}
                  disabled={!contract.termsAccepted}
                >
                  Move to Review
                </Button>
              )}
              {contract.stage === 'REVIEW' && (
                <Button
                  onClick={() => handleStageChange('COMPLETED')}
                  disabled={!contract.termsAccepted}
                >
                  Mark as Completed
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
