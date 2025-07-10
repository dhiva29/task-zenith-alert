import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LoginPage } from '@/components/auth/LoginPage';
import { Header } from '@/components/layout/Header';
import { HomePage } from '@/components/home/HomePage';
import { AddTaskPage } from '@/components/tasks/AddTaskPage';
import { TasksPage } from '@/components/tasks/TasksPage';
import { RemindersPage } from '@/components/reminders/RemindersPage';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');

  // Reset to home when user changes
  useEffect(() => {
    setCurrentPage('home');
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'add-task':
        return <AddTaskPage onNavigate={setCurrentPage} />;
      case 'tasks':
        return <TasksPage onNavigate={setCurrentPage} />;
      case 'reminders':
        return <RemindersPage onNavigate={setCurrentPage} />;
      default:
        return <HomePage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onNavigate={setCurrentPage} currentPage={currentPage} />
      {renderPage()}
    </div>
  );
};

export default Index;
