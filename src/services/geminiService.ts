
import { AnalysisResultData, SuggestionItem } from '@/components/AnalysisResult';

export interface AnalysisRequest {
  resumeText: string;
  jobDescription: string;
}

// This is a mock implementation. In a real app, you'd call the Gemini API.
export const analyzeResume = async (
  request: AnalysisRequest
): Promise<AnalysisResultData> => {
  try {
    // In production, this would make an API call to Google Gemini API
    
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    // Generate a random match percentage between 50 and 95
    const matchPercentage = Math.floor(Math.random() * 46) + 50;
    
    // Create a set of skills with random match status
    const allSkills = ["React", "TypeScript", "Node.js", "CI/CD", "AWS", "Testing", 
                       "Docker", "Kubernetes", "GraphQL", "REST API", "SQL", "NoSQL",
                       "Python", "Java", "Agile", "Scrum", "DevOps"];
    
    // Randomly select skills (between 5 and 10)
    const skillCount = Math.floor(Math.random() * 6) + 5;
    const selectedSkills = [...allSkills].sort(() => 0.5 - Math.random()).slice(0, skillCount);
    
    // Randomly determine which skills are matched (more matches for higher percentage)
    const matchedCount = Math.round((matchPercentage / 100) * selectedSkills.length);
    const shuffledSkills = [...selectedSkills].sort(() => 0.5 - Math.random());
    
    const keySkillsMatch = selectedSkills.map(skill => ({
      skill,
      matched: shuffledSkills.indexOf(skill) < matchedCount
    }));
    
    // Generate missing keywords
    const missingSkills = allSkills
      .filter(skill => !selectedSkills.includes(skill))
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 4) + 2);
    
    // Generate improvement suggestions based on missing keywords
    const improvementSuggestions: SuggestionItem[] = [
      { 
        text: `Add specific metrics and outcomes to demonstrate your accomplishments`, 
        type: "improvement" as const
      },
      { 
        text: `Include keywords like '${missingSkills.join("', '")}' which are mentioned in the job description`, 
        type: "improvement" as const
      },
      { 
        text: `Consider reorganizing your resume to highlight your most relevant experience first`, 
        type: "improvement" as const 
      },
      {
        text: `Use action verbs to describe your experiences (e.g., 'implemented', 'developed', 'managed')`,
        type: "improvement" as const
      },
      {
        text: `Tailor your resume summary to specifically address this role's requirements`,
        type: "improvement" as const
      }
    ];
    
    // Generate strength points based on matched skills
    const matchedSkills = keySkillsMatch
      .filter(item => item.matched)
      .map(item => item.skill);
    
    const strengthSuggestions: SuggestionItem[] = [
      { 
        text: `Your strong background in ${matchedSkills.slice(0, 2).join(" and ")} aligns well with the job requirements`, 
        type: "strength" as const 
      },
      { 
        text: `Your experience with ${matchedSkills[Math.floor(Math.random() * matchedSkills.length)]} is valuable for this position`, 
        type: "strength" as const
      }
    ];

    if (matchedSkills.length > 2) {
      strengthSuggestions.push({
        text: `Your diverse skill set including ${matchedSkills.slice(0, 3).join(", ")} makes you a well-rounded candidate`,
        type: "strength" as const
      });
    }
    
    // Combine all suggestions
    const suggestions: SuggestionItem[] = [...improvementSuggestions, ...strengthSuggestions];
    
    const mockResult: AnalysisResultData = {
      matchPercentage,
      keySkillsMatch,
      suggestions,
      missingKeywords: missingSkills,
      improvementPlan: [
        `Update your resume summary to target this specific role`,
        `Add the missing keywords: ${missingSkills.join(", ")}`,
        `Quantify your achievements with specific metrics`,
        `Reorganize to prioritize your most relevant experience`,
        `Consider getting certifications in ${missingSkills[0] || "relevant technologies"}`
      ]
    };
    
    return mockResult;
  } catch (error) {
    console.error("Error analyzing resume:", error);
    throw error;
  }
};

// This function would implement the actual Gemini API call in production
export const callGeminiApi = async (
  resumeText: string, 
  jobDescription: string,
  apiKey: string
) => {
  // This would be implemented with the actual Gemini API
  // For example:
  /*
  const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: `Analyze this resume against this job description.
              
              Resume:
              ${resumeText}
              
              Job Description:
              ${jobDescription}
              
              Provide:
              1. A percentage match score
              2. Key matching skills
              3. Missing skills or keywords
              4. Specific improvement suggestions
              5. Strengths of the resume against this job`
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024
      }
    })
  });

  const data = await response.json();
  // Process the response to extract the structured analysis
  */
};
