"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";


const formSchema = z.object({
  numQuestions: z
    .number({ invalid_type_error: "Number of questions must be a number." })
    .int("Number of questions must be an integer.")
    .min(5, { message: "Minimum 5 questions." })
    .max(50, { message: "Maximum 50 questions." }),
  difficulty: z.enum(["easy", "medium", "hard"], {
    required_error: "Please select a difficulty level.",
  }),
});

type TopicOptionsFormValues = z.infer<typeof formSchema>;

interface TopicOptionsStepProps {
  onSubmitOptions: (options: TopicOptionsFormValues) => void;
}

export function TopicOptionsStep({ onSubmitOptions }: TopicOptionsStepProps) {
  const form = useForm<TopicOptionsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      numQuestions: 10,
      difficulty: "medium",
    },
  });

  function onSubmit(values: TopicOptionsFormValues) {
    onSubmitOptions(values);
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Test Options</h2>
        <p className="text-muted-foreground">
          Configure the number of questions and difficulty.
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="numQuestions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Questions (5-50)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="e.g., 10"
                    {...field}
                    onChange={(e) => {
                      const value = parseInt(e.target.value, 10);
                      field.onChange(isNaN(value) ? "" : value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="difficulty"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Difficulty Level</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="easy" />
                      </FormControl>
                      <FormLabel className="font-normal">Easy</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="medium" />
                      </FormControl>
                      <FormLabel className="font-normal">Medium</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="hard" />
                      </FormControl>
                      <FormLabel className="font-normal">Hard</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full">
            Generate Questions
          </Button>
        </form>
      </Form>
    </div>
  );
}