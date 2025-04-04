
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import Header from '@/components/Header';
import FileUpload from '@/components/FileUpload';
import JobDescriptionInput from '@/components/JobDescriptionInput';
import AnalysisResult, { AnalysisResultData } from '@/components/AnalysisResult';
import { extractTextFromPdf } from '@/services/pdfService';
import { analyzeResume } from '@/services/geminiService';

const Index = () => {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState<string>('');
  const [jobDescription, setJobDescription] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResultData | null>(null);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('input');

  const handleResumeUpload = async (file: File) => {
    setResumeFile(file);
    try {
      const text = await extractTextFromPdf(file);
      setResumeText(text);
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      toast.error('Failed to extract text from the resume');
    }
  };

  const handleAnalyze = async () => {
    if (!resumeFile) {
      toast.error('Please upload your resume');
      return;
    }

    if (!jobDescription.trim()) {
      toast.error('Please enter the job description');
      return;
    }

    try {
      setAnalyzing(true);
      setActiveTab('result');
      
      // In production, this would use the actual Gemini API
      // For now, we'll use our mock service
      const result = await analyzeResume({
        resumeText,
        jobDescription
      });
      
      setAnalysisResult(result);
    } catch (error) {
      console.error('Error analyzing resume:', error);
      toast.error('Failed to analyze resume. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-careerSync-gray">
      <Header />
      
      <main className="flex-1 container max-w-5xl px-4 py-8">
        <section className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-careerSync-darkBlue mb-4">
            Optimize Your Resume for the Job
          </h1>
          <p className="text-lg max-w-2xl mx-auto text-gray-600">
            Upload your resume and job description. Our AI will analyze the match and provide personalized improvement suggestions.
          </p>
        </section>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="input">Input</TabsTrigger>
            <TabsTrigger value="result" disabled={!analysisResult && !analyzing}>
              Results
            </TabsTrigger>
          </TabsList>

          <TabsContent value="input">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <FileUpload onUpload={handleResumeUpload} />
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <JobDescriptionInput 
                    value={jobDescription} 
                    onChange={setJobDescription} 
                  />
                </CardContent>
              </Card>
            </div>
            
            {/* API Key input - in production this should be secured */}
            <Card className="mt-6">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <label 
                    htmlFor="apiKey" 
                    className="text-sm font-medium"
                  >
                    Google Gemini API Key
                  </label>
                  <input
                    id="apiKey"
                    type="password"
                    placeholder="Enter your Gemini API Key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  />
                  <p className="text-xs text-gray-500">
                    Your API key is stored only in your browser and is never sent to our servers.
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-center mt-8">
              <Button 
                size="lg" 
                onClick={handleAnalyze}
                disabled={!resumeFile || !jobDescription.trim() || !apiKey.trim()}
                className="bg-careerSync-blue hover:bg-careerSync-darkBlue"
              >
                Analyze Resume
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="result">
            <AnalysisResult result={analysisResult} loading={analyzing} />
            
            <div className="flex justify-center mt-8">
              <Button 
                variant="outline" 
                onClick={() => setActiveTab('input')}
                className="mr-4"
              >
                Back to Input
              </Button>
              <Button onClick={() => window.print()} variant="secondary">
                Print Results
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="py-6 bg-careerSync-blue text-white">
        <div className="container text-center">
          <p className="text-sm">
            CareerSync AI - Resume Optimization Tool © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
