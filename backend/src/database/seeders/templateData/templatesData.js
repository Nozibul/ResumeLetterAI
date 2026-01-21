// /**
//  * @file seeders/templateData/templateData.js
//  * @description Template seed data for ResumeLetterAI
//  * @author Nozibul Islam
//  */

// const templateData = [
//   /**
//    * @file seeders/templateData/templatesData.js
//    * @description Template seed data for ResumeLetterAI (Enhanced v2.0)
//    * @author Nozibul Islam
//    * @version 2.0.0
//    */
//   // ==========================================
//   // TEMPLATE 1: ATS-Friendly Universal
//   // ==========================================
//   {
//     category: 'ats-friendly',
//     description: 'Universal ATS-optimized resume template. Clean, simple, and compatible with all applicant tracking systems.',
//     previewUrl: 'https://yourdomain.com/templates/ats-universal-preview.png',
//     thumbnailUrl: 'https://yourdomain.com/templates/ats-universal-thumb.png',
//     tags: ['ats', 'professional', 'universal', 'simple', 'clean'],
//     rating: 4.7,
//     usageCount: 428,
//     isPremium: false,
//     isActive: true,
//     structure: {
//       sections: [
//         {
//           sectionId: 'header',
//           sectionName: 'Contact Information',
//           isRequired: true,
//           order: 1,
//           fields: [
//             { fieldName: 'fullName', fieldType: 'text', isRequired: true, placeholder: 'Your Full Name' },
//             { fieldName: 'jobTitle', fieldType: 'text', isRequired: true, placeholder: 'Professional Title' },
//             { fieldName: 'email', fieldType: 'email', isRequired: true, placeholder: 'your.email@example.com' },
//             { fieldName: 'phone', fieldType: 'phone', isRequired: true, placeholder: '+1 234 567 8900' },
//             { fieldName: 'location', fieldType: 'text', isRequired: true, placeholder: 'City, State' },
//             { fieldName: 'linkedin', fieldType: 'url', isRequired: false, placeholder: 'linkedin.com/in/yourprofile' },
//           ],
//         },
//         {
//           sectionId: 'summary',
//           sectionName: 'Professional Summary',
//           isRequired: false,
//           order: 2,
//           fields: [
//             { fieldName: 'summaryText', fieldType: 'textarea', isRequired: false, placeholder: 'Brief overview of your professional background and key qualifications' },
//           ],
//         },
//         {
//           sectionId: 'experience',
//           sectionName: 'Professional Experience',
//           isRequired: true,
//           order: 3,
//           fields: [
//             { fieldName: 'jobTitle', fieldType: 'text', isRequired: true, placeholder: 'Job Title' },
//             { fieldName: 'company', fieldType: 'text', isRequired: true, placeholder: 'Company Name' },
//             { fieldName: 'location', fieldType: 'text', isRequired: false, placeholder: 'City, State' },
//             { fieldName: 'startDate', fieldType: 'date', isRequired: true, placeholder: 'Jan 2020' },
//             { fieldName: 'endDate', fieldType: 'date', isRequired: false, placeholder: 'Present' },
//             { fieldName: 'responsibilities', fieldType: 'array', isRequired: false, placeholder: 'Key responsibilities and achievements' },
//           ],
//         },
//         {
//           sectionId: 'education',
//           sectionName: 'Education',
//           isRequired: true,
//           order: 4,
//           fields: [
//             { fieldName: 'degree', fieldType: 'text', isRequired: true, placeholder: 'Degree Name' },
//             { fieldName: 'institution', fieldType: 'text', isRequired: true, placeholder: 'University Name' },
//             { fieldName: 'location', fieldType: 'text', isRequired: false, placeholder: 'City, State' },
//             { fieldName: 'graduationDate', fieldType: 'date', isRequired: false, placeholder: 'May 2020' },
//           ],
//         },
//         {
//           sectionId: 'skills',
//           sectionName: 'Skills',
//           isRequired: true,
//           order: 5,
//           fields: [
//             { fieldName: 'skills', fieldType: 'tags', isRequired: false, placeholder: 'Relevant professional skills' },
//           ],
//         },
//         {
//           sectionId: 'certifications',
//           sectionName: 'Certifications',
//           isRequired: false,
//           order: 6,
//           fields: [
//             { fieldName: 'certificationName', fieldType: 'text', isRequired: true, placeholder: 'Certification Name' },
//             { fieldName: 'issuer', fieldType: 'text', isRequired: false, placeholder: 'Issuing Organization' },
//             { fieldName: 'issueDate', fieldType: 'date', isRequired: false, placeholder: 'Month Year' },
//           ],
//         },
//       ],
//     },
//     settings: {
//       locked: {
//         colorScheme: true,
//         layoutColumns: true,
//         fontFamily: true,
//         graphics: true,
//       },
//       defaults: {
//         colorScheme: '#000000',
//         layoutColumns: 1,
//         fontFamily: 'Arial',
//         namePosition: 'center',
//         nameCase: 'uppercase',
//         photoEnabled: false,
//         linkedinEnabled: true,
//         githubEnabled: false,
//         portfolioEnabled: false,
//         leetcodeEnabled: false,
//       },
//       customizable: {
//         namePosition: true,
//         nameCase: true,
//         sectionOrder: true,
//         sectionVisibility: true,
//         sectionTitles: true,
//         photoEnabled: true,
//       },
//     },
//   },

//   // ==========================================
//   // TEMPLATE 2: Corporate Professional
//   // ==========================================
//   {
//     category: 'corporate',
//     description: 'Professional corporate resume template with clean layout. Perfect for business professionals, managers, and consultants.',
//     previewUrl: 'https://yourdomain.com/templates/corporate-professional-preview.png',
//     thumbnailUrl: 'https://yourdomain.com/templates/corporate-professional-thumb.png',
//     tags: ['corporate', 'business', 'professional', 'manager', 'consultant'],
//     rating: 4.5,
//     usageCount: 234,
//     isPremium: false,
//     isActive: true,
//     structure: {
//       sections: [
//         {
//           sectionId: 'header',
//           sectionName: 'Header',
//           isRequired: true,
//           order: 1,
//           fields: [
//             { fieldName: 'fullName', fieldType: 'text', isRequired: true, placeholder: 'Your Full Name' },
//             { fieldName: 'jobTitle', fieldType: 'text', isRequired: true, placeholder: 'Business Manager' },
//             { fieldName: 'email', fieldType: 'email', isRequired: true, placeholder: 'your.email@example.com' },
//             { fieldName: 'phone', fieldType: 'phone', isRequired: true, placeholder: '+1 234 567 8900' },
//             { fieldName: 'location', fieldType: 'text', isRequired: false, placeholder: 'New York, USA' },
//             { fieldName: 'linkedin', fieldType: 'url', isRequired: false, placeholder: 'linkedin.com/in/yourprofile' },
//           ],
//         },
//         {
//           sectionId: 'summary',
//           sectionName: 'Professional Summary',
//           isRequired: false,
//           order: 2,
//           fields: [
//             { fieldName: 'summaryText', fieldType: 'textarea', isRequired: false, placeholder: 'Write a brief professional summary highlighting your expertise and career goals' },
//           ],
//         },
//         {
//           sectionId: 'experience',
//           sectionName: 'Work Experience',
//           isRequired: true,
//           order: 3,
//           fields: [
//             { fieldName: 'jobTitle', fieldType: 'text', isRequired: true, placeholder: 'Business Manager' },
//             { fieldName: 'company', fieldType: 'text', isRequired: true, placeholder: 'Company Name' },
//             { fieldName: 'location', fieldType: 'text', isRequired: false, placeholder: 'New York, USA' },
//             { fieldName: 'startDate', fieldType: 'date', isRequired: true, placeholder: 'Jan 2020' },
//             { fieldName: 'endDate', fieldType: 'date', isRequired: false, placeholder: 'Present' },
//             { fieldName: 'responsibilities', fieldType: 'array', isRequired: false, placeholder: 'Led team of 15+ professionals and managed annual budget of $2M' },
//           ],
//         },
//         {
//           sectionId: 'education',
//           sectionName: 'Education',
//           isRequired: true,
//           order: 4,
//           fields: [
//             { fieldName: 'degree', fieldType: 'text', isRequired: true, placeholder: 'MBA in Business Administration' },
//             { fieldName: 'institution', fieldType: 'text', isRequired: true, placeholder: 'University Name' },
//             { fieldName: 'location', fieldType: 'text', isRequired: false, placeholder: 'New York, USA' },
//             { fieldName: 'graduationDate', fieldType: 'date', isRequired: false, placeholder: 'May 2018' },
//           ],
//         },
//         {
//           sectionId: 'skills',
//           sectionName: 'Core Competencies',
//           isRequired: false,
//           order: 5,
//           fields: [
//             { fieldName: 'skills', fieldType: 'tags', isRequired: false, placeholder: 'Leadership, Strategic Planning, Financial Analysis' },
//           ],
//         },
//         {
//           sectionId: 'certifications',
//           sectionName: 'Certifications',
//           isRequired: false,
//           order: 6,
//           fields: [
//             { fieldName: 'certificationName', fieldType: 'text', isRequired: true, placeholder: 'Project Management Professional (PMP)' },
//             { fieldName: 'issuer', fieldType: 'text', isRequired: false, placeholder: 'PMI' },
//             { fieldName: 'issueDate', fieldType: 'date', isRequired: false, placeholder: 'Jun 2019' },
//           ],
//         },
//       ],
//     },
//   },

//   // ==========================================
//   // TEMPLATE 3: Executive Leader
//   // ==========================================
//   {
//     category: 'executive',
//     description: 'Executive resume template for C-level professionals and senior leaders. Emphasizes leadership achievements and strategic impact.',
//     previewUrl: 'https://yourdomain.com/templates/executive-leader-preview.png',
//     thumbnailUrl: 'https://yourdomain.com/templates/executive-leader-thumb.png',
//     tags: ['executive', 'ceo', 'director', 'leadership', 'senior'],
//     rating: 4.8,
//     usageCount: 189,
//     isPremium: true,
//     isActive: true,
//     structure: {
//       sections: [
//         {
//           sectionId: 'header',
//           sectionName: 'Header',
//           isRequired: true,
//           order: 1,
//           fields: [
//             { fieldName: 'fullName', fieldType: 'text', isRequired: true, placeholder: 'Your Full Name' },
//             { fieldName: 'jobTitle', fieldType: 'text', isRequired: true, placeholder: 'Chief Executive Officer' },
//             { fieldName: 'email', fieldType: 'email', isRequired: true, placeholder: 'ceo@company.com' },
//             { fieldName: 'phone', fieldType: 'phone', isRequired: true, placeholder: '+1 234 567 8900' },
//             { fieldName: 'location', fieldType: 'text', isRequired: false, placeholder: 'San Francisco, CA' },
//             { fieldName: 'linkedin', fieldType: 'url', isRequired: false, placeholder: 'linkedin.com/in/yourprofile' },
//           ],
//         },
//         {
//           sectionId: 'summary',
//           sectionName: 'Executive Summary',
//           isRequired: true,
//           order: 2,
//           fields: [
//             { fieldName: 'summaryText', fieldType: 'textarea', isRequired: true, placeholder: 'Strategic executive leader with 15+ years driving organizational growth and transformation' },
//           ],
//         },
//         {
//           sectionId: 'experience',
//           sectionName: 'Leadership Experience',
//           isRequired: true,
//           order: 3,
//           fields: [
//             { fieldName: 'jobTitle', fieldType: 'text', isRequired: true, placeholder: 'Chief Operating Officer' },
//             { fieldName: 'company', fieldType: 'text', isRequired: true, placeholder: 'Company Name' },
//             { fieldName: 'location', fieldType: 'text', isRequired: false, placeholder: 'San Francisco, CA' },
//             { fieldName: 'startDate', fieldType: 'date', isRequired: true, placeholder: 'Jan 2018' },
//             { fieldName: 'endDate', fieldType: 'date', isRequired: false, placeholder: 'Present' },
//             { fieldName: 'responsibilities', fieldType: 'array', isRequired: false, placeholder: 'Spearheaded company-wide digital transformation resulting in 40% operational efficiency gains' },
//           ],
//         },
//         {
//           sectionId: 'achievements',
//           sectionName: 'Key Achievements',
//           isRequired: false,
//           order: 4,
//           fields: [
//             { fieldName: 'achievement', fieldType: 'textarea', isRequired: false, placeholder: 'Led successful IPO raising $500M in capital markets' },
//           ],
//         },
//         {
//           sectionId: 'education',
//           sectionName: 'Education',
//           isRequired: true,
//           order: 5,
//           fields: [
//             { fieldName: 'degree', fieldType: 'text', isRequired: true, placeholder: 'Master of Business Administration (MBA)' },
//             { fieldName: 'institution', fieldType: 'text', isRequired: true, placeholder: 'Harvard Business School' },
//             { fieldName: 'location', fieldType: 'text', isRequired: false, placeholder: 'Boston, MA' },
//             { fieldName: 'graduationDate', fieldType: 'date', isRequired: false, placeholder: 'May 2005' },
//           ],
//         },
//         {
//           sectionId: 'skills',
//           sectionName: 'Executive Competencies',
//           isRequired: false,
//           order: 6,
//           fields: [
//             { fieldName: 'skills', fieldType: 'tags', isRequired: false, placeholder: 'Strategic Planning, M&A, Change Management, P&L Management' },
//           ],
//         },
//       ],
//     },
//   },

//   // ==========================================
//   // TEMPLATE 4: Creative Modern
//   // ==========================================
//   {
//     category: 'creative',
//     description: 'Modern creative resume template with vibrant design. Perfect for designers, artists, and creative professionals.',
//     previewUrl: 'https://yourdomain.com/templates/creative-modern-preview.png',
//     thumbnailUrl: 'https://yourdomain.com/templates/creative-modern-thumb.png',
//     tags: ['creative', 'designer', 'artist', 'modern', 'colorful'],
//     rating: 4.6,
//     usageCount: 312,
//     isPremium: false,
//     isActive: true,
//     structure: {
//       sections: [
//         {
//           sectionId: 'header',
//           sectionName: 'Header',
//           isRequired: true,
//           order: 1,
//           fields: [
//             { fieldName: 'fullName', fieldType: 'text', isRequired: true, placeholder: 'Your Full Name' },
//             { fieldName: 'jobTitle', fieldType: 'text', isRequired: true, placeholder: 'UI/UX Designer' },
//             { fieldName: 'email', fieldType: 'email', isRequired: true, placeholder: 'designer@portfolio.com' },
//             { fieldName: 'phone', fieldType: 'phone', isRequired: false, placeholder: '+1 234 567 8900' },
//             { fieldName: 'location', fieldType: 'text', isRequired: false, placeholder: 'Los Angeles, CA' },
//             { fieldName: 'portfolio', fieldType: 'url', isRequired: true, placeholder: 'yourportfolio.com' },
//             { fieldName: 'linkedin', fieldType: 'url', isRequired: false, placeholder: 'linkedin.com/in/yourprofile' },
//           ],
//         },
//         {
//           sectionId: 'summary',
//           sectionName: 'About Me',
//           isRequired: false,
//           order: 2,
//           fields: [
//             { fieldName: 'summaryText', fieldType: 'textarea', isRequired: false, placeholder: 'Creative designer passionate about crafting beautiful and functional user experiences' },
//           ],
//         },
//         {
//           sectionId: 'projects',
//           sectionName: 'Featured Projects',
//           isRequired: true,
//           order: 3,
//           fields: [
//             { fieldName: 'projectName', fieldType: 'text', isRequired: true, placeholder: 'E-commerce Redesign' },
//             { fieldName: 'description', fieldType: 'textarea', isRequired: false, placeholder: 'Complete UI/UX redesign resulting in 35% increase in conversions' },
//             { fieldName: 'technologies', fieldType: 'tags', isRequired: false, placeholder: 'Figma, Adobe XD, Sketch' },
//             { fieldName: 'liveUrl', fieldType: 'url', isRequired: false, placeholder: 'https://behance.net/project' },
//           ],
//         },
//         {
//           sectionId: 'experience',
//           sectionName: 'Work Experience',
//           isRequired: false,
//           order: 4,
//           fields: [
//             { fieldName: 'jobTitle', fieldType: 'text', isRequired: true, placeholder: 'Senior UI Designer' },
//             { fieldName: 'company', fieldType: 'text', isRequired: true, placeholder: 'Design Studio' },
//             { fieldName: 'location', fieldType: 'text', isRequired: false, placeholder: 'Los Angeles, CA' },
//             { fieldName: 'startDate', fieldType: 'date', isRequired: true, placeholder: 'Mar 2021' },
//             { fieldName: 'endDate', fieldType: 'date', isRequired: false, placeholder: 'Present' },
//             { fieldName: 'responsibilities', fieldType: 'array', isRequired: false, placeholder: 'Led design for 20+ client projects across web and mobile platforms' },
//           ],
//         },
//         {
//           sectionId: 'skills',
//           sectionName: 'Design Skills',
//           isRequired: true,
//           order: 5,
//           fields: [
//             { fieldName: 'designTools', fieldType: 'tags', isRequired: false, placeholder: 'Figma, Adobe XD, Photoshop, Illustrator' },
//             { fieldName: 'skills', fieldType: 'tags', isRequired: false, placeholder: 'UI Design, UX Research, Prototyping, Branding' },
//           ],
//         },
//         {
//           sectionId: 'education',
//           sectionName: 'Education',
//           isRequired: false,
//           order: 6,
//           fields: [
//             { fieldName: 'degree', fieldType: 'text', isRequired: true, placeholder: 'Bachelor of Fine Arts in Design' },
//             { fieldName: 'institution', fieldType: 'text', isRequired: true, placeholder: 'Design University' },
//             { fieldName: 'graduationDate', fieldType: 'date', isRequired: false, placeholder: 'May 2020' },
//           ],
//         },
//       ],
//     },
//   },

//   // ==========================================
//   // TEMPLATE 5: IT Classic ATS
//   // ==========================================
//   {
//     category: 'it',
//     description: 'Clean ATS-friendly resume template perfect for software engineers and developers. Single column layout with clear sections.',
//     previewUrl: 'https://yourdomain.com/templates/it-classic-preview.png',
//     thumbnailUrl: 'https://yourdomain.com/templates/it-classic-thumb.png',
//     tags: ['ats', 'software engineer', 'developer', 'clean', 'professional'],
//     rating: 4.9,
//     usageCount: 567,
//     isPremium: false,
//     isActive: true,
//     structure: {
//       sections: [
//         {
//           sectionId: 'header',
//           sectionName: 'Header',
//           isRequired: true,
//           order: 1,
//           fields: [
//             { fieldName: 'fullName', fieldType: 'text', isRequired: true, placeholder: 'Your Full Name' },
//             { fieldName: 'jobTitle', fieldType: 'text', isRequired: true, placeholder: 'Full-Stack Developer' },
//             { fieldName: 'email', fieldType: 'email', isRequired: true, placeholder: 'your.email@example.com' },
//             { fieldName: 'phone', fieldType: 'phone', isRequired: true, placeholder: '+8801234567890' },
//             { fieldName: 'location', fieldType: 'text', isRequired: false, placeholder: 'Dhaka, Bangladesh' },
//             { fieldName: 'linkedin', fieldType: 'url', isRequired: false, placeholder: 'linkedin.com/in/yourprofile' },
//             { fieldName: 'github', fieldType: 'url', isRequired: false, placeholder: 'github.com/yourusername' },
//             { fieldName: 'portfolio', fieldType: 'url', isRequired: false, placeholder: 'yourportfolio.com' },
//           ],
//         },
//         {
//           sectionId: 'summary',
//           sectionName: 'Professional Summary',
//           isRequired: false,
//           order: 2,
//           fields: [
//             { fieldName: 'summaryText', fieldType: 'textarea', isRequired: false, placeholder: 'Write a brief professional summary (2-3 sentences)' },
//           ],
//         },
//         {
//           sectionId: 'skills',
//           sectionName: 'Technical Skills',
//           isRequired: true,
//           order: 3,
//           fields: [
//             { fieldName: 'programmingLanguages', fieldType: 'tags', isRequired: false, placeholder: 'JavaScript, TypeScript, Python' },
//             { fieldName: 'frontend', fieldType: 'tags', isRequired: false, placeholder: 'React, Next.js, Tailwind CSS' },
//             { fieldName: 'backend', fieldType: 'tags', isRequired: false, placeholder: 'Node.js, Express, MongoDB' },
//             { fieldName: 'devOps', fieldType: 'tags', isRequired: false, placeholder: 'Docker, Git, CI/CD' },
//             { fieldName: 'tools', fieldType: 'tags', isRequired: false, placeholder: 'VS Code, Postman, Figma' },
//           ],
//         },
//         {
//           sectionId: 'experience',
//           sectionName: 'Work Experience',
//           isRequired: true,
//           order: 4,
//           fields: [
//             { fieldName: 'jobTitle', fieldType: 'text', isRequired: true, placeholder: 'Frontend Developer' },
//             { fieldName: 'company', fieldType: 'text', isRequired: true, placeholder: 'Company Name' },
//             { fieldName: 'location', fieldType: 'text', isRequired: false, placeholder: 'Dhaka, Bangladesh' },
//             { fieldName: 'startDate', fieldType: 'date', isRequired: true, placeholder: 'Mar 2022' },
//             { fieldName: 'endDate', fieldType: 'date', isRequired: false, placeholder: 'Present' },
//             { fieldName: 'responsibilities', fieldType: 'array', isRequired: false, placeholder: 'Developed and maintained web applications...' },
//           ],
//         },
//         {
//           sectionId: 'projects',
//           sectionName: 'Projects',
//           isRequired: false,
//           order: 5,
//           fields: [
//             { fieldName: 'projectName', fieldType: 'text', isRequired: true, placeholder: 'E-commerce Platform' },
//             { fieldName: 'technologies', fieldType: 'tags', isRequired: false, placeholder: 'React, Node.js, MongoDB' },
//             { fieldName: 'description', fieldType: 'textarea', isRequired: false, placeholder: 'Brief project description' },
//             { fieldName: 'liveUrl', fieldType: 'url', isRequired: false, placeholder: 'https://project-demo.com' },
//             { fieldName: 'sourceCode', fieldType: 'url', isRequired: false, placeholder: 'https://github.com/user/project' },
//           ],
//         },
//         {
//           sectionId: 'education',
//           sectionName: 'Education',
//           isRequired: true,
//           order: 6,
//           fields: [
//             { fieldName: 'degree', fieldType: 'text', isRequired: true, placeholder: 'B.Sc. in Computer Science' },
//             { fieldName: 'institution', fieldType: 'text', isRequired: true, placeholder: 'University Name' },
//             { fieldName: 'location', fieldType: 'text', isRequired: false, placeholder: 'Dhaka, Bangladesh' },
//             { fieldName: 'graduationDate', fieldType: 'date', isRequired: false, placeholder: 'Nov 2022' },
//             { fieldName: 'gpa', fieldType: 'text', isRequired: false, placeholder: '3.75/4.00' },
//           ],
//         },
//         {
//           sectionId: 'certifications',
//           sectionName: 'Certifications',
//           isRequired: false,
//           order: 7,
//           fields: [
//             { fieldName: 'certificationName', fieldType: 'text', isRequired: true, placeholder: 'AWS Certified Developer' },
//             { fieldName: 'issuer', fieldType: 'text', isRequired: false, placeholder: 'Amazon Web Services' },
//             { fieldName: 'issueDate', fieldType: 'date', isRequired: false, placeholder: 'Jun 2023' },
//             { fieldName: 'credentialUrl', fieldType: 'url', isRequired: false, placeholder: 'https://verify.certificate.com' },
//           ],
//         },
//         {
//           sectionId: 'competitiveProgramming',
//           sectionName: 'Competitive Programming',
//           isRequired: false,
//           order: 8,
//           fields: [
//             { fieldName: 'platform', fieldType: 'text', isRequired: true, placeholder: 'LeetCode' },
//             { fieldName: 'problemsSolved', fieldType: 'text', isRequired: false, placeholder: '500+' },
//             { fieldName: 'profileUrl', fieldType: 'url', isRequired: false, placeholder: 'https://leetcode.com/username' },
//           ],
//         },
//       ],
//     },
//     settings: {
//       locked: {
//         colorScheme: true,
//         layoutColumns: true,
//         fontFamily: true,
//         graphics: true,
//       },
//       defaults: {
//         colorScheme: '#000000',
//         layoutColumns: 1,
//         fontFamily: 'Arial',
//         namePosition: 'center',
//         nameCase: 'uppercase',
//         photoEnabled: false,
//         linkedinEnabled: true,
//         githubEnabled: true,
//         portfolioEnabled: true,
//         leetcodeEnabled: true,
//       },
//       customizable: {
//         namePosition: true,
//         nameCase: true,
//         sectionOrder: true,
//         sectionVisibility: true,
//         sectionTitles: true,
//         photoEnabled: true,
//       },
//     },
//   },

//   // ==========================================
//   // TEMPLATE 6-10: Simplified Templates
//   // ==========================================
//   {
//     category: 'corporate',
//     description: 'Professional corporate resume template for business professionals',
//     previewUrl: '/assets/resume-templates/template_06.png',
//     thumbnailUrl: '/assets/resume-templates/template_06.png',
//     tags: ['corporate', 'professional', 'business', 'clean'],
//     rating: 4.4,
//     usageCount: 156,
//     isPremium: false,
//     isActive: true,
//     structure: {
//       sections: [
//         {
//           sectionId: 'header',
//           sectionName: 'Contact',
//           isRequired: true,
//           order: 1,
//           fields: [
//             { fieldName: 'fullName', fieldType: 'text', isRequired: true },
//             { fieldName: 'position', fieldType: 'text', isRequired: true },
//             { fieldName: 'email', fieldType: 'email', isRequired: true },
//             { fieldName: 'phone', fieldType: 'phone', isRequired: true },
//           ],
//         },
//         {
//           sectionId: 'experience',
//           sectionName: 'Experience',
//           isRequired: false,
//           order: 2,
//           fields: [
//             { fieldName: 'companyName', fieldType: 'text', isRequired: false },
//             { fieldName: 'position', fieldType: 'text', isRequired: false },
//           ],
//         },
//       ],
//     },
//   },

//   {
//     category: 'corporate',
//     description: 'Customer service focused corporate resume template',
//     previewUrl: '/assets/resume-templates/template_07.png',
//     thumbnailUrl: '/assets/resume-templates/template_07.png',
//     tags: ['corporate', 'customer-service', 'professional'],
//     rating: 4.3,
//     usageCount: 134,
//     isPremium: false,
//     isActive: true,
//     structure: {
//       sections: [
//         {
//           sectionId: 'header',
//           sectionName: 'Contact',
//           isRequired: true,
//           order: 1,
//           fields: [
//             { fieldName: 'fullName', fieldType: 'text', isRequired: true },
//             { fieldName: 'email', fieldType: 'email', isRequired: true },
//           ],
//         },
//       ],
//     },
//   },

//   {
//     category: 'executive',
//     description: 'Business executive resume template for leadership roles',
//     previewUrl: '/assets/resume-templates/template_08.png',
//     thumbnailUrl: '/assets/resume-templates/template_08.png',
//     tags: ['executive', 'leadership', 'senior'],
//     rating: 4.7,
//     usageCount: 201,
//     isPremium: true,
//     isActive: true,
//     structure: {
//       sections: [
//         {
//           sectionId: 'header',
//           sectionName: 'Executive Profile',
//           isRequired: true,
//           order: 1,
//           fields: [
//             { fieldName: 'fullName', fieldType: 'text', isRequired: true },
//             { fieldName: 'position', fieldType: 'text', isRequired: true },
//           ],
//         },
//       ],
//     },
//   },

// ];

// module.exports = templateData;
