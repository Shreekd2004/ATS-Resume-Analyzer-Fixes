
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import Header from '@/components/Header';
import FileUpload from '@/components/FileUpload';
import JobDescriptionInput from '@/components/JobDescriptionInput';
import AnalysisResult, { AnalysisResultData } from '@/components/AnalysisResult';
import ResumeRankingList from '@/components/ResumeRankingList';
import { extractTextFromPdf } from '@/services/pdfService';
import { analyzeResume } from '@/services/geminiService';

interface ResumeData {
  file: File;
  text: string;
  result: AnalysisResultData | null;
}

const Index = () => {
  const [resumeFiles, setResumeFiles] = useState<ResumeData[]>([]);
  const [jobDescription, setJobDescription] = useState<string>('');
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('input');
  const [selectedResultIndex, setSelectedResultIndex] = useState<number | null>(null);

  const handleResumeUpload = async (files: File[]) => {
    try {
      const newResumeData: ResumeData[] = [];
      
      for (const file of files) {
        // Check if file already exists in the list
        const exists = resumeFiles.some(resumeData => 
          resumeData.file.name === file.name && 
          resumeData.file.size === file.size
        );
        
        if (!exists) {
          const text = await extractTextFromPdf(file);
          newResumeData.push({ file, text, result: null });
        }
      }
      
      setResumeFiles(prev => [...prev, ...newResumeData]);
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      toast.error('Failed to extract text from one or more resumes');
    }
  };

  const handleRemoveFile = (index: number) => {
    setResumeFiles(prev => prev.filter((_, i) => i !== index));
    if (selectedResultIndex === index) {
      setSelectedResultIndex(null);
    } else if (selectedResultIndex !== null && selectedResultIndex > index) {
      setSelectedResultIndex(selectedResultIndex - 1);
    }
  };

  const handleAnalyze = async () => {
    if (resumeFiles.length === 0) {
      toast.error('Please upload at least one resume');
      return;
    }

    if (!jobDescription.trim()) {
      toast.error('Please enter the job description');
      return;
    }

    try {
      setAnalyzing(true);
      setActiveTab('result');
      
      const updatedResumeFiles = [...resumeFiles];
      
      for (let i = 0; i < updatedResumeFiles.length; i++) {
        const result = await analyzeResume({
          resumeText: updatedResumeFiles[i].text,
          jobDescription
        });
        
        updatedResumeFiles[i].result = result;
      }
      
      setResumeFiles(updatedResumeFiles);
      
      // Set the highest-matching resume as selected by default
      const highestMatchIndex = updatedResumeFiles
        .map((data, index) => ({ index, percentage: data.result?.matchPercentage || 0 }))
        .sort((a, b) => b.percentage - a.percentage)[0]?.index || 0;
      
      setSelectedResultIndex(highestMatchIndex);
    } catch (error) {
      console.error('Error analyzing resumes:', error);
      toast.error('Failed to analyze resumes. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleViewDetails = (index: number) => {
    setSelectedResultIndex(selectedResultIndex === index ? null : index);
  };

  const completedResults = resumeFiles
    .filter(resumeData => resumeData.result !== null)
    .map(resumeData => ({
      file: resumeData.file,
      result: resumeData.result!
    }));

  const selectedResult = selectedResultIndex !== null && selectedResultIndex < resumeFiles.length
    ? resumeFiles[selectedResultIndex].result
    : null;
  
  const selectedFile = selectedResultIndex !== null && selectedResultIndex < resumeFiles.length
    ? resumeFiles[selectedResultIndex].file
    : null;

  return (
    <div className="flex flex-col min-h-screen bg-careerSync-gray">
      <Header />
      
      <main className="flex-1 container max-w-5xl px-4 py-8">
        <section className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-careerSync-darkBlue mb-4">
            Optimize Your Resumes for the Job
          </h1>
          <p className="text-lg max-w-2xl mx-auto text-gray-600">
            Upload multiple resumes and a job description. Our AI will analyze the match, rank the resumes, and provide personalized improvement suggestions.
          </p>
        </section>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="input">Input</TabsTrigger>
            <TabsTrigger value="result" disabled={completedResults.length === 0 && !analyzing}>
              Results
            </TabsTrigger>
          </TabsList>

          <TabsContent value="input">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <FileUpload 
                    onUpload={handleResumeUpload} 
                    files={resumeFiles.map(data => data.file)}
                    onRemoveFile={handleRemoveFile}
                  />
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
                disabled={resumeFiles.length === 0 || !jobDescription.trim() || !apiKey.trim()}
                className="bg-careerSync-blue hover:bg-careerSync-darkBlue"
              >
                {resumeFiles.length > 1 ? 'Analyze & Rank Resumes' : 'Analyze Resume'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="result">
            {analyzing ? (
              <Card className="w-full">
                <CardContent className="pt-6">
                  <div className="text-center p-8">
                    <div className="animate-spin h-8 w-8 border-4 border-careerSync-blue border-t-transparent rounded-full mx-auto"></div>
                    <p className="mt-4 text-lg">Analyzing {resumeFiles.length} resume(s)...</p>
                  </div>
                </CardContent>
              </Card>
            ) : completedResults.length > 0 ? (
              <div className="space-y-6">
                <ResumeRankingList 
                  results={completedResults}
                  onViewDetails={handleViewDetails}
                  selectedIndex={selectedResultIndex}
                />
                
                {selectedResult && selectedFile && (
                  <div className="mt-8">
                    <div className="mb-4 flex items-center">
                      <h2 className="text-xl font-bold">Analysis for: {selectedFile.name}</h2>
                    </div>
                    <AnalysisResult result={selectedResult} loading={false} />
                  </div>
                )}
                
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
              </div>
            ) : null}
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
