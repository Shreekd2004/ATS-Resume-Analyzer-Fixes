
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface JobDescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
}

const JobDescriptionInput = ({ value, onChange }: JobDescriptionInputProps) => {
  return (
    <div className="w-full">
      <Label htmlFor="jobDescription" className="text-sm font-medium">
        Job Description
      </Label>
      <Textarea
        id="jobDescription"
        placeholder="Paste the job description here..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[200px] mt-2 resize-y"
      />
    </div>
  );
};

export default JobDescriptionInput;
