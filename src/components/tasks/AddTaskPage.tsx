import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Loader2 } from 'lucide-react';
import { PlacementExtractionCard } from './components/PlacementExtractionCard';
import { TaskTypeSelector } from './components/TaskTypeSelector';
import { TaskBasicFields } from './components/TaskBasicFields';
import { useTaskForm } from './hooks/useTaskForm';

interface AddTaskPageProps {
  onNavigate: (page: string) => void;
}

export const AddTaskPage = ({ onNavigate }: AddTaskPageProps) => {
  const {
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
    handleSubmit
  } = useTaskForm(onNavigate);

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
            <TaskTypeSelector value={taskType} onChange={setTaskType} />

            {/* Placement Reminder Specific */}
            {taskType === 'placement_reminder' && (
              <PlacementExtractionCard
                placementText={placementText}
                setPlacementText={setPlacementText}
                companyName={companyName}
                setCompanyName={setCompanyName}
                jobRole={jobRole}
                setJobRole={setJobRole}
                ctcLpa={ctcLpa}
              setCtcLpa={setCtcLpa}
              setDeadline={setDeadline}
              setTitle={setTitle}
              setPrePlacementTalk={setPrePlacementTalk}
              />
            )}

            {/* Basic Task Fields */}
            <TaskBasicFields
              title={title}
              setTitle={setTitle}
              deadline={deadline}
              setDeadline={setDeadline}
              priority={priority}
              setPriority={setPriority}
              notes={notes}
              setNotes={setNotes}
              taskType={taskType}
              prePlacementTalk={prePlacementTalk}
              setPrePlacementTalk={setPrePlacementTalk}
            />

            {/* Action Buttons */}
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