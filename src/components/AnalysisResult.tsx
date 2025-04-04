
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowUpIcon, CheckIcon, XIcon } from 'lucide-react';

export interface SuggestionItem {
  text: string;
  type: 'strength' | 'improvement';
}

export interface AnalysisResultData {
  matchPercentage: number;
  keySkillsMatch: {
    skill: string;
    matched: boolean;
  }[];
  suggestions: SuggestionItem[];
  missingKeywords: string[];
}

interface AnalysisResultProps {
  result: AnalysisResultData | null;
  loading: boolean;
}

const AnalysisResult = ({ result, loading }: AnalysisResultProps) => {
  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-center">Analyzing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse-light"></div>
            <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse-light"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse-light"></div>
            <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse-light"></div>
            <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse-light"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!result) {
    return null;
  }

  const { matchPercentage, keySkillsMatch, suggestions, missingKeywords } = result;
  
  const getMatchColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMatchBg = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-600';
    if (percentage >= 60) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-center">Analysis Result</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Resume Match</h3>
            <span className={`text-2xl font-bold ${getMatchColor(matchPercentage)}`}>
              {matchPercentage}%
            </span>
          </div>
          <Progress value={matchPercentage} className={getMatchBg(matchPercentage)} />
        </div>
        
        <div className="space-y-2">
          <h3 className="font-medium">Key Skills</h3>
          <div className="flex flex-wrap gap-2">
            {keySkillsMatch.map((skill, index) => (
              <Badge 
                key={index} 
                variant={skill.matched ? "default" : "outline"}
                className={skill.matched ? "bg-careerSync-blue" : "text-gray-500"}
              >
                {skill.matched ? <CheckIcon className="h-3 w-3 mr-1" /> : <XIcon className="h-3 w-3 mr-1" />}
                {skill.skill}
              </Badge>
            ))}
          </div>
        </div>

        {missingKeywords.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium">Missing Keywords</h3>
            <div className="flex flex-wrap gap-2">
              {missingKeywords.map((keyword, index) => (
                <Badge key={index} variant="outline" className="text-red-500 border-red-300">
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        <Separator />
        
        <div className="space-y-4">
          <h3 className="font-medium">Improvement Suggestions</h3>
          {suggestions.filter(s => s.type === 'improvement').map((suggestion, index) => (
            <div key={index} className="flex items-start space-x-2 p-2 bg-red-50 rounded-md">
              <ArrowUpIcon className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm">{suggestion.text}</p>
            </div>
          ))}
        </div>
        
        <div className="space-y-4">
          <h3 className="font-medium">Strengths</h3>
          {suggestions.filter(s => s.type === 'strength').map((suggestion, index) => (
            <div key={index} className="flex items-start space-x-2 p-2 bg-green-50 rounded-md">
              <CheckIcon className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <p className="text-sm">{suggestion.text}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalysisResult;
