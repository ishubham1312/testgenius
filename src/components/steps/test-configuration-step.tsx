
"use client";

import type { TestConfiguration } from "@/types";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { CheckCircle, Clock, MinusCircle } from "lucide-react";

interface TestConfigurationStepProps {
  currentConfig: TestConfiguration;
  onSubmit: (config: TestConfiguration) => void;
}

export function TestConfigurationStep({ currentConfig, onSubmit }: TestConfigurationStepProps) {
  const [timerMinutes, setTimerMinutes] = useState<string>(
    currentConfig.timerMinutes === null ? "" : String(currentConfig.timerMinutes)
  );
  const [negativeMarkingEnabled, setNegativeMarkingEnabled] = useState<boolean>(currentConfig.negativeMarkingEnabled);
  const [timerError, setTimerError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    let parsedTimerMinutes: number | null = null;
    if (timerMinutes.trim() !== "") {
      parsedTimerMinutes = parseInt(timerMinutes, 10);
      if (isNaN(parsedTimerMinutes) || parsedTimerMinutes <= 0) {
        setTimerError("Timer must be a positive number of minutes.");
        return;
      }
       if (parsedTimerMinutes > 720) { // 12 hours limit
        setTimerError("Timer cannot exceed 720 minutes (12 hours).");
        return;
      }
    }
    setTimerError(null);
    onSubmit({ timerMinutes: parsedTimerMinutes, negativeMarkingEnabled });
  };

  const handleTimerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
     // Allow empty input or positive integers
    if (value === "" || (/^\d+$/.test(value) && parseInt(value,10) > 0) ) {
        setTimerMinutes(value);
        if (timerError) setTimerError(null);
    } else if (value === "0" && timerMinutes === "") { // allow typing '0' initially if followed by other digits
        setTimerMinutes(value);
    } else if (value === "" && timerMinutes !== "") { // allow deleting to empty
         setTimerMinutes("");
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
            <Label htmlFor="timer-minutes" className="text-base">
              Set Timer (in minutes)
            </Label>
            <Input
              id="timer-minutes"
              type="number"
              placeholder="e.g., 60 (leave blank for no timer)"
              value={timerMinutes}
              onChange={handleTimerChange}
              min="1"
              step="1"
              className={timerError ? "border-destructive" : ""}
            />
            {timerError && <p className="text-sm text-destructive">{timerError}</p>}
            <p className="text-xs text-muted-foreground">Leave blank or set to 0 for no timer. Max 720 minutes.</p>
          </div>

          <div className="flex items-center justify-between space-y-0 rounded-lg border p-4">
            <div className="space-y-0.5">
                <Label htmlFor="negative-marking" className="text-base flex items-center gap-2">
                    <MinusCircle className="h-5 w-5 text-destructive"/> Enable Negative Marking
                </Label>
                <p className="text-xs text-muted-foreground">
                    If enabled, incorrect answers may deduct points. (Actual scoring logic depends on AI/key settings).
                </p>
            </div>
            <Switch
              id="negative-marking"
              checked={negativeMarkingEnabled}
              onCheckedChange={setNegativeMarkingEnabled}
              aria-label="Toggle negative marking"
            />
          </div>
          
          <Button type="submit" className="w-full text-lg py-6">
            <CheckCircle className="mr-2 h-5 w-5" />
            Start Test
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
