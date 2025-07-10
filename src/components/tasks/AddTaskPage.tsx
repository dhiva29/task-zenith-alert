import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Calendar, Loader2, Sparkles } from 'lucide-react';
import { TaskType, TaskPriority } from '@/types';
import { extractPlacementInfo } from '@/utils/placementParser';

interface AddTaskPageProps {
  onNavigate: (page: string) => void;
}

export const AddTaskPage = ({ onNavigate }: AddTaskPageProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [taskType, setTaskType] = useState<TaskType>('placement_reminder');
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [notes, setNotes] = useState('');
  const [placementText, setPlacementText] = useState('');
  
  // Placement specific fields
  const [companyName, setCompanyName] = useState('');
  const [jobRole, setJobRole] = useState('');
  const [ctcLpa, setCtcLpa] = useState('');

  const taskTypeOptions = [
    { value: 'placement_reminder', label: 'Placement Reminder', emoji: '🎯' },
    { value: 'team_meeting', label: 'Team Meeting', emoji: '👥' },
    { value: 'assignment_submission', label: 'Assignment Submission', emoji: '📝' },
    { value: 'project_deadline', label: 'Project Deadline', emoji: '🚀' },
    { value: 'resume_review', label: 'Resume Review', emoji: '📄' },
    { value: 'custom', label: 'Custom', emoji: '⚙️' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'text-green-600' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
    { value: 'high', label: 'High', color: 'text-red-600' }
  ];

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !title || !deadline) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const taskData = {
        user_id: user.id,
        title,
        task_type: taskType,
        deadline,
        priority,
        notes: notes || null,
        company_name: taskType === 'placement_reminder' ? companyName || null : null,
        job_role: taskType === 'placement_reminder' ? jobRole || null : null,
        ctc_lpa: taskType === 'placement_reminder' ? ctcLpa || null : null,
        progress: 0,
        is_completed: false
      };

      const { error } = await supabase
        .from('tasks')
        .insert(taskData);

      if (error) throw error;

      toast({
        title: "Success! 🎉",
        description: "Task created successfully",
      });

      // Reset form
      setTitle('');
      setDeadline('');
      setNotes('');
      setPlacementText('');
      setCompanyName('');
      setJobRole('');
      setCtcLpa('');
      setPriority('medium');
      
      // Navigate to tasks page
      onNavigate('tasks');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create task",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Add New Task
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Task Type Selection */}
            <div className="space-y-2">
              <Label>Task Type</Label>
              <Select value={taskType} onValueChange={(value: TaskType) => setTaskType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {taskTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <span className="flex items-center gap-2">
                        <span>{option.emoji}</span>
                        {option.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Placement Reminder Specific */}
            {taskType === 'placement_reminder' && (
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
            )}

            {/* Basic Task Fields */}
            <div className="space-y-2">
              <Label>Task Title *</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={taskType === 'custom' ? 'Enter custom task name' : 'Auto-generated or custom title'}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Deadline *</Label>
                <Input
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={priority} onValueChange={(value: TaskPriority) => setPriority(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <span className={option.color}>{option.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes or links..."
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onNavigate('home')}
                className="flex-1"
              >
                Cancel
              </Button>
              
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Task'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};