
import { AnalysisResultData, SuggestionItem } from '@/components/AnalysisResult';

export interface AnalysisRequest {
  resumeText: string;
  jobDescription: string;
}

export const analyzeResume = async (
  request: AnalysisRequest
): Promise<AnalysisResultData> => {
  try {
    // In production, this would make an API call to Google Gemini API
    
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    const { resumeText, jobDescription } = request;
    
    // More accurate analysis based on actual content comparison
    const matchPercentage = calculateMatchPercentage(resumeText, jobDescription);
    
    // Extract skills from job description
    const jobSkills = extractSkills(jobDescription);
    
    // Extract skills from resume
    const resumeSkills = extractSkills(resumeText);
    
    // Determine which skills match
    const keySkillsMatch = jobSkills.map(skill => ({
      skill,
      matched: isSkillInResume(skill, resumeText)
    }));
    
    // Find missing skills
    const missingSkills = jobSkills.filter(skill => !isSkillInResume(skill, resumeText));
    
    // Generate specific improvement suggestions based on actual content
    const improvementSuggestions = generateImprovementSuggestions(resumeText, jobDescription, missingSkills);
    
    // Generate strength points based on matched content
    const matchedSkills = keySkillsMatch
      .filter(item => item.matched)
      .map(item => item.skill);
      
    const strengthSuggestions = generateStrengthSuggestions(resumeText, jobDescription, matchedSkills);
    
    // Combine all suggestions
    const suggestions: SuggestionItem[] = [...improvementSuggestions, ...strengthSuggestions];
    
    // Generate personalized improvement plan
    const improvementPlan = generateImprovementPlan(resumeText, jobDescription, missingSkills);
    
    const result: AnalysisResultData = {
      matchPercentage,
      keySkillsMatch,
      suggestions,
      missingKeywords: missingSkills,
      improvementPlan
    };
    
    return result;
  } catch (error) {
    console.error("Error analyzing resume:", error);
    throw error;
  }
};

// Calculate match percentage based on keyword overlap and context relevance
function calculateMatchPercentage(resumeText: string, jobDescription: string): number {
  const resumeWords = resumeText.toLowerCase().split(/\W+/);
  const jobWords = jobDescription.toLowerCase().split(/\W+/);
  
  // Filter out common words
  const commonWords = ['and', 'the', 'to', 'of', 'a', 'in', 'for', 'is', 'on', 'that', 'with'];
  const filteredJobWords = jobWords.filter(word => 
    word.length > 2 && !commonWords.includes(word)
  );
  
  // Calculate unique job requirement words
  const uniqueJobWords = [...new Set(filteredJobWords)];
  
  // Count matches
  let matchCount = 0;
  for (const word of uniqueJobWords) {
    if (resumeWords.includes(word)) {
      matchCount++;
    }
  }
  
  // Calculate weighted score based on:
  // 1. Keywords match
  const keywordMatchScore = uniqueJobWords.length > 0 
    ? (matchCount / uniqueJobWords.length) * 60
    : 50;
  
  // 2. Skills match weight
  const jobSkills = extractSkills(jobDescription);
  const resumeSkills = extractSkills(resumeText);
  const skillsMatchCount = jobSkills.filter(skill => 
    resumeSkills.includes(skill)).length;
  const skillsMatchScore = jobSkills.length > 0 
    ? (skillsMatchCount / jobSkills.length) * 30
    : 25;
  
  // 3. Experience match heuristic
  const experienceScore = hasRelevantExperience(resumeText, jobDescription) ? 10 : 5;
  
  // Combine scores
  const totalScore = Math.round(keywordMatchScore + skillsMatchScore + experienceScore);
  
  // Ensure score is between 35-95
  return Math.min(Math.max(totalScore, 35), 95);
}

// Extract skills from text based on common technical and soft skills
function extractSkills(text: string): string[] {
  const commonTechSkills = [
    "React", "TypeScript", "JavaScript", "Node.js", "Python", "Java", "C++", "C#", "AWS", 
    "Azure", "GCP", "Docker", "Kubernetes", "CI/CD", "DevOps", "Jenkins", "GitLab", 
    "GraphQL", "REST API", "SQL", "NoSQL", "MongoDB", "PostgreSQL", "MySQL", "Redis", 
    "Elasticsearch", "RabbitMQ", "Kafka", "Spark", "Hadoop", "ETL", "Machine Learning",
    "AI", "Data Science", "Analytics", "Tableau", "Power BI", "Excel", "VBA", "Scala",
    "Ruby", "PHP", "Laravel", "Django", "Flask", "Spring Boot", "Angular", "Vue.js",
    "Svelte", "Webpack", "Babel", "ESLint", "Jest", "Mocha", "Chai", "Cypress", "Selenium",
    "TensorFlow", "PyTorch", "Figma", "Sketch", "Adobe XD", "UI/UX", "Responsive Design"
  ];

  const commonSoftSkills = [
    "Leadership", "Communication", "Teamwork", "Problem Solving", "Critical Thinking",
    "Time Management", "Creativity", "Adaptability", "Collaboration", "Presentation",
    "Project Management", "Agile", "Scrum", "Kanban", "Mentoring", "Decision Making",
    "Conflict Resolution", "Emotional Intelligence", "Customer Service", "Negotiation" 
  ];

  const allSkills = [...commonTechSkills, ...commonSoftSkills];
  
  // Find which skills appear in the text
  const normalizedText = text.toLowerCase();
  return allSkills.filter(skill => 
    normalizedText.includes(skill.toLowerCase()) ||
    normalizedText.includes(skill.toLowerCase().replace(".", "")) ||
    normalizedText.includes(skill.toLowerCase().replace(".js", ""))
  );
}

// Check if a specific skill is in the resume
function isSkillInResume(skill: string, resumeText: string): boolean {
  const normalizedText = resumeText.toLowerCase();
  const normalizedSkill = skill.toLowerCase();
  
  return normalizedText.includes(normalizedSkill) ||
         normalizedText.includes(normalizedSkill.replace(".", "")) ||
         normalizedText.includes(normalizedSkill.replace(".js", ""));
}

// Check for relevant experience markers in the resume
function hasRelevantExperience(resumeText: string, jobDescription: string): boolean {
  // Extract potential job titles/roles from job description
  const jobTitleMatches = jobDescription.match(/\b(developer|engineer|manager|designer|analyst|consultant|specialist|coordinator|director|lead|head|architect|administrator)\b/gi);
  const jobTitles = jobTitleMatches ? [...new Set(jobTitleMatches.map(t => t.toLowerCase()))] : [];
  
  // Check if any of these titles appear in the resume
  return jobTitles.some(title => resumeText.toLowerCase().includes(title));
}

// Generate targeted improvement suggestions
function generateImprovementSuggestions(resumeText: string, jobDescription: string, missingSkills: string[]): SuggestionItem[] {
  const suggestions: SuggestionItem[] = [];
  
  // Missing keywords suggestion
  if (missingSkills.length > 0) {
    suggestions.push({ 
      text: `Include keywords like '${missingSkills.join("', '")}' which are mentioned in the job description`,
      type: "improvement" as const
    });
  }
  
  // Check for metrics and quantifiable results
  if (!containsMetrics(resumeText)) {
    suggestions.push({
      text: `Add specific metrics and outcomes to demonstrate your accomplishments`,
      type: "improvement" as const
    });
  }
  
  // Check resume length and suggest optimization
  const wordCount = resumeText.split(/\s+/).length;
  if (wordCount > 700) {
    suggestions.push({
      text: `Your resume is quite detailed. Consider condensing it to highlight only the most relevant experience`,
      type: "improvement" as const
    });
  } else if (wordCount < 300) {
    suggestions.push({
      text: `Your resume could benefit from more detail about your relevant experiences and skills`,
      type: "improvement" as const
    });
  }
  
  // Check for action verbs
  if (!hasStrongActionVerbs(resumeText)) {
    suggestions.push({
      text: `Use strong action verbs to describe your experiences (e.g., 'implemented', 'developed', 'managed')`,
      type: "improvement" as const
    });
  }
  
  // Check for summary/objective statement
  if (!hasSummaryOrObjective(resumeText)) {
    suggestions.push({
      text: `Add a targeted professional summary that aligns with this specific role`,
      type: "improvement" as const
    });
  }
  
  // Always suggest tailoring
  suggestions.push({
    text: `Tailor your resume summary to specifically address this role's requirements`,
    type: "improvement" as const
  });
  
  return suggestions;
}

// Generate strength-focused suggestions
function generateStrengthSuggestions(resumeText: string, jobDescription: string, matchedSkills: string[]): SuggestionItem[] {
  const suggestions: SuggestionItem[] = [];
  
  if (matchedSkills.length > 0) {
    // Strong skill overlap
    if (matchedSkills.length >= 2) {
      suggestions.push({ 
        text: `Your strong background in ${matchedSkills.slice(0, 2).join(" and ")} aligns well with the job requirements`,
        type: "strength" as const
      });
    }
    
    // Specific skill highlight
    if (matchedSkills.length > 0) {
      const randomSkill = matchedSkills[Math.floor(Math.random() * matchedSkills.length)];
      suggestions.push({
        text: `Your experience with ${randomSkill} is valuable for this position`,
        type: "strength" as const
      });
    }
    
    // Diverse skillset
    if (matchedSkills.length >= 3) {
      suggestions.push({
        text: `Your diverse skill set including ${matchedSkills.slice(0, 3).join(", ")} makes you a well-rounded candidate`,
        type: "strength" as const
      });
    }
  }
  
  // Experience alignment
  if (hasRelevantExperience(resumeText, jobDescription)) {
    suggestions.push({
      text: `Your previous experience appears relevant to this role's requirements`,
      type: "strength" as const
    });
  }
  
  return suggestions;
}

// Generate a personalized improvement plan
function generateImprovementPlan(resumeText: string, jobDescription: string, missingSkills: string[]): string[] {
  const plan: string[] = [];
  
  // Always suggest resume summary update
  plan.push(`Update your resume summary to target this specific role`);
  
  // Missing keywords
  if (missingSkills.length > 0) {
    plan.push(`Add the missing keywords: ${missingSkills.join(", ")}`);
  }
  
  // Quantifiable achievements
  if (!containsMetrics(resumeText)) {
    plan.push(`Quantify your achievements with specific metrics`);
  }
  
  // Content organization
  plan.push(`Reorganize to prioritize your most relevant experience`);
  
  // Certifications if missing skills
  if (missingSkills.length > 0) {
    plan.push(`Consider getting certifications in ${missingSkills.slice(0, 2).join(" or ")} to strengthen your profile`);
  }
  
  // ATS optimization
  plan.push(`Format your resume for ATS compatibility, using standard headings and keywords`);
  
  return plan;
}

// Helper functions for text analysis

function containsMetrics(text: string): boolean {
  const metricPatterns = [
    /\d+\s*%/,            // Percentage
    /\$\s*\d+/,           // Dollar amount
    /increased|decreased|reduced|improved|saved|generated|delivered/i,  // Impact verbs
    /\d+\s*(users|customers|clients|employees|projects|products)/i      // Quantities
  ];
  
  return metricPatterns.some(pattern => pattern.test(text));
}

function hasStrongActionVerbs(text: string): boolean {
  const actionVerbs = [
    'achieved', 'built', 'created', 'designed', 'developed', 'implemented', 'increased',
    'launched', 'managed', 'reduced', 'resolved', 'supervised', 'transformed'
  ];
  
  return actionVerbs.some(verb => new RegExp(`\\b${verb}\\b`, 'i').test(text));
}

function hasSummaryOrObjective(text: string): boolean {
  // First 300 characters likely contain summary if it exists
  const beginning = text.substring(0, 300).toLowerCase();
  const summaryPatterns = [
    /summary/i,
    /objective/i,
    /professional profile/i,
    /career goal/i,
    /^[^.!?]{20,150}[.!?]/ // A sentence of reasonable length at the start
  ];
  
  return summaryPatterns.some(pattern => pattern.test(beginning));
}

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
