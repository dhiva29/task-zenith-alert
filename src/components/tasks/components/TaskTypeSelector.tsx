import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TaskType } from '@/types';

interface TaskTypeSelectorProps {
  value: TaskType;
  onChange: (value: TaskType) => void;
}

export const TaskTypeSelector = ({ value, onChange }: TaskTypeSelectorProps) => {
  const taskTypeOptions = [
    { value: 'placement_reminder', label: 'Placement Reminder', emoji: '🎯' },
    { value: 'team_meeting', label: 'Team Meeting', emoji: '👥' },
    { value: 'assignment_submission', label: 'Assignment Submission', emoji: '📝' },
    { value: 'project_deadline', label: 'Project Deadline', emoji: '🚀' },
    { value: 'resume_review', label: 'Resume Review', emoji: '📄' },
    { value: 'custom', label: 'Custom', emoji: '⚙️' }
  ] as const;

  return (
    <div className="space-y-2">
      <Label>Task Type</Label>
      <Select value={value} onValueChange={onChange}>
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
  );
};