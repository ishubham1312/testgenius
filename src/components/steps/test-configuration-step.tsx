
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
import { useToast } from "@/hooks/use-toast";

interface TestConfigurationStepProps {
  currentConfig: TestConfiguration;
  onSubmitConfig: (config: TestConfiguration) => void;
}

const DURATION_OPTIONS = [
  { label: "15 Minutes", value: "15" },
  { label: "30 Minutes", value: "30" },
  { label: "45 Minutes", value: "45" },
  { label: "1 Hour", value: "60" },
  { label: "1.5 Hours", value: "90" },
  { label: "2 Hours", value: "120" },
  { label: "Custom...", value: "custom" },
];

const NEGATIVE_MARK_OPTIONS = [
  { label: "0.25 points", value: 0.25 },
  { label: "0.33 points", value: 0.33 },
  { label: "0.5 points", value: 0.5 },
  { label: "1 point", value: 1.0 },
];

export function TestConfigurationStep({ currentConfig, onSubmitConfig }: TestConfigurationStepProps) {
  const [isTimedTest, setIsTimedTest] = useState(currentConfig.isTimedTest);
  const [selectedDurationValue, setSelectedDurationValue] = useState(String(currentConfig.durationMinutes));
  const [customDurationInput, setCustomDurationInput] = useState("");
  const [enableNegativeMarking, setEnableNegativeMarking] = useState(currentConfig.enableNegativeMarking);
  const [negativeMarkValue, setNegativeMarkValue] = useState(currentConfig.negativeMarkValue);
  const { toast } = useToast();

  useEffect(() => {
    setIsTimedTest(currentConfig.isTimedTest);
    setEnableNegativeMarking(currentConfig.enableNegativeMarking);
    setNegativeMarkValue(currentConfig.negativeMarkValue);

    const predefinedDurations = DURATION_OPTIONS.filter(opt => opt.value !== "custom").map(opt => opt.value);
    if (currentConfig.isTimedTest && predefinedDurations.includes(String(currentConfig.durationMinutes))) {
      setSelectedDurationValue(String(currentConfig.durationMinutes));
      setCustomDurationInput(""); 
    } else if (currentConfig.isTimedTest && currentConfig.durationMinutes > 0) { // Was a custom value
      setSelectedDurationValue("custom");
      setCustomDurationInput(String(currentConfig.durationMinutes));
    } else { // Not timed or 0 duration, default to 30 or first option if 30 isn't there
      setSelectedDurationValue(DURATION_OPTIONS.find(opt => opt.value === "30")?.value || DURATION_OPTIONS[0]?.value || "30");
      setCustomDurationInput("");
    }
  }, [currentConfig]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    let finalDurationMinutes = 0;

    if (isTimedTest) {
      if (selectedDurationValue === "custom") {
        finalDurationMinutes = parseInt(customDurationInput, 10);
        if (isNaN(finalDurationMinutes) || finalDurationMinutes <= 0) {
          toast({
            title: "Invalid Duration",
            description: "Custom duration must be a positive number of minutes.",
            variant: "destructive",
          });
          return; 
        }
      } else {
        finalDurationMinutes = parseInt(selectedDurationValue, 10);
      }
    }

    onSubmitConfig({
      isTimedTest,
      durationMinutes: finalDurationMinutes,
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
                  value={selectedDurationValue}
                  onValueChange={(value) => {
                    setSelectedDurationValue(value);
                    if (value !== "custom") {
                      setCustomDurationInput(""); // Clear custom input if a predefined option is chosen
                    } else {
                       // Optionally set focus to custom input or prefill with a common value
                       setCustomDurationInput(currentConfig.durationMinutes > 0 && !DURATION_OPTIONS.map(d=>d.value).includes(String(currentConfig.durationMinutes)) ? String(currentConfig.durationMinutes) : "60");
                    }
                  }}
                >
                  <SelectTrigger id="duration-select">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATION_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedDurationValue === "custom" && (
                  <div className="mt-2 space-y-1">
                    <Label htmlFor="custom-duration-input" className="text-xs">Custom Duration (minutes)</Label>
                    <Input
                      id="custom-duration-input"
                      type="number"
                      value={customDurationInput}
                      onChange={(e) => setCustomDurationInput(e.target.value)}
                      placeholder="e.g., 75"
                      min="1"
                      className="w-full"
                    />
                  </div>
                )}
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

