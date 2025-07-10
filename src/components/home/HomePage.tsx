import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, List, Bell, Calendar } from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

export const HomePage = ({ onNavigate }: HomePageProps) => {
  const { profile } = useAuth();

  const quickActions = [
    {
      id: 'add-task',
      title: 'Add Task',
      description: 'Create a new task or placement reminder',
      icon: Plus,
      color: 'bg-primary text-primary-foreground',
      emoji: '➕'
    },
    {
      id: 'tasks',
      title: 'View Tasks',
      description: 'Manage your current tasks',
      icon: List,
      color: 'bg-secondary text-secondary-foreground',
      emoji: '📋'
    },
    {
      id: 'reminders',
      title: 'Reminders',
      description: 'Check your upcoming reminders',
      icon: Bell,
      color: 'bg-accent text-accent-foreground',
      emoji: '⏰'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 py-6 space-y-6">
        {/* Welcome Section */}
        <div className="text-center space-y-2 animate-fade-in">
          <div className="text-4xl mb-2">👋</div>
          <h2 className="text-2xl font-bold text-primary">
            Welcome, {profile?.first_name}!
          </h2>
          <p className="text-muted-foreground">
            Ready to manage your tasks efficiently
          </p>
        </div>

        {/* Quick Stats */}
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-semibold">Task Scheduler</h3>
                <p className="text-sm text-muted-foreground">
                  Stay organized with smart reminders
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-center">Quick Actions</h3>
          <div className="grid gap-4">
            {quickActions.map((action) => (
              <Card 
                key={action.id}
                className="transition-all duration-200 hover:scale-[1.02] hover:shadow-md cursor-pointer"
                onClick={() => onNavigate(action.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">{action.emoji}</div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{action.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                    <Button size="sm" variant="outline">
                      Go
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Features Highlight */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4 text-center">✨ Features</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span>🔔</span>
                <span>Smart Reminders</span>
              </div>
              <div className="flex items-center gap-2">
                <span>📱</span>
                <span>Mobile Optimized</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🎯</span>
                <span>Placement Tracker</span>
              </div>
              <div className="flex items-center gap-2">
                <span>⚡</span>
                <span>Auto Extraction</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};