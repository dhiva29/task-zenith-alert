import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase.ts";
import { toast } from "sonner";
import { useUser } from "@/lib/UserContext"; // Make sure this import is here

import { Button } from "@/components/ui/button";
import TaskForm from "@/components/TaskForm";

const NewTaskPage = () => {
  const navigate = useNavigate();
  const { user } = useUser(); // 1. GET THE CURRENT USER

  const createTask = async (formData) => {
    const { title, type, priority, deadline, notes } = formData;

    if (!title || !type || !priority || !deadline) {
      toast.error("Please fill in all required fields.");
      return;
    }
    
    // Check if user exists before trying to access user.id
    if (!user) {
      toast.error("You must be logged in to create a task.");
      return;
    }

    const newTask = {
      title,
      type,
      priority,
      deadline,
      notes,
      user_id: user.id, // 2. ADD THE USER ID TO THE NEW TASK OBJECT
    };

    const { error } = await supabase.from("tasks").insert(newTask);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Task created successfully!");
      navigate("/");
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Add New Task</h1>
      <TaskForm onSubmit={createTask} />
    </div>
  );
};

export default NewTaskPage;
