export interface CareerKnowledge {
  id: string;
  title: string;
  description: string;
  requiredSubjects: string[]; // ["Mathematics", "Physics", "Chemistry"]
  requiredSkills: string[];
  gradeRequirements: {
    subject: string;
    minimumGrade: number; // 0-100
    weight: number; // importance weight
  }[];
  academicProfile: string; // "Strong in STEM", "Analytical thinker"
  industryTrends: string;
  salaryRange: string;
  growthRate: string;
  difficulty: "entry" | "intermediate" | "advanced";
  tags: string[];
}

export const careerDatabase: CareerKnowledge[] = [
  {
    id: "data-scientist",
    title: "Data Scientist",
    description: "Analyzes complex data to help companies make decisions",
    requiredSubjects: ["Mathematics", "Statistics", "Computer Science", "Physics"],
    requiredSkills: ["Statistical Analysis", "Python", "Machine Learning", "Data Visualization"],
    gradeRequirements: [
      { subject: "Mathematics", minimumGrade: 75, weight: 0.3 },
      { subject: "Statistics", minimumGrade: 70, weight: 0.25 },
      { subject: "Computer Science", minimumGrade: 70, weight: 0.25 },
      { subject: "Physics", minimumGrade: 65, weight: 0.2 }
    ],
    academicProfile: "Strong analytical skills, excellent in mathematics and statistics, logical problem solver",
    industryTrends: "High demand, AI revolution, growing 35% yearly",
    salaryRange: "$80,000 - $150,000",
    growthRate: "+35% yearly",
    difficulty: "intermediate",
    tags: ["STEM", "High Demand", "Tech", "Analytical"]
  },
  {
    id: "software-engineer",
    title: "Software Engineer",
    description: "Designs and builds software applications",
    requiredSubjects: ["Computer Science", "Mathematics", "Logic"],
    requiredSkills: ["Programming", "Algorithms", "Problem Solving", "System Design"],
    gradeRequirements: [
      { subject: "Computer Science", minimumGrade: 70, weight: 0.4 },
      { subject: "Mathematics", minimumGrade: 70, weight: 0.3 },
      { subject: "Logic", minimumGrade: 65, weight: 0.3 }
    ],
    academicProfile: "Logical thinker, problem solver, strong in algorithms and coding",
    industryTrends: "Always in demand, evolving tech stack, stable growth",
    salaryRange: "$75,000 - $140,000",
    growthRate: "+22% yearly",
    difficulty: "intermediate",
    tags: ["STEM", "Tech", "Creative", "High Salary"]
  },
  {
    id: "ux-designer",
    title: "UX/UI Designer",
    description: "Creates user-friendly interfaces and experiences",
    requiredSubjects: ["Art", "Design", "Psychology", "Computer Science"],
    requiredSkills: ["User Research", "Prototyping", "Visual Design", "Empathy"],
    gradeRequirements: [
      { subject: "Art", minimumGrade: 70, weight: 0.3 },
      { subject: "Design", minimumGrade: 70, weight: 0.3 },
      { subject: "Psychology", minimumGrade: 65, weight: 0.2 },
      { subject: "Computer Science", minimumGrade: 60, weight: 0.2 }
    ],
    academicProfile: "Creative, empathetic, understands human behavior, visual thinker",
    industryTrends: "Growing demand, every company needs UX, remote-friendly",
    salaryRange: "$65,000 - $120,000",
    growthRate: "+18% yearly",
    difficulty: "entry",
    tags: ["Creative", "Tech", "People-Oriented", "Design"]
  },
  // ... Add 20-50 more careers here for comprehensive coverage
];