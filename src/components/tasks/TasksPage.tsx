import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Loader2, Calendar, Building, User, DollarSign, CheckCircle, Trash2, Clock } from 'lucide-react';
import { Task } from '@/types';
import { formatDistanceToNow, format } from 'date-fns';

interface TasksPageProps {
  onNavigate: (page: string) => void;
}

export const TasksPage = ({ onNavigate }: TasksPageProps) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_completed', false)
        .order('deadline', { ascending: true });

      if (error) throw error;
      setTasks(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch tasks",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsCompleted = async (taskId: string) => {
    setProcessingId(taskId);
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ is_completed: true })
        .eq('id', taskId);

      if (error) throw error;

      setTasks(tasks.filter(task => task.id !== taskId));
      toast({
        title: "Task Completed! 🎉",
        description: "Task marked as done and removed from list",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  const deleteTask = async (taskId: string) => {
    setProcessingId(taskId);
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      setTasks(tasks.filter(task => task.id !== taskId));
      toast({
        title: "Task Deleted",
        description: "Task removed successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/10 text-red-600 border-red-200';
      case 'medium': return 'bg-yellow-500/10 text-yellow-600 border-yellow-200';
      case 'low': return 'bg-green-500/10 text-green-600 border-green-200';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
  };

  const getTaskTypeEmoji = (taskType: string) => {
    switch (taskType) {
      case 'placement_reminder': return '🎯';
      case 'team_meeting': return '👥';
      case 'assignment_submission': return '📝';
      case 'project_deadline': return '🚀';
      case 'resume_review': return '📄';
      default: return '⚙️';
    }
  };

  const isOverdue = (deadline: string) => {
    return new Date(deadline) < new Date();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Your Tasks</h2>
            <p className="text-muted-foreground">
              {tasks.length} active {tasks.length === 1 ? 'task' : 'tasks'}
            </p>
          </div>
          
          <Button onClick={() => onNavigate('add-task')}>
            Add Task
          </Button>
        </div>

        {tasks.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-lg font-semibold mb-2">No Active Tasks</h3>
              <p className="text-muted-foreground mb-4">
                You're all caught up! Create a new task to get started.
              </p>
              <Button onClick={() => onNavigate('add-task')}>
                Create Your First Task
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <Card 
                key={task.id} 
                className={`transition-all duration-200 hover:shadow-md ${
                  isOverdue(task.deadline) ? 'border-red-200 bg-red-50/50' : ''
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getTaskTypeEmoji(task.task_type)}</span>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{task.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getPriorityColor(task.priority)}>
                              {task.priority}
                            </Badge>
                            <Badge variant="outline">
                              {task.task_type.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className={isOverdue(task.deadline) ? 'text-red-600 font-medium' : ''}>
                            {format(new Date(task.deadline), 'MMM dd, yyyy HH:mm')}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {isOverdue(task.deadline) 
                              ? 'Overdue' 
                              : formatDistanceToNow(new Date(task.deadline), { addSuffix: true })
                            }
                          </span>
                        </div>
                      </div>

                      {/* Placement specific details */}
                      {task.task_type === 'placement_reminder' && (
                        <div className="bg-primary/5 rounded-lg p-3 space-y-2">
                          {task.company_name && (
                            <div className="flex items-center gap-2 text-sm">
                              <Building className="h-4 w-4 text-primary" />
                              <span className="font-medium">{task.company_name}</span>
                            </div>
                          )}
                          
                          {task.job_role && (
                            <div className="flex items-center gap-2 text-sm">
                              <User className="h-4 w-4 text-primary" />
                              <span>{task.job_role}</span>
                            </div>
                          )}
                          
                          {task.ctc_lpa && (
                            <div className="flex items-center gap-2 text-sm">
                              <DollarSign className="h-4 w-4 text-primary" />
                              <span>{task.ctc_lpa}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {task.notes && (
                        <div className="text-sm text-muted-foreground bg-muted/50 rounded p-2">
                          {task.notes}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        onClick={() => markAsCompleted(task.id)}
                        disabled={processingId === task.id}
                        className="min-w-[100px]"
                      >
                        {processingId === task.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Done
                          </>
                        )}
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteTask(task.id)}
                        disabled={processingId === task.id}
                        className="min-w-[100px] text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};