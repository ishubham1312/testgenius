"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { extractTextFromPdf } from "@/lib/pdf-parser";
import { UploadCloud, FileText, Loader2 } from "lucide-react";

interface FileUploadStepProps {
  onFileProcessed: (text: string) => void;
  setIsLoadingGlobally: (isLoading: boolean) => void;
}

export function FileUploadStep({ onFileProcessed, setIsLoadingGlobally }: FileUploadStepProps) {
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
          description: "Please upload a PDF or TXT file.",
          variant: "destructive",
        });
        setFile(null);
        event.target.value = ""; // Reset file input
      }
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      toast({
        title: "No File Selected",
        description: "Please select a file to upload.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setIsLoadingGlobally(true);

    try {
      let textContent = "";
      if (file.type === "application/pdf") {
        textContent = await extractTextFromPdf(file);
      } else if (file.type === "text/plain") {
        textContent = await file.text();
      }
      onFileProcessed(textContent);
    } catch (error) {
      console.error("Error processing file:", error);
      toast({
        title: "Error Processing File",
        description: (error as Error).message || "An unexpected error occurred.",
        variant: "destructive",
      });
      setIsLoadingGlobally(false);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full max-w-lg shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-3xl text-center">Upload Questions</CardTitle>
        <CardDescription className="text-center">
          Upload a PDF or TXT file containing your multiple-choice questions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="file-upload" className="text-base">Select File</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="file-upload"
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
          <Button type="submit" className="w-full text-lg py-6" disabled={!file || isProcessing}>
            {isProcessing ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <UploadCloud className="mr-2 h-5 w-5" />
            )}
            {isProcessing ? "Processing..." : "Extract Questions"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
