
"use client";

import { useEffect, useState } from "react";
import type { TestHistoryEntry } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Inbox, RotateCcw, Eye } from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/layout/header"; // Assuming your Header is in this path

const HISTORY_STORAGE_KEY = "testGeniusHistory";

export default function HistoryPage() {
  const [history, setHistory] = useState<TestHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Failed to load test history from localStorage:", error);
      // Optionally, show a toast or error message to the user
    } finally {
      setIsLoading(false);
    }
  }, []);

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getGenerationModeText = (mode: TestHistoryEntry['generationMode']) => {
    switch (mode) {
      case 'extract_from_document': return "Extracted from Document";
      case 'generate_from_syllabus': return "Generated from Syllabus";
      case 'generate_from_topic': return "Generated from Topic";
      default: return "Test";
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <p>Loading history...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Card className="w-full max-w-4xl mx-auto shadow-xl">
          <CardHeader>
            <CardTitle className="font-headline text-3xl text-center">Test History</CardTitle>
            <CardDescription className="text-center">
              Review your past tests and their results.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Inbox className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-xl font-semibold text-muted-foreground">No test history yet.</p>
                <p className="text-muted-foreground">Complete some tests, and they'll show up here!</p>
                <Button asChild className="mt-6">
                  <Link href="/">Start a New Test</Link>
                </Button>
              </div>
            ) : (
              <ScrollArea className="h-[60vh] pr-4">
                <div className="space-y-4">
                  {history.sort((a,b) => b.timestamp - a.timestamp).map((entry) => (
                    <Card key={entry.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <CardTitle className="text-xl flex justify-between items-center">
                          <span>{getGenerationModeText(entry.generationMode)}</span>
                           <span className="text-sm font-normal text-muted-foreground">{formatTimestamp(entry.timestamp)}</span>
                        </CardTitle>
                        <CardDescription>
                          Source: {entry.sourceIdentifier}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold text-primary">
                          Score: {entry.scoreSummary.score} / {entry.scoreSummary.totalQuestions}
                          <span className="text-lg font-medium text-muted-foreground ml-2">
                             ({(entry.scoreSummary.score / entry.scoreSummary.totalQuestions * 100).toFixed(1)}%)
                          </span>
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Timer: {entry.testConfiguration.timerMinutes ? `${entry.testConfiguration.timerMinutes} min` : "None"}
                          {entry.testConfiguration.negativeMarkingValue !== null && 
                           `, Negative Marking: ${entry.testConfiguration.negativeMarkingValue}`}
                        </p>
                      </CardContent>
                      <CardFooter className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" disabled> 
                          <Eye className="mr-2 h-4 w-4" /> View Details (Soon)
                        </Button>
                        <Button variant="default" size="sm" disabled>
                           <RotateCcw className="mr-2 h-4 w-4" /> Reattempt (Soon)
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </main>
      <footer className="py-4 text-center text-sm text-muted-foreground border-t">
        <p>&copy; {new Date().getFullYear()} TestGenius. Powered by AI.</p>
      </footer>
    </div>
  );
}
