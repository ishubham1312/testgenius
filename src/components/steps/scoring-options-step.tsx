
"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Bot, Upload, FileText, Loader2 } from "lucide-react";

interface ScoringOptionsStepProps {
  onScoreWithAI: () => void;
  onUploadKeyAndScore: (answers: string[]) => void;
  setIsLoadingGlobally: (isLoading: boolean) => void;
}

export function ScoringOptionsStep({ onScoreWithAI, onUploadKeyAndScore, setIsLoadingGlobally }: ScoringOptionsStepProps) {
  const [keyFile, setKeyFile] = useState<File | null>(null);
  const [isProcessingKey, setIsProcessingKey] = useState(false);
  const { toast } = useToast();

  const handleKeyFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      if (selectedFile.type === "text/plain" || selectedFile.type === "application/json") {
        setKeyFile(selectedFile);
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please upload a TXT or JSON file for the answer key.",
          variant: "destructive",
        });
        setKeyFile(null);
        event.target.value = ""; 
      }
    }
  };

  const handleUploadKey = async () => {
    if (!keyFile) {
      toast({
        title: "No Answer Key File Selected",
        description: "Please select an answer key file.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessingKey(true);
    setIsLoadingGlobally(true);

    try {
      const fileContent = await keyFile.text();
      let answers: string[];

      if (keyFile.type === "application/json") {
        answers = JSON.parse(fileContent);
        if (!Array.isArray(answers) || !answers.every(ans => typeof ans === 'string')) {
          throw new Error("JSON key must be an array of strings.");
        }
      } else { 
        answers = fileContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      }
      
      onUploadKeyAndScore(answers);

    } catch (error) {
      console.error("Error processing answer key:", error);
      toast({
        title: "Error Processing Answer Key",
        description: (error as Error).message || "Please ensure the file is correctly formatted.",
        variant: "destructive",
      });
      setIsLoadingGlobally(false); 
    } finally {
      setIsProcessingKey(false);
    }
  };
  
  const handleScoreWithAIClick = () => {
    setIsLoadingGlobally(true);
    onScoreWithAI();
  }

  return (
    <Card className="w-full max-w-lg shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-3xl text-center">Choose Scoring Method</CardTitle>
        <CardDescription className="text-center">
          How would you like to score your test?
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Button 
          onClick={handleScoreWithAIClick} 
          size="lg"
          className="w-full text-base bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <Bot className="mr-2 h-5 w-5" />
          Score with AI
        </Button>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="key-file-upload" className="text-base">Upload Answer Key (TXT or JSON)</Label>
          <div className="flex items-center space-x-2">
            <Input
              id="key-file-upload"
              type="file"
              accept=".txt,.json"
              onChange={handleKeyFileChange}
              className="cursor-pointer file:text-primary file:font-semibold hover:file:bg-primary/10" // text-sm is default
              disabled={isProcessingKey}
            />
          </div>
           {keyFile && (
              <p className="text-sm text-muted-foreground flex items-center">
                <FileText className="w-4 h-4 mr-2 shrink-0" /> Selected: {keyFile.name}
              </p>
            )}
        </div>
        <Button 
          onClick={handleUploadKey} 
          size="lg"
          className="w-full text-base" // No gradient for this secondary action by default
          variant="outline" 
          disabled={!keyFile || isProcessingKey}
        >
           {isProcessingKey ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Upload className="mr-2 h-5 w-5" />
            )}
          {isProcessingKey ? "Processing Key..." : "Upload Key & Score"}
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          For TXT files, provide one answer per line. For JSON, provide an array of strings. Answers should be in the same order as the questions.
        </p>
      </CardContent>
    </Card>
  );
}
