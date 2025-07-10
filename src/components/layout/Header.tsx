import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Calendar, LogOut, Menu } from 'lucide-react';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface HeaderProps {
  onNavigate?: (page: string) => void;
  currentPage?: string;
}

export const Header = ({ onNavigate, currentPage }: HeaderProps) => {
  const { profile, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  const navItems = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'add-task', label: 'Add Task', icon: '➕' },
    { id: 'tasks', label: 'View Tasks', icon: '📋' },
    { id: 'reminders', label: 'Reminders', icon: '⏰' },
  ];

  const handleNavClick = (pageId: string) => {
    onNavigate?.(pageId);
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Calendar className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-lg font-bold text-primary">A&F Scheduler</h1>
            <p className="text-xs text-muted-foreground">Task Management</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium">Hi, {profile?.first_name} 👋</p>
            <p className="text-xs text-muted-foreground">{profile?.username}</p>
          </div>

          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px]">
              <div className="space-y-4">
                <div className="text-center pb-4 border-b">
                  <p className="font-medium">Hi, {profile?.first_name} 👋</p>
                  <p className="text-sm text-muted-foreground">{profile?.full_name}</p>
                </div>

                <nav className="space-y-2">
                  {navItems.map((item) => (
                    <Button
                      key={item.id}
                      variant={currentPage === item.id ? "default" : "ghost"}
                      className="w-full justify-start gap-3"
                      onClick={() => handleNavClick(item.id)}
                    >
                      <span className="text-base">{item.icon}</span>
                      {item.label}
                    </Button>
                  ))}
                </nav>

                <div className="pt-4 border-t">
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-3 text-destructive"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};