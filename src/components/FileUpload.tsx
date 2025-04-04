
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { FileIcon, UploadIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface FileUploadProps {
  onUpload: (file: File) => void;
}

const FileUpload = ({ onUpload }: FileUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    if (selectedFile.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setFile(selectedFile);
    onUpload(selectedFile);
    toast.success('Resume uploaded successfully');
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full">
      <Label htmlFor="resume" className="text-sm font-medium">
        Upload Resume (PDF)
      </Label>
      <div
        className={`mt-2 flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 transition-colors ${
          dragOver 
            ? 'border-careerSync-blue bg-careerSync-blue/10' 
            : 'border-gray-300 hover:border-careerSync-lightBlue'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center space-y-2">
          <UploadIcon className="h-8 w-8 text-gray-400" />
          <p className="text-sm text-gray-500">
            Drag and drop your resume, or click to browse
          </p>
          <Input
            id="resume"
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById('resume')?.click()}
            className="mt-2"
          >
            Select File
          </Button>
        </div>
      </div>

      {file && (
        <Card className="mt-4 overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <FileIcon className="h-8 w-8 text-careerSync-blue" />
              <div className="flex-1 truncate">
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-gray-500">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FileUpload;
