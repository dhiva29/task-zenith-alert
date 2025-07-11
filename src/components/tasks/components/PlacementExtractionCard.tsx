import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import { extractPlacementInfo } from '@/utils/placementParser';
import { toast } from '@/hooks/use-toast';

interface PlacementExtractionCardProps {
  placementText: string;
  setPlacementText: (text: string) => void;
  companyName: string;
  setCompanyName: (name: string) => void;
  jobRole: string;
  setJobRole: (role: string) => void;
  ctcLpa: string;
  setCtcLpa: (ctc: string) => void;
  setDeadline: (deadline: string) => void;
  setTitle: (title: string) => void;
}

export const PlacementExtractionCard = ({
  placementText,
  setPlacementText,
  companyName,
  setCompanyName,
  jobRole,
  setJobRole,
  ctcLpa,
  setCtcLpa,
  setDeadline,
  setTitle
}: PlacementExtractionCardProps) => {
  const handlePlacementTextAnalysis = () => {
    if (!placementText.trim()) {
      toast({
        title: "Error",
        description: "Please paste the placement notification content",
        variant: "destructive"
      });
      return;
    }

    const extracted = extractPlacementInfo(placementText);
    
    if (extracted.companyName) setCompanyName(extracted.companyName);
    if (extracted.jobRole) setJobRole(extracted.jobRole);
    if (extracted.ctcLpa) setCtcLpa(extracted.ctcLpa);
    if (extracted.deadline) {
      const formattedDate = extracted.deadline.toISOString().slice(0, 16);
      setDeadline(formattedDate);
    }

    // Auto-generate title
    const autoTitle = `${extracted.companyName || 'Company'} - ${extracted.jobRole || 'Position'} Application`;
    setTitle(autoTitle);

    toast({
      title: "Information Extracted! ✨",
      description: "Placement details have been automatically filled",
    });
  };

  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          Smart Placement Extraction
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Paste Placement Notification from MS Teams</Label>
          <Textarea
            placeholder="Paste the complete placement notification here..."
            value={placementText}
            onChange={(e) => setPlacementText(e.target.value)}
            rows={4}
          />
        </div>
        
        <Button
          type="button"
          variant="secondary"
          onClick={handlePlacementTextAnalysis}
          className="w-full"
        >
          <Sparkles className="mr-2 h-4 w-4" />
          Extract Information
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Company Name</Label>
            <Input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g., Google"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Job Role</Label>
            <Input
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
              placeholder="e.g., Software Engineer"
            />
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <Label>CTC/LPA</Label>
            <Input
              value={ctcLpa}
              onChange={(e) => setCtcLpa(e.target.value)}
              placeholder="e.g., 12 LPA"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};