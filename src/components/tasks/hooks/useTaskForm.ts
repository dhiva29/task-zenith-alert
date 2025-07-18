import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { TaskType, TaskPriority } from '@/types';
import { NotificationService } from '@/services/notificationService';

export const useTaskForm = (onNavigate: (page: string) => void) => {
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
  const [prePlacementTalk, setPrePlacementTalk] = useState('');

  const resetForm = () => {
    setTitle('');
    setDeadline('');
    setNotes('');
    setPlacementText('');
    setCompanyName('');
    setJobRole('');
    setCtcLpa('');
    setPrePlacementTalk('');
    setPriority('medium');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submission:', { user: !!user, title, deadline });
    
    if (!user || !title || !deadline) {
      toast({
        title: "Error",
        description: `Please fill in all required fields. Missing: ${!user ? 'user ' : ''}${!title ? 'title ' : ''}${!deadline ? 'deadline' : ''}`,
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

      // Schedule notifications for placement reminders
      if (taskType === 'placement_reminder' && deadline) {
        const taskId = Math.floor(Math.random() * 10000); // Generate unique ID
        const deadlineDate = new Date(deadline);
        const preTalkDate = prePlacementTalk ? new Date(prePlacementTalk) : undefined;
        
        await NotificationService.scheduleTaskReminders(
          taskId,
          title,
          deadlineDate,
          preTalkDate
        );
      }

      toast({
        title: "Success! 🎉",
        description: "Task created successfully with reminders scheduled",
      });

      resetForm();
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

  return {
    // State
    loading,
    taskType,
    title,
    deadline,
    priority,
    notes,
    placementText,
    companyName,
    jobRole,
    ctcLpa,
    prePlacementTalk,
    
    // Setters
    setTaskType,
    setTitle,
    setDeadline,
    setPriority,
    setNotes,
    setPlacementText,
    setCompanyName,
    setJobRole,
    setCtcLpa,
    setPrePlacementTalk,
    
    // Handlers
    handleSubmit,
    resetForm
  };
};