
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { FileIcon, TrashIcon, UploadIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface FileUploadProps {
  onUpload: (files: File[]) => void;
  files: File[];
  onRemoveFile: (index: number) => void;
}

const FileUpload = ({ onUpload, files, onRemoveFile }: FileUploadProps) => {
  const [dragOver, setDragOver] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      validateAndSetFiles(selectedFiles);
    }
  };

  const validateAndSetFiles = (selectedFiles: File[]) => {
    const validFiles: File[] = [];
    let hasInvalidFiles = false;

    selectedFiles.forEach((file) => {
      if (file.type !== 'application/pdf') {
        hasInvalidFiles = true;
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        hasInvalidFiles = true;
        return;
      }

      validFiles.push(file);
    });

    if (hasInvalidFiles) {
      toast.error('Some files were skipped. Only PDF files under 5MB are accepted');
    }

    if (validFiles.length > 0) {
      onUpload(validFiles);
      toast.success(`${validFiles.length} resume(s) uploaded successfully`);
    }
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
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFiles(Array.from(e.dataTransfer.files));
    }
  };

  return (
    <div className="w-full">
      <Label htmlFor="resume" className="text-sm font-medium">
        Upload Resumes (PDF)
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
            Drag and drop your resumes, or click to browse
          </p>
          <Input
            id="resume"
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="hidden"
            multiple
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById('resume')?.click()}
            className="mt-2"
          >
            Select Files
          </Button>
        </div>
      </div>

      {files.length > 0 && (
        <div className="mt-4 space-y-3">
          <p className="text-sm font-medium">{files.length} Resume(s) Selected</p>
          {files.map((file, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <FileIcon className="h-8 w-8 text-careerSync-blue" />
                  <div className="flex-1 truncate">
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveFile(index)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
