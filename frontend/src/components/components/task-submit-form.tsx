'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "./button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./form";
import { Input } from "./input";
import { Textarea } from "./textarea";
import { useToast } from "../../hooks/use-toast";
import type { Assignment as Task } from "../lib/types";

const formSchema = z.object({
  file: z.any().refine(files => files?.length > 0, "File is required."),
  comments: z.string().optional(),
});

type TaskSubmitFormProps = {
    task: Task;
    onSuccess: () => void;
}

export function TaskSubmitForm({ task, onSuccess }: TaskSubmitFormProps) {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    toast({
      title: "Task Submitted!",
      description: `Your work for "${task.title}" has been submitted successfully.`,
    });
    onSuccess();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="file"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Task File</FormLabel>
              <FormControl>
                <Input type="file" onChange={(e) => field.onChange(e.target.files)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="comments"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comments (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Add any comments for your teacher..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">Submit Task</Button>
      </form>
    </Form>
  );
}
