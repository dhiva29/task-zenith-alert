export interface User {
  id: string;
  username: string;
  full_name: string;
  first_name: string;
}

export interface AuthUser {
  username: string;
  name: string;
  password: string;
  firstName: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  task_type: TaskType;
  deadline: string;
  priority: TaskPriority;
  company_name?: string;
  job_role?: string;
  ctc_lpa?: string;
  notes?: string;
  progress: number;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export type TaskType = 
  | 'placement_reminder'
  | 'team_meeting'
  | 'assignment_submission'
  | 'project_deadline'
  | 'resume_review'
  | 'custom';

export type TaskPriority = 'low' | 'medium' | 'high';

export interface PlacementInfo {
  companyName: string;
  jobRole: string;
  ctcLpa: string;
  deadline: Date;
  prePlacementTalk?: Date;
}