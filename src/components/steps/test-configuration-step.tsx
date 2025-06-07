
"use client";

import type { TestConfiguration } from "@/types";
import { useState, type FormEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { CheckCircle, Clock, MinusCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TestConfigurationStepProps {
  currentConfig: TestConfiguration;
  onSubmit: (config: TestConfiguration) => void;
}

const timerOptions = [
  { value: "none", label: "No Timer" },
  { value: "15", label: "15 minutes" },
  { value: "30", label: "30 minutes" },
  { value: "45", label: "45 minutes" },
  { value: "60", label: "60 minutes" },
  { value: "120", label: "2 hours" },
  { value: "custom", label: "Custom" },
];

export function TestConfigurationStep({ currentConfig, onSubmit }: TestConfigurationStepProps) {
  const [selectedTimerOption, setSelectedTimerOption] = useState<string>(() => {
    if (currentConfig.timerMinutes === null) return "none";
    const foundOption = timerOptions.find(opt => opt.value === String(currentConfig.timerMinutes));
    return foundOption ? foundOption.value : "custom";
  });

  const [customTimerMinutes, setCustomTimerMinutes] = useState<string>(
    currentConfig.timerMinutes !== null && !timerOptions.find(opt => opt.value === String(currentConfig.timerMinutes))
      ? String(currentConfig.timerMinutes)
      : ""
  );
  
  const [isNegativeMarkingEnabled, setIsNegativeMarkingEnabled] = useState<boolean>(currentConfig.negativeMarkingValue !== null);
  const [negativeMarkingValueInput, setNegativeMarkingValueInput] = useState<string>(
    currentConfig.negativeMarkingValue === null ? "0.25" : String(currentConfig.negativeMarkingValue)
  );

  const [timerError, setTimerError] = useState<string | null>(null);
  const [negativeMarkingError, setNegativeMarkingError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedTimerOption !== "custom") {
      setCustomTimerMinutes("");
      setTimerError(null);
    }
  }, [selectedTimerOption]);

  useEffect(() => {
     if (!isNegativeMarkingEnabled) {
        setNegativeMarkingError(null);
     }
  }, [isNegativeMarkingEnabled]);


  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    let finalTimerMinutes: number | null = null;
    if (selectedTimerOption === "custom") {
      if (customTimerMinutes.trim() === "") {
        setTimerError("Custom timer value cannot be empty.");
        return;
      }
      finalTimerMinutes = parseInt(customTimerMinutes, 10);
      if (isNaN(finalTimerMinutes) || finalTimerMinutes <= 0) {
        setTimerError("Timer must be a positive number of minutes.");
        return;
      }
      if (finalTimerMinutes > 1440) { 
        setTimerError("Timer cannot exceed 1440 minutes (24 hours).");
        return;
      }
    } else if (selectedTimerOption !== "none") {
      finalTimerMinutes = parseInt(selectedTimerOption, 10);
    }
    setTimerError(null);

    let finalNegativeMarkingValue: number | null = null;
    if (isNegativeMarkingEnabled) {
      if (negativeMarkingValueInput.trim() === "") {
        setNegativeMarkingError("Negative marking value cannot be empty.");
        return;
      }
      finalNegativeMarkingValue = parseFloat(negativeMarkingValueInput);
      if (isNaN(finalNegativeMarkingValue) || finalNegativeMarkingValue <= 0) {
        setNegativeMarkingError("Negative marking value must be a positive number.");
        return;
      }
      if (finalNegativeMarkingValue > 100) { 
        setNegativeMarkingError("Negative marking value seems too high.");
        return;
      }
    }
    setNegativeMarkingError(null);

    onSubmit({ timerMinutes: finalTimerMinutes, negativeMarkingValue: finalNegativeMarkingValue });
  };

  const handleCustomTimerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d+$/.test(value)) {
        setCustomTimerMinutes(value);
        if (timerError) setTimerError(null);
    }
  };
  
  const handleNegativeMarkingValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
        setNegativeMarkingValueInput(value);
        if (negativeMarkingError) setNegativeMarkingError(null);
    }
  };


  return (
    <Card className="w-full max-w-lg shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-3xl text-center flex items-center justify-center gap-2">
          <Clock className="h-8 w-8 text-primary" />
          Test Configuration
        </CardTitle>
        <CardDescription className="text-center">
          Set a timer and choose marking options for your test.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-3">
            <Label htmlFor="timer-select" className="text-base">
              Set Timer
            </Label>
            <Select value={selectedTimerOption} onValueChange={setSelectedTimerOption}>
              <SelectTrigger id="timer-select">
                <SelectValue placeholder="Select timer option" />
              </SelectTrigger>
              <SelectContent>
                {timerOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedTimerOption === "custom" && (
              <div className="space-y-1 pt-2">
                <Label htmlFor="custom-timer-minutes" className="text-sm">Custom Timer (in minutes)</Label>
                <Input
                  id="custom-timer-minutes"
                  type="number" // Input type is number, text-sm is default now
                  placeholder="e.g., 75"
                  value={customTimerMinutes}
                  onChange={handleCustomTimerChange}
                  min="1"
                  step="1"
                  className={timerError ? "border-destructive" : ""}
                />
                 <p className="text-xs text-muted-foreground">Max 1440 minutes.</p>
              </div>
            )}
            {timerError && <p className="text-sm text-destructive">{timerError}</p>}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                    <Label htmlFor="negative-marking-switch" className="text-base flex items-center gap-2">
                        <MinusCircle className="h-5 w-5 text-destructive"/> Enable Negative Marking
                    </Label>
                    <p className="text-xs text-muted-foreground">
                        If enabled, specify marks deducted for incorrect answers.
                    </p>
                </div>
                <Switch
                id="negative-marking-switch"
                checked={isNegativeMarkingEnabled}
                onCheckedChange={setIsNegativeMarkingEnabled}
                aria-label="Toggle negative marking"
                />
            </div>
            {isNegativeMarkingEnabled && (
                 <div className="space-y-1 pt-2 pl-1">
                    <Label htmlFor="negative-marking-value" className="text-sm">Marks per incorrect answer</Label>
                    <Input
                    id="negative-marking-value"
                    type="number" // Input type is number, text-sm is default now
                    placeholder="e.g., 0.25 or 1"
                    value={negativeMarkingValueInput}
                    onChange={handleNegativeMarkingValueChange}
                    step="0.01"
                    min="0.01"
                    className={negativeMarkingError ? "border-destructive" : ""}
                    />
                    {negativeMarkingError && <p className="text-sm text-destructive">{negativeMarkingError}</p>}
                 </div>
            )}
          </div>
          
          <Button 
            type="submit" 
            size="lg"
            className="w-full text-base bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <CheckCircle className="mr-2 h-5 w-5" />
            Start Test
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
