
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDownIcon, ChevronUpIcon, FileIcon, StarIcon } from 'lucide-react';
import { AnalysisResultData } from './AnalysisResult';

interface ResumeResult {
  file: File;
  result: AnalysisResultData;
}

interface ResumeRankingListProps {
  results: ResumeResult[];
  onViewDetails: (index: number) => void;
  selectedIndex: number | null;
}

const ResumeRankingList = ({ results, onViewDetails, selectedIndex }: ResumeRankingListProps) => {
  // Sort results by match percentage (descending)
  const sortedResults = [...results].sort((a, b) => 
    b.result.matchPercentage - a.result.matchPercentage
  );

  const getMatchColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-100 text-green-800 border-green-300';
    if (percentage >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  return (
    <div className="w-full">
      <h2 className="text-xl font-bold mb-4">Resume Rankings</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">Rank</TableHead>
            <TableHead>Resume</TableHead>
            <TableHead>Match</TableHead>
            <TableHead className="w-[100px]">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedResults.map((item, index) => (
            <TableRow key={index} className={selectedIndex === index ? "bg-careerSync-blue/10" : ""}>
              <TableCell className="font-medium">
                {index === 0 && <StarIcon className="h-5 w-5 text-yellow-500 inline mr-1" />}
                #{index + 1}
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <FileIcon className="h-4 w-4 text-careerSync-blue" />
                  <span className="truncate max-w-[200px]">{item.file.name}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={getMatchColor(item.result.matchPercentage)}>
                  {item.result.matchPercentage}%
                </Badge>
              </TableCell>
              <TableCell>
                <Button 
                  size="sm" 
                  variant={selectedIndex === index ? "default" : "outline"}
                  onClick={() => onViewDetails(index)}
                >
                  {selectedIndex === index ? (
                    <>
                      <ChevronUpIcon className="h-4 w-4 mr-1" /> 
                      Hide
                    </>
                  ) : (
                    <>
                      <ChevronDownIcon className="h-4 w-4 mr-1" />
                      View
                    </>
                  )}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ResumeRankingList;
