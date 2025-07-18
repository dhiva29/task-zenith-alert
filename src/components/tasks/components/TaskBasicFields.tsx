import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TaskType, TaskPriority } from '@/types';

interface TaskBasicFieldsProps {
  title: string;
  setTitle: (title: string) => void;
  deadline: string;
  setDeadline: (deadline: string) => void;
  priority: TaskPriority;
  setPriority: (priority: TaskPriority) => void;
  notes: string;
  setNotes: (notes: string) => void;
  taskType: TaskType;
  prePlacementTalk?: string;
  setPrePlacementTalk?: (talk: string) => void;
}

export const TaskBasicFields = ({
  title,
  setTitle,
  deadline,
  setDeadline,
  priority,
  setPriority,
  notes,
  setNotes,
  taskType,
  prePlacementTalk,
  setPrePlacementTalk
}: TaskBasicFieldsProps) => {
  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'text-green-600' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
    { value: 'high', label: 'High', color: 'text-red-600' }
  ] as const;

  return (
    <>
      {/* Task Title */}
      <div className="space-y-2">
        <Label>Task Title *</Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={taskType === 'custom' ? 'Enter custom task name' : 'Auto-generated or custom title'}
          required
        />
      </div>

      {/* Deadline and Priority */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Application Deadline *</Label>
          <Input
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label>Priority</Label>
          <Select value={priority} onValueChange={setPriority}>
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

      {/* Pre-placement Talk (for placement reminders only) */}
      {taskType === 'placement_reminder' && setPrePlacementTalk && (
        <div className="space-y-2">
          <Label>Pre-placement Talk (Optional)</Label>
          <Input
            type="datetime-local"
            value={prePlacementTalk || ''}
            onChange={(e) => setPrePlacementTalk(e.target.value)}
            placeholder="When is the company presentation?"
          />
        </div>
      )}

      {/* Notes */}
      <div className="space-y-2">
        <Label>Notes (Optional)</Label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any additional notes or links..."
          rows={3}
        />
      </div>
    </>
  );
};