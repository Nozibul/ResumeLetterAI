/**
 * @file constants.js
 * @description App-wide constants
 * @module shared/lib/constants
 */

// ==========================================
// EXISTING CONSTANTS
// ==========================================

// SVG path constant for quote marks
export const QUOTE_MARKS_PATH =
  'M0 16V6.4C0 2.88 2.88 0 6.4 0h1.6v3.2H6.4c-1.76 0-3.2 1.44-3.2 3.2V8h4.8v8H0zm12 0V6.4C12 2.88 14.88 0 18.4 0H20v3.2h-1.6c-1.76 0-3.2 1.44-3.2 3.2V8h4.8v8H12z';

export const INITIAL_ITEMS_ALL = 8;
export const INITIAL_ITEMS_FILTERED = 4;
export const ITEMS_PER_LOAD = 4;

// ==========================================
// RESUME SECTIONS
// ==========================================

export const RESUME_SECTIONS = [
  'personalInfo',
  'summary',
  'workExperience',
  'projects',
  'skills',
  'education',
  'competitiveProgramming',
  'certifications',
  'achievements',
  'languages',
];

// ==========================================
// FORM STEPS (Builder Navigation)
// ==========================================

export const FORM_STEPS = [
  { id: 1, key: 'personalInfo', label: 'Personal Info' },
  { id: 2, key: 'summary', label: 'Summary' },
  { id: 3, key: 'workExperience', label: 'Work Experience' },
  { id: 4, key: 'projects', label: 'Projects' },
  { id: 5, key: 'skills', label: 'Skills' },
  { id: 6, key: 'education', label: 'Education' },
  { id: 7, key: 'competitiveProgramming', label: 'Competitive Programming' },
  { id: 8, key: 'certifications', label: 'Certifications' },
  { id: 9, key: 'finalize', label: 'Finalize' },
];

// ==========================================
// SKILLS CATEGORIES (Backend schema match)
// ==========================================

export const SKILLS_CATEGORIES = [
  { key: 'programmingLanguages', label: 'Programming Languages' },
  { key: 'frontend', label: 'Frontend' },
  { key: 'backend', label: 'Backend' },
  { key: 'database', label: 'Database' },
  { key: 'devOps', label: 'DevOps' },
  { key: 'tools', label: 'Tools' },
  { key: 'other', label: 'Other' },
];

// ==========================================
// SKILLS SUGGESTIONS (IT-Focused)
// ==========================================

export const SKILLS_SUGGESTIONS = {
  programmingLanguages: [
    'JavaScript',
    'TypeScript',
    'Python',
    'Java',
    'C++',
    'C#',
    'Go',
    'Rust',
    'PHP',
    'Ruby',
    'Swift',
    'Kotlin',
  ],
  frontend: [
    'React.js',
    'Next.js',
    'Vue.js',
    'Angular',
    'Redux',
    'Tailwind CSS',
    'Bootstrap',
    'HTML5',
    'CSS3',
    'SASS',
    'React Native',
    'Flutter',
  ],
  backend: [
    'Node.js',
    'Express.js',
    'NestJS',
    'Django',
    'Flask',
    'Spring Boot',
    'Laravel',
    'FastAPI',
    'GraphQL',
    'REST API',
  ],
  database: [
    'MongoDB',
    'PostgreSQL',
    'MySQL',
    'Redis',
    'Firebase',
    'Cassandra',
    'Elasticsearch',
    'DynamoDB',
    'SQLite',
  ],
  devOps: [
    'Git',
    'GitHub',
    'Docker',
    'Kubernetes',
    'AWS',
    'Azure',
    'GCP',
    'CI/CD',
    'Jenkins',
    'Vercel',
    'Netlify',
    'Linux',
    'Terraform',
  ],
  tools: [
    'VS Code',
    'Postman',
    'Figma',
    'Jira',
    'Slack',
    'npm',
    'Yarn',
    'Webpack',
    'Vite',
    'ESLint',
  ],
  other: [
    'Agile',
    'Scrum',
    'OOP',
    'DSA',
    'SOLID Principles',
    'System Design',
    'Microservices',
    'Unit Testing',
  ],
};

// ==========================================
// LANGUAGE PROFICIENCY LEVELS
// ==========================================

export const PROFICIENCY_LEVELS = [
  'Native',
  'Fluent',
  'Professional',
  'Intermediate',
  'Basic',
];

// ==========================================
// COMPETITIVE PROGRAMMING PLATFORMS
// ==========================================

export const CP_PLATFORMS = [
  'LeetCode',
  'Codeforces',
  'HackerRank',
  'HackerEarth',
  'AtCoder',
  'CodeChef',
  'TopCoder',
];

// ==========================================
// CUSTOMIZATION OPTIONS
// ==========================================

export const NAME_POSITIONS = ['left', 'center', 'right'];
export const NAME_CASES = ['uppercase', 'capitalize', 'normal'];
export const ATS_SAFE_FONTS = [
  'Arial',
  'Calibri',
  'Times New Roman',
  'Helvetica',
];
export const ATS_SAFE_COLORS = [
  { name: 'Black', value: '#000000' },
  { name: 'Dark Navy', value: '#1a1a2e' },
  { name: 'Dark Blue', value: '#0d3b66' },
  { name: 'Dark Green', value: '#1b4332' },
  { name: 'Dark Gray', value: '#333333' },
];

// ==========================================
// LIMITS (Match backend LIMITS)
// ==========================================

export const LIMITS = {
  MAX_WORK_EXPERIENCES: 50,
  MAX_PROJECTS: 30,
  MAX_EDUCATIONS: 10,
  MAX_CERTIFICATIONS: 30,
  MAX_ACHIEVEMENTS: 30,
  MAX_LANGUAGES: 20,
  MAX_CP_PLATFORMS: 10,
  MAX_SKILLS_PER_CATEGORY: 20,
  MAX_RESPONSIBILITIES: 20,
  MAX_HIGHLIGHTS: 10,
  MAX_TECHNOLOGIES: 30,
  SUMMARY_MAX_LENGTH: 2000,
  TITLE_MAX_LENGTH: 100,
};

// ==========================================
// SECTION VISIBILITY DEFAULTS
// ==========================================

export const DEFAULT_SECTION_VISIBILITY = {
  personalInfo: true,
  summary: true,
  workExperience: true,
  projects: true,
  skills: true,
  education: true,
  competitiveProgramming: false,
  certifications: false,
  achievements: false,
  languages: false,
};

// ==========================================
// DEFAULT SECTION ORDER
// ==========================================

export const DEFAULT_SECTION_ORDER = [
  'personalInfo',
  'summary',
  'skills',
  'workExperience',
  'projects',
  'education',
  'certifications',
  'competitiveProgramming',
  'achievements',
  'languages',
];
