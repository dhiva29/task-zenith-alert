import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Bell, Clock, AlertTriangle } from 'lucide-react';
import { Task } from '@/types';
import { formatDistanceToNow, format, isWithinInterval, addHours } from 'date-fns';

interface RemindersPageProps {
  onNavigate: (page: string) => void;
}

export const RemindersPage = ({ onNavigate }: RemindersPageProps) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUpcomingTasks();
    }
  }, [user]);

  const fetchUpcomingTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_completed', false)
        .order('deadline', { ascending: true });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyLevel = (deadline: string) => {
    const now = new Date();
    const taskDeadline = new Date(deadline);
    
    if (taskDeadline < now) {
      return { level: 'overdue', color: 'bg-red-500/10 text-red-600 border-red-200', icon: AlertTriangle };
    } else if (isWithinInterval(taskDeadline, { start: now, end: addHours(now, 1) })) {
      return { level: 'urgent', color: 'bg-red-500/10 text-red-600 border-red-200', icon: AlertTriangle };
    } else if (isWithinInterval(taskDeadline, { start: now, end: addHours(now, 24) })) {
      return { level: 'soon', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-200', icon: Clock };
    } else {
      return { level: 'upcoming', color: 'bg-blue-500/10 text-blue-600 border-blue-200', icon: Bell };
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

  const urgentTasks = tasks.filter(task => {
    const urgency = getUrgencyLevel(task.deadline);
    return urgency.level === 'overdue' || urgency.level === 'urgent';
  });

  const todayTasks = tasks.filter(task => {
    const urgency = getUrgencyLevel(task.deadline);
    return urgency.level === 'soon';
  });

  const upcomingTasks = tasks.filter(task => {
    const urgency = getUrgencyLevel(task.deadline);
    return urgency.level === 'upcoming';
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const TaskCard = ({ task }: { task: Task }) => {
    const urgency = getUrgencyLevel(task.deadline);
    const UrgencyIcon = urgency.icon;
    
    return (
      <Card className="transition-all duration-200 hover:shadow-md">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <span className="text-xl">{getTaskTypeEmoji(task.task_type)}</span>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{task.title}</h4>
                <Badge className={urgency.color}>
                  <UrgencyIcon className="h-3 w-3 mr-1" />
                  {urgency.level}
                </Badge>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <div>{format(new Date(task.deadline), 'MMM dd, yyyy HH:mm')}</div>
                <div>
                  {urgency.level === 'overdue' 
                    ? 'Overdue' 
                    : formatDistanceToNow(new Date(task.deadline), { addSuffix: true })
                  }
                </div>
              </div>

              {task.company_name && (
                <div className="text-sm font-medium text-primary">
                  {task.company_name} - {task.job_role}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Reminders & Alerts</h2>
          <p className="text-muted-foreground">Stay on top of your deadlines</p>
        </div>

        {tasks.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-6xl mb-4">🔔</div>
              <h3 className="text-lg font-semibold mb-2">No Reminders</h3>
              <p className="text-muted-foreground mb-4">
                You have no active tasks with reminders.
              </p>
              <Button onClick={() => onNavigate('add-task')}>
                Add Your First Task
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Urgent & Overdue */}
            {urgentTasks.length > 0 && (
              <Card className="border-red-200 bg-red-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="h-5 w-5" />
                    Urgent & Overdue ({urgentTasks.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {urgentTasks.map(task => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Today */}
            {todayTasks.length > 0 && (
              <Card className="border-yellow-200 bg-yellow-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-yellow-600">
                    <Clock className="h-5 w-5" />
                    Due Today ({todayTasks.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {todayTasks.map(task => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Upcoming */}
            {upcomingTasks.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Upcoming ({upcomingTasks.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {upcomingTasks.slice(0, 5).map(task => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                  {upcomingTasks.length > 5 && (
                    <div className="text-center pt-2">
                      <Button 
                        variant="outline" 
                        onClick={() => onNavigate('tasks')}
                      >
                        View All Tasks ({upcomingTasks.length - 5} more)
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Notification Info */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Notification Schedule
                </h3>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div>📅 Regular reminders every 2 hours</div>
                  <div>⏰ Urgent alert 1 hour before deadline</div>
                  <div>🔔 System alarms for critical deadlines</div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};