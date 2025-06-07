
"use client";

import type { TestConfiguration } from "@/types";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SlidersHorizontal, CheckSquare } from "lucide-react";

interface TestConfigurationStepProps {
  currentConfig: TestConfiguration;
  onSubmitConfig: (config: TestConfiguration) => void;
}

const DURATION_OPTIONS = [
  { label: "15 Minutes", value: 15 },
  { label: "30 Minutes", value: 30 },
  { label: "45 Minutes", value: 45 },
  { label: "1 Hour", value: 60 },
  { label: "1.5 Hours", value: 90 },
  { label: "2 Hours", value: 120 },
];

const NEGATIVE_MARK_OPTIONS = [
  { label: "0.25 points", value: 0.25 },
  { label: "0.33 points", value: 0.33 },
  { label: "0.5 points", value: 0.5 },
  { label: "1 point", value: 1.0 },
];

export function TestConfigurationStep({ currentConfig, onSubmitConfig }: TestConfigurationStepProps) {
  const [isTimedTest, setIsTimedTest] = useState(currentConfig.isTimedTest);
  const [durationMinutes, setDurationMinutes] = useState(currentConfig.durationMinutes);
  const [enableNegativeMarking, setEnableNegativeMarking] = useState(currentConfig.enableNegativeMarking);
  const [negativeMarkValue, setNegativeMarkValue] = useState(currentConfig.negativeMarkValue);

  useEffect(() => {
    setIsTimedTest(currentConfig.isTimedTest);
    setDurationMinutes(currentConfig.durationMinutes);
    setEnableNegativeMarking(currentConfig.enableNegativeMarking);
    setNegativeMarkValue(currentConfig.negativeMarkValue);
  }, [currentConfig]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmitConfig({
      isTimedTest,
      durationMinutes: isTimedTest ? durationMinutes : 0,
      enableNegativeMarking,
      negativeMarkValue: enableNegativeMarking ? negativeMarkValue : 0,
    });
  };

  return (
    <Card className="w-full max-w-lg shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-3xl text-center flex items-center justify-center gap-2">
          <SlidersHorizontal className="h-8 w-8 text-primary" />
          Test Configuration
        </CardTitle>
        <CardDescription className="text-center">
          Set up the rules for your test.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Timed Test Section */}
          <div className="space-y-3 p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <Label htmlFor="timed-test-switch" className="text-base font-medium">
                Enable Timed Test?
              </Label>
              <Switch
                id="timed-test-switch"
                checked={isTimedTest}
                onCheckedChange={setIsTimedTest}
              />
            </div>
            {isTimedTest && (
              <div className="space-y-3 pt-3">
                <Label htmlFor="duration-select" className="text-sm">Test Duration</Label>
                <Select
                  value={String(durationMinutes)}
                  onValueChange={(value) => setDurationMinutes(Number(value))}
                >
                  <SelectTrigger id="duration-select">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATION_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={String(opt.value)}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Negative Marking Section */}
          <div className="space-y-3 p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <Label htmlFor="negative-marking-switch" className="text-base font-medium">
                Enable Negative Marking?
              </Label>
              <Switch
                id="negative-marking-switch"
                checked={enableNegativeMarking}
                onCheckedChange={setEnableNegativeMarking}
              />
            </div>
            {enableNegativeMarking && (
              <div className="space-y-3 pt-3">
                <Label htmlFor="negative-mark-select" className="text-sm">Points Deducted per Wrong Answer</Label>
                 <Select
                  value={String(negativeMarkValue)}
                  onValueChange={(value) => setNegativeMarkValue(Number(value))}
                >
                  <SelectTrigger id="negative-mark-select">
                    <SelectValue placeholder="Select penalty" />
                  </SelectTrigger>
                  <SelectContent>
                    {NEGATIVE_MARK_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={String(opt.value)}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  This value will be subtracted for each incorrect answer. Unanswered questions are not penalized.
                </p>
              </div>
            )}
          </div>
          
          <Button type="submit" className="w-full text-lg py-6">
            <CheckSquare className="mr-2 h-5 w-5" />
            Save Configuration & Proceed
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
