
import { AnalysisResultData, SuggestionItem } from '@/components/AnalysisResult';

export interface AnalysisRequest {
  resumeText: string;
  jobDescription: string;
}

export interface ProfileDetail {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
}

export const analyzeResume = async (
  request: AnalysisRequest
): Promise<AnalysisResultData> => {
  try {
    // In production, this would make an API call to Google Gemini API
    
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    const { resumeText, jobDescription } = request;
    
    // Get profile details from resume text
    const profileDetails = extractProfileDetails(resumeText);
    
    // Create the Gemini-like prompt (similar to the Python version)
    const prompt = `
      Act like a skilled or very experienced ATS (Application Tracking System)
      with a deep understanding of tech field, software engineering, data science, data analyst
      and big data engineering. Your task is to evaluate the resume based on the given job description.
      You must consider the job market is very competitive and you should provide
      best assistance for improving the resumes.
      
      Resume:
      ${resumeText}
      
      Job Description:
      ${jobDescription}
      
      Evaluate the match percentage between the resume and job description.
      Identify key skills from the job description and check if they are present in the resume.
      Identify missing keywords or skills that should be added to the resume.
      Provide specific suggestions to improve the resume.
      Highlight strengths in the resume that align with the job description.
    `;
    
    // In a real implementation, this would call the Gemini API with the prompt
    // For now, simulate the analysis with our existing functions, but with improved accuracy
    
    // Calculate match percentage with more accurate analysis
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
    
    // Generate comprehensive improvement suggestions based on the context
    const improvementSuggestions = generateImprovementSuggestions(resumeText, jobDescription, missingSkills);
    
    // Generate strength points based on matched content
    const matchedSkills = keySkillsMatch
      .filter(item => item.matched)
      .map(item => item.skill);
      
    const strengthSuggestions = generateStrengthSuggestions(resumeText, jobDescription, matchedSkills);
    
    // Combine all suggestions
    const suggestions: SuggestionItem[] = [...improvementSuggestions, ...strengthSuggestions];
    
    // Generate comprehensive improvement plan
    const improvementPlan = generateImprovementPlan(resumeText, jobDescription, missingSkills, profileDetails);
    
    const result: AnalysisResultData = {
      matchPercentage,
      keySkillsMatch,
      suggestions,
      missingKeywords: missingSkills,
      improvementPlan,
      profileDetails
    };
    
    return result;
  } catch (error) {
    console.error("Error analyzing resume:", error);
    throw error;
  }
};

// Extract contact details from resume text
function extractProfileDetails(resumeText: string): ProfileDetail {
  // Default values
  const profile = {
    name: "Not found",
    email: "Not found",
    phone: "Not found",
    linkedin: "Not found"
  };
  
  // Extract email using regex
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  const emailMatch = resumeText.match(emailRegex);
  if (emailMatch) {
    profile.email = emailMatch[0];
  }
  
  // Extract phone using regex (handles various formats)
  const phoneRegex = /(\+\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/;
  const phoneMatch = resumeText.match(phoneRegex);
  if (phoneMatch) {
    profile.phone = phoneMatch[0];
  }
  
  // Extract LinkedIn URL
  const linkedinRegex = /linkedin\.com\/in\/[a-zA-Z0-9_-]+/;
  const linkedinMatch = resumeText.match(linkedinRegex);
  if (linkedinMatch) {
    profile.linkedin = linkedinMatch[0];
  }
  
  // Try to extract name (more challenging)
  // Look for patterns that might indicate a name at the beginning of the resume
  const lines = resumeText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  if (lines.length > 0) {
    // The first non-empty line might be the name
    const firstLine = lines[0];
    // Check if it's reasonably short and doesn't look like a title/heading
    if (firstLine.length < 50 && !firstLine.includes(':') && !firstLine.match(/resume|cv|curriculum/i)) {
      profile.name = firstLine;
    }
  }
  
  return profile;
}

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
  
  // ATS optimization suggestion
  suggestions.push({
    text: `Ensure your resume is ATS-friendly by using standard section headings and avoiding complex formatting`,
    type: "improvement" as const
  });
  
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
function generateImprovementPlan(
  resumeText: string, 
  jobDescription: string, 
  missingSkills: string[],
  profileDetails: ProfileDetail
): string[] {
  const plan: string[] = [];
  
  // Professional profile summary suggestion
  plan.push(`Create a professional profile summary highlighting your key skills and experience`);
  
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
  
  // Contact info suggestion if missing
  if (profileDetails.email === "Not found" || profileDetails.phone === "Not found") {
    plan.push(`Ensure your contact information is clearly visible at the top of your resume`);
  }
  
  // LinkedIn suggestion if missing
  if (profileDetails.linkedin === "Not found") {
    plan.push(`Add your LinkedIn profile URL to your contact information`);
  }
  
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
  // Similar to the Python implementation:
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
              text: `
                Act like a skilled or very experienced ATS (Application Tracking System)
                with a deep understanding of tech field, software engineering, data science, data analyst
                and big data engineering. Your task is to evaluate the resume based on the given job description.
                You must consider the job market is very competitive and you should provide
                best assistance for improving the resumes.
                
                Resume:
                ${resumeText}
                
                Job Description:
                ${jobDescription}
                
                I want the response in below format:
                
                JD percentage: "%",
                Profile Summary:" ",
                Contact Details:  
                Name: " ",
                Email: " ",
                Phone No: " ",
                LinkedIn: " "
                Suggestions: " "
              `
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
