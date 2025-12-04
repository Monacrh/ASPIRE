// src/lib/careerDatabase.ts

export interface CareerKnowledge {
  id: string;
  title: string;
  description: string;
  requiredSubjects: string[];
  requiredSkills: string[];
  gradeThresholds: {
    subject: string;
    minimumGrade: string; // e.g., "B+", "A-"
    importance: 'critical' | 'important' | 'helpful';
  }[];
  academicProfile: string;
  salaryRange: string;
  growthRate: string;
  demandLevel: number; // 0-100
  trend: 'rising' | 'stable' | 'declining';
  industries: string[];
  tools: string[];
  tags: string[];
}

export const careerDatabase: CareerKnowledge[] = [
  {
    id: "data-scientist",
    title: "Data Scientist",
    description: "Analyzes complex data sets to extract insights and drive business decisions using statistical methods and machine learning.",
    requiredSubjects: ["Mathematics", "Statistics", "Computer Science", "Physics"],
    requiredSkills: ["Python", "Machine Learning", "Statistical Analysis", "Data Visualization"],
    gradeThresholds: [
      { subject: "Mathematics", minimumGrade: "B+", importance: "critical" },
      { subject: "Statistics", minimumGrade: "B", importance: "critical" },
      { subject: "Computer Science", minimumGrade: "B", importance: "important" },
    ],
    academicProfile: "Strong analytical and mathematical skills. Excellent at pattern recognition and problem-solving. Comfortable with programming and statistical concepts.",
    salaryRange: "$85,000 - $150,000",
    growthRate: "+35% yearly",
    demandLevel: 95,
    trend: "rising",
    industries: ["Technology", "Finance", "Healthcare", "E-commerce"],
    tools: ["Python", "R", "SQL", "Tableau", "TensorFlow", "Pandas"],
    tags: ["STEM", "High Demand", "Tech", "Analytical"]
  },
  {
    id: "software-engineer",
    title: "Software Engineer",
    description: "Designs, develops, and maintains software applications and systems using various programming languages and frameworks.",
    requiredSubjects: ["Computer Science", "Mathematics", "Logic", "Algorithms"],
    requiredSkills: ["Programming", "Algorithm Design", "System Architecture", "Problem Solving"],
    gradeThresholds: [
      { subject: "Computer Science", minimumGrade: "B", importance: "critical" },
      { subject: "Mathematics", minimumGrade: "B-", importance: "important" },
      { subject: "Logic", minimumGrade: "B", importance: "important" },
    ],
    academicProfile: "Logical thinker with strong problem-solving abilities. Comfortable with abstract concepts and systematic thinking.",
    salaryRange: "$75,000 - $140,000",
    growthRate: "+22% yearly",
    demandLevel: 92,
    trend: "rising",
    industries: ["Technology", "Finance", "Gaming", "Startups"],
    tools: ["JavaScript", "Python", "Java", "Git", "Docker", "React"],
    tags: ["STEM", "Tech", "Creative", "High Salary"]
  },
  {
    id: "ux-designer",
    title: "UX/UI Designer",
    description: "Creates user-centered digital experiences by combining visual design, user research, and interaction design principles.",
    requiredSubjects: ["Art", "Design", "Psychology", "Computer Science"],
    requiredSkills: ["User Research", "Prototyping", "Visual Design", "Empathy", "Figma"],
    gradeThresholds: [
      { subject: "Art", minimumGrade: "B", importance: "important" },
      { subject: "Design", minimumGrade: "B+", importance: "critical" },
      { subject: "Psychology", minimumGrade: "C+", importance: "helpful" },
    ],
    academicProfile: "Creative with strong visual sense. Empathetic and user-focused. Combines artistic talent with technical understanding.",
    salaryRange: "$65,000 - $120,000",
    growthRate: "+18% yearly",
    demandLevel: 85,
    trend: "rising",
    industries: ["Technology", "Design Agency", "E-commerce", "Startups"],
    tools: ["Figma", "Adobe XD", "Sketch", "InVision", "Photoshop"],
    tags: ["Creative", "Tech", "Design", "People-Oriented"]
  },
  {
    id: "product-manager",
    title: "Product Manager",
    description: "Bridges business, technology, and user experience to define and deliver successful digital products.",
    requiredSubjects: ["Business", "Computer Science", "Psychology", "Communication"],
    requiredSkills: ["Strategy", "Communication", "Data Analysis", "Stakeholder Management"],
    gradeThresholds: [
      { subject: "Business", minimumGrade: "B", importance: "important" },
      { subject: "Communication", minimumGrade: "B+", importance: "critical" },
      { subject: "Computer Science", minimumGrade: "C+", importance: "helpful" },
    ],
    academicProfile: "Strategic thinker with excellent communication skills. Comfortable with both technical and business concepts. Strong leadership potential.",
    salaryRange: "$90,000 - $160,000",
    growthRate: "+20% yearly",
    demandLevel: 88,
    trend: "stable",
    industries: ["Technology", "Finance", "E-commerce", "Consulting"],
    tools: ["Jira", "Figma", "Analytics Tools", "SQL", "Excel"],
    tags: ["Business", "Tech", "Leadership", "Strategic"]
  },
  {
    id: "digital-marketer",
    title: "Digital Marketing Specialist",
    description: "Creates and executes online marketing campaigns using data analytics, content strategy, and various digital channels.",
    requiredSubjects: ["Marketing", "Communication", "Statistics", "Psychology"],
    requiredSkills: ["SEO/SEM", "Content Marketing", "Analytics", "Social Media", "Copywriting"],
    gradeThresholds: [
      { subject: "Marketing", minimumGrade: "B", importance: "critical" },
      { subject: "Communication", minimumGrade: "B+", importance: "critical" },
      { subject: "Statistics", minimumGrade: "C+", importance: "helpful" },
    ],
    academicProfile: "Creative communicator with analytical mindset. Strong writing skills and understanding of consumer behavior.",
    salaryRange: "$55,000 - $95,000",
    growthRate: "+15% yearly",
    demandLevel: 82,
    trend: "stable",
    industries: ["Marketing Agency", "E-commerce", "Tech", "Media"],
    tools: ["Google Analytics", "SEMrush", "HubSpot", "Canva", "Facebook Ads"],
    tags: ["Creative", "Business", "Communication", "Analytical"]
  },
  {
    id: "business-analyst",
    title: "Business Analyst",
    description: "Analyzes business processes and data to identify improvements and drive strategic decisions.",
    requiredSubjects: ["Business", "Mathematics", "Economics", "Statistics"],
    requiredSkills: ["Data Analysis", "SQL", "Business Intelligence", "Process Mapping"],
    gradeThresholds: [
      { subject: "Business", minimumGrade: "B", importance: "critical" },
      { subject: "Mathematics", minimumGrade: "B-", importance: "important" },
      { subject: "Economics", minimumGrade: "B-", importance: "important" },
    ],
    academicProfile: "Analytical thinker with business acumen. Strong at identifying patterns and making data-driven recommendations.",
    salaryRange: "$70,000 - $110,000",
    growthRate: "+12% yearly",
    demandLevel: 78,
    trend: "stable",
    industries: ["Consulting", "Finance", "Technology", "Healthcare"],
    tools: ["Excel", "SQL", "Power BI", "Tableau", "Visio"],
    tags: ["Business", "Analytical", "Strategic", "Data-Driven"]
  },
  {
    id: "mechanical-engineer",
    title: "Mechanical Engineer",
    description: "Designs, develops, and tests mechanical devices and systems from concept to production.",
    requiredSubjects: ["Physics", "Mathematics", "Engineering", "Chemistry"],
    requiredSkills: ["CAD Design", "Thermodynamics", "Materials Science", "Problem Solving"],
    gradeThresholds: [
      { subject: "Physics", minimumGrade: "B", importance: "critical" },
      { subject: "Mathematics", minimumGrade: "B", importance: "critical" },
      { subject: "Engineering", minimumGrade: "B+", importance: "critical" },
    ],
    academicProfile: "Strong foundation in physics and mathematics. Spatial reasoning and practical problem-solving skills.",
    salaryRange: "$70,000 - $115,000",
    growthRate: "+8% yearly",
    demandLevel: 75,
    trend: "stable",
    industries: ["Manufacturing", "Automotive", "Aerospace", "Energy"],
    tools: ["AutoCAD", "SolidWorks", "MATLAB", "ANSYS"],
    tags: ["STEM", "Engineering", "Technical", "Hands-on"]
  },
  {
    id: "content-writer",
    title: "Content Writer/Copywriter",
    description: "Creates engaging written content for various media including websites, blogs, marketing materials, and social media.",
    requiredSubjects: ["English", "Literature", "Communication", "Marketing"],
    requiredSkills: ["Writing", "SEO", "Research", "Storytelling", "Editing"],
    gradeThresholds: [
      { subject: "English", minimumGrade: "B+", importance: "critical" },
      { subject: "Literature", minimumGrade: "B", importance: "important" },
      { subject: "Communication", minimumGrade: "B", importance: "important" },
    ],
    academicProfile: "Excellent command of language with creative flair. Strong research and storytelling abilities.",
    salaryRange: "$45,000 - $75,000",
    growthRate: "+10% yearly",
    demandLevel: 70,
    trend: "stable",
    industries: ["Marketing", "Media", "Publishing", "Tech"],
    tools: ["Google Docs", "WordPress", "Grammarly", "SEMrush"],
    tags: ["Creative", "Communication", "Flexible", "Remote-Friendly"]
  },
  {
    id: "cybersecurity-analyst",
    title: "Cybersecurity Analyst",
    description: "Protects computer systems and networks from cyber threats through monitoring, analysis, and implementation of security measures.",
    requiredSubjects: ["Computer Science", "Mathematics", "Information Systems", "Ethics"],
    requiredSkills: ["Network Security", "Threat Analysis", "Ethical Hacking", "Risk Assessment"],
    gradeThresholds: [
      { subject: "Computer Science", minimumGrade: "B", importance: "critical" },
      { subject: "Mathematics", minimumGrade: "B-", importance: "important" },
    ],
    academicProfile: "Detail-oriented with strong technical skills. Analytical mindset and ethical awareness.",
    salaryRange: "$80,000 - $130,000",
    growthRate: "+30% yearly",
    demandLevel: 93,
    trend: "rising",
    industries: ["Technology", "Finance", "Government", "Healthcare"],
    tools: ["Wireshark", "Metasploit", "Nmap", "Splunk", "Linux"],
    tags: ["STEM", "Security", "High Demand", "Technical"]
  },
  {
    id: "graphic-designer",
    title: "Graphic Designer",
    description: "Creates visual concepts and designs for print and digital media to communicate ideas and captivate audiences.",
    requiredSubjects: ["Art", "Design", "Visual Communication", "Computer Graphics"],
    requiredSkills: ["Adobe Creative Suite", "Typography", "Color Theory", "Layout Design"],
    gradeThresholds: [
      { subject: "Art", minimumGrade: "B+", importance: "critical" },
      { subject: "Design", minimumGrade: "B+", importance: "critical" },
    ],
    academicProfile: "Strong visual creativity and artistic talent. Technical proficiency with design software.",
    salaryRange: "$50,000 - $85,000",
    growthRate: "+8% yearly",
    demandLevel: 72,
    trend: "stable",
    industries: ["Design Agency", "Marketing", "Media", "Publishing"],
    tools: ["Photoshop", "Illustrator", "InDesign", "Figma"],
    tags: ["Creative", "Visual", "Artistic", "Freelance-Friendly"]
  },

  // Add 10 more diverse careers below to reach 20+ total...
  
  {
    id: "financial-analyst",
    title: "Financial Analyst",
    description: "Evaluates financial data and trends to guide investment decisions and business strategy.",
    requiredSubjects: ["Mathematics", "Economics", "Finance", "Statistics"],
    requiredSkills: ["Financial Modeling", "Excel", "Data Analysis", "Forecasting"],
    gradeThresholds: [
      { subject: "Mathematics", minimumGrade: "B", importance: "critical" },
      { subject: "Economics", minimumGrade: "B", importance: "critical" },
    ],
    academicProfile: "Strong quantitative skills with business acumen. Detail-oriented and analytical.",
    salaryRange: "$65,000 - $110,000",
    growthRate: "+10% yearly",
    demandLevel: 80,
    trend: "stable",
    industries: ["Finance", "Banking", "Consulting", "Investment"],
    tools: ["Excel", "Bloomberg", "SQL", "Python"],
    tags: ["Finance", "Analytical", "Business", "Quantitative"]
  },
];

// Helper function to create search text for embeddings
export function createCareerSearchText(career: CareerKnowledge): string {
  return `
    Career: ${career.title}
    Description: ${career.description}
    Required Subjects: ${career.requiredSubjects.join(', ')}
    Key Skills: ${career.requiredSkills.join(', ')}
    Academic Profile: ${career.academicProfile}
    Industries: ${career.industries.join(', ')}
    Tags: ${career.tags.join(', ')}
    Suitable for students with strong performance in ${career.requiredSubjects.slice(0, 3).join(', ')}
  `.trim();
}