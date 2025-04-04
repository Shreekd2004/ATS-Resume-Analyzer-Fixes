
import React from 'react';
import { Button } from '@/components/ui/button';
import { BriefcaseIcon } from 'lucide-react';

const Header = () => {
  return (
    <header className="w-full bg-careerSync-blue text-white p-4 shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <BriefcaseIcon className="h-6 w-6" />
          <h1 className="text-xl md:text-2xl font-bold">CareerSync AI</h1>
        </div>
        <div className="hidden md:flex items-center space-x-4">
          <Button variant="ghost" className="text-white hover:bg-careerSync-darkBlue">
            How It Works
          </Button>
          <Button variant="outline" className="text-white border-white hover:bg-careerSync-darkBlue">
            About
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
