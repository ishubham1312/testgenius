
"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { extractTextFromPdf } from "@/lib/pdf-parser";
import { BookMarked, FileText, Loader2, ArrowRight } from "lucide-react";

interface SyllabusUploadStepProps {
  onFileProcessed: (text: string, fileName: string) => void;
  setIsLoadingGlobally: (isLoading: boolean) => void;
}

export function SyllabusUploadStep({ onFileProcessed, setIsLoadingGlobally }: SyllabusUploadStepProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      if (selectedFile.type === "application/pdf" || selectedFile.type === "text/plain") {
        setFile(selectedFile);
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF or TXT file for the syllabus.",
          variant: "destructive",
        });
        setFile(null);
        event.target.value = ""; 
      }
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      toast({
        title: "No File Selected",
        description: "Please select a syllabus file to upload.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    // setIsLoadingGlobally(true); // Parent will handle this after this step leads to options

    try {
      let textContent = "";
      if (file.type === "application/pdf") {
        textContent = await extractTextFromPdf(file);
      } else if (file.type === "text/plain") {
        textContent = await file.text();
      }
      onFileProcessed(textContent, file.name);
    } catch (error) {
      console.error("Error processing syllabus file:", error);
      toast({
        title: "Error Processing Syllabus",
        description: (error as Error).message || "An unexpected error occurred.",
        variant: "destructive",
      });
       setIsLoadingGlobally(false); // Release global lock on error
    } finally {
      setIsProcessing(false);
      // setIsLoadingGlobally(false) will be handled by the parent if needed
    }
  };

  return (
    <Card className="w-full max-w-lg shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-3xl text-center flex items-center justify-center gap-2">
            <BookMarked className="h-8 w-8 text-primary"/> Upload Syllabus
        </CardTitle>
        <CardDescription className="text-center">
          Upload a PDF or TXT file containing the syllabus to generate questions from.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="syllabus-upload" className="text-base">Select Syllabus File</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="syllabus-upload"
                type="file"
                accept=".pdf,.txt"
                onChange={handleFileChange}
                className="cursor-pointer file:text-primary file:font-semibold hover:file:bg-primary/10"
                disabled={isProcessing}
              />
            </div>
            {file && (
              <p className="text-sm text-muted-foreground flex items-center">
                <FileText className="w-4 h-4 mr-2 shrink-0" /> Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>
          <Button 
            type="submit" 
            size="lg"
            className="w-full text-base bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-opacity" 
            disabled={!file || isProcessing}
          >
            {isProcessing ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <ArrowRight className="mr-2 h-5 w-5" />
            )}
            {isProcessing ? "Processing Syllabus..." : "Proceed to Options"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
