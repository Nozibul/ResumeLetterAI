/**
 * @file seeders/templateData/templateData.js
 * @description Template seed data for ResumeLetterAI
 * @author Nozibul Islam
 */

const templateData = [
  // Template 1: ATS-Friendly
  {
    category: 'ats-friendly',
    description: 'Clean and professional ATS-optimized resume template perfect for job applications',
    previewUrl: '/assets/resume-templates/template_01.png',
    thumbnailUrl: '/assets/resume-templates/template_01.png',
    tags: ['ats', 'professional', 'clean', 'modern'],
    rating: 4.7,
    usageCount: 245,
    isPremium: false,
    isActive: true,
    structure: {
      sections: [
        {
          sectionId: 'header',
          sectionName: 'Header',
          isRequired: true,
          order: 1,
          fields: [
            { fieldName: 'fullName', fieldType: 'text', isRequired: true, placeholder: 'Your Full Name' },
            { fieldName: 'position', fieldType: 'text', isRequired: true, placeholder: 'Job Title' },
            { fieldName: 'email', fieldType: 'email', isRequired: true, placeholder: 'your.email@example.com' },
            { fieldName: 'phone', fieldType: 'phone', isRequired: true, placeholder: '+1 234 567 8900' },
          ],
        },
        {
          sectionId: 'experience',
          sectionName: 'Work Experience',
          isRequired: false,
          order: 2,
          fields: [
            { fieldName: 'companyName', fieldType: 'text', isRequired: false, placeholder: 'Company Name' },
            { fieldName: 'position', fieldType: 'text', isRequired: false, placeholder: 'Job Title' },
            { fieldName: 'startDate', fieldType: 'date', isRequired: false },
            { fieldName: 'endDate', fieldType: 'date', isRequired: false },
          ],
        },
        {
          sectionId: 'education',
          sectionName: 'Education',
          isRequired: false,
          order: 3,
          fields: [
            { fieldName: 'degree', fieldType: 'text', isRequired: false, placeholder: 'Degree' },
            { fieldName: 'institution', fieldType: 'text', isRequired: false, placeholder: 'University' },
          ],
        },
      ],
    },
  },

  // Template 2: Corporate
  {
    category: 'corporate',
    description: 'Professional corporate resume template with elegant design for business professionals',
    previewUrl: '/assets/resume-templates/template_02.png',
    thumbnailUrl: '/assets/resume-templates/template_02.png',
    tags: ['corporate', 'business', 'elegant', 'professional'],
    rating: 4.5,
    usageCount: 189,
    isPremium: false,
    isActive: true,
    structure: {
      sections: [
        {
          sectionId: 'header',
          sectionName: 'Contact Information',
          isRequired: true,
          order: 1,
          fields: [
            { fieldName: 'fullName', fieldType: 'text', isRequired: true, placeholder: 'Full Name' },
            { fieldName: 'position', fieldType: 'text', isRequired: true, placeholder: 'Professional Title' },
            { fieldName: 'email', fieldType: 'email', isRequired: true, placeholder: 'Email Address' },
            { fieldName: 'phone', fieldType: 'phone', isRequired: true, placeholder: 'Phone Number' },
            { fieldName: 'linkedin', fieldType: 'url', isRequired: false, placeholder: 'LinkedIn URL' },
          ],
        },
        {
          sectionId: 'profile',
          sectionName: 'Executive Summary',
          isRequired: false,
          order: 2,
          fields: [
            { fieldName: 'summary', fieldType: 'textarea', isRequired: false, placeholder: 'Executive summary...' },
          ],
        },
        {
          sectionId: 'experience',
          sectionName: 'Professional Experience',
          isRequired: false,
          order: 3,
          fields: [
            { fieldName: 'companyName', fieldType: 'text', isRequired: false, placeholder: 'Company' },
            { fieldName: 'position', fieldType: 'text', isRequired: false, placeholder: 'Position' },
            { fieldName: 'startDate', fieldType: 'date', isRequired: false },
            { fieldName: 'endDate', fieldType: 'date', isRequired: false },
          ],
        },
      ],
    },
  },

  // Template 3: Creative
  {
    category: 'creative',
    description: 'Bold and creative resume template for designers and creative professionals',
    previewUrl: '/assets/resume-templates/template_03.png',
    thumbnailUrl: '/assets/resume-templates/template_03.png',
    tags: ['creative', 'designer', 'colorful', 'modern'],
    rating: 4.8,
    usageCount: 312,
    isPremium: true,
    isActive: true,
    structure: {
      sections: [
        {
          sectionId: 'header',
          sectionName: 'Profile Header',
          isRequired: true,
          order: 1,
          fields: [
            { fieldName: 'fullName', fieldType: 'text', isRequired: true, placeholder: 'Your Name' },
            { fieldName: 'position', fieldType: 'text', isRequired: true, placeholder: 'Creative Role' },
            { fieldName: 'email', fieldType: 'email', isRequired: true, placeholder: 'Email' },
            { fieldName: 'portfolio', fieldType: 'url', isRequired: false, placeholder: 'Portfolio URL' },
          ],
        },
        {
          sectionId: 'projects',
          sectionName: 'Featured Projects',
          isRequired: false,
          order: 2,
          fields: [
            { fieldName: 'projectName', fieldType: 'text', isRequired: false, placeholder: 'Project Name' },
            { fieldName: 'description', fieldType: 'textarea', isRequired: false, placeholder: 'Project description' },
            { fieldName: 'technologies', fieldType: 'array', isRequired: false, placeholder: 'Technologies used' },
          ],
        },
        {
          sectionId: 'skills',
          sectionName: 'Core Skills',
          isRequired: false,
          order: 3,
          fields: [
            { fieldName: 'skillName', fieldType: 'text', isRequired: false, placeholder: 'Skill' },
          ],
        },
      ],
    },
  },

  // Template 4: Executive
  {
    category: 'executive',
    description: 'Executive-level resume template for senior leadership positions',
    previewUrl: '/assets/resume-templates/template_04.png',
    thumbnailUrl: '/assets/resume-templates/template_04.png',
    tags: ['executive', 'leadership', 'senior', 'professional'],
    rating: 4.6,
    usageCount: 178,
    isPremium: true,
    isActive: true,
    structure: {
      sections: [
        {
          sectionId: 'header',
          sectionName: 'Executive Profile',
          isRequired: true,
          order: 1,
          fields: [
            { fieldName: 'fullName', fieldType: 'text', isRequired: true, placeholder: 'Full Name' },
            { fieldName: 'position', fieldType: 'text', isRequired: true, placeholder: 'Executive Title' },
            { fieldName: 'email', fieldType: 'email', isRequired: true, placeholder: 'Email' },
            { fieldName: 'phone', fieldType: 'phone', isRequired: true, placeholder: 'Phone' },
          ],
        },
        {
          sectionId: 'profile',
          sectionName: 'Executive Summary',
          isRequired: true,
          order: 2,
          fields: [
            { fieldName: 'summary', fieldType: 'textarea', isRequired: true, placeholder: 'Leadership summary and key achievements...' },
          ],
        },
        {
          sectionId: 'experience',
          sectionName: 'Leadership Experience',
          isRequired: false,
          order: 3,
          fields: [
            { fieldName: 'companyName', fieldType: 'text', isRequired: false, placeholder: 'Organization' },
            { fieldName: 'position', fieldType: 'text', isRequired: false, placeholder: 'Leadership Role' },
            { fieldName: 'startDate', fieldType: 'date', isRequired: false },
            { fieldName: 'endDate', fieldType: 'date', isRequired: false },
          ],
        },
      ],
    },
  },

  // Template 5: IT Professional
  {
    category: 'it',
    description: 'IT professional resume template optimized for tech roles',
    previewUrl: '/assets/resume-templates/template_05.png',
    thumbnailUrl: '/assets/resume-templates/template_05.png',
    tags: ['it', 'technology', 'developer', 'engineer'],
    rating: 4.9,
    usageCount: 567,
    isPremium: false,
    isActive: true,
    structure: {
      sections: [
        {
          sectionId: 'header',
          sectionName: 'Developer Profile',
          isRequired: true,
          order: 1,
          fields: [
            { fieldName: 'fullName', fieldType: 'text', isRequired: true, placeholder: 'Your Name' },
            { fieldName: 'position', fieldType: 'text', isRequired: true, placeholder: 'Job Title' },
            { fieldName: 'email', fieldType: 'email', isRequired: true, placeholder: 'Email' },
            { fieldName: 'github', fieldType: 'url', isRequired: false, placeholder: 'GitHub Profile' },
            { fieldName: 'linkedin', fieldType: 'url', isRequired: false, placeholder: 'LinkedIn' },
          ],
        },
        {
          sectionId: 'technologies',
          sectionName: 'Technical Skills',
          isRequired: false,
          order: 2,
          fields: [
            { fieldName: 'category', fieldType: 'text', isRequired: false, placeholder: 'e.g., Frontend, Backend, DevOps' },
            { fieldName: 'techStack', fieldType: 'array', isRequired: false, placeholder: 'Technologies' },
          ],
        },
        {
          sectionId: 'projects',
          sectionName: 'Projects',
          isRequired: false,
          order: 3,
          fields: [
            { fieldName: 'projectName', fieldType: 'text', isRequired: false, placeholder: 'Project Name' },
            { fieldName: 'description', fieldType: 'textarea', isRequired: false, placeholder: 'Description' },
            { fieldName: 'technologies', fieldType: 'array', isRequired: false, placeholder: 'Tech Stack' },
            { fieldName: 'projectUrl', fieldType: 'url', isRequired: false, placeholder: 'Live Demo / GitHub' },
          ],
        },
        {
          sectionId: 'experience',
          sectionName: 'Work Experience',
          isRequired: false,
          order: 4,
          fields: [
            { fieldName: 'companyName', fieldType: 'text', isRequired: false, placeholder: 'Company' },
            { fieldName: 'position', fieldType: 'text', isRequired: false, placeholder: 'Role' },
            { fieldName: 'startDate', fieldType: 'date', isRequired: false },
            { fieldName: 'endDate', fieldType: 'date', isRequired: false },
          ],
        },
      ],
    },
  },

  // Template 6-16: Simplified structure (same pattern as above)
  {
    category: 'corporate',
    description: 'Professional corporate resume template for business professionals',
    previewUrl: '/assets/resume-templates/template_06.png',
    thumbnailUrl: '/assets/resume-templates/template_06.png',
    tags: ['corporate', 'professional', 'business', 'clean'],
    rating: 4.4,
    usageCount: 156,
    isPremium: false,
    isActive: true,
    structure: {
      sections: [
        {
          sectionId: 'header',
          sectionName: 'Contact',
          isRequired: true,
          order: 1,
          fields: [
            { fieldName: 'fullName', fieldType: 'text', isRequired: true },
            { fieldName: 'position', fieldType: 'text', isRequired: true },
            { fieldName: 'email', fieldType: 'email', isRequired: true },
            { fieldName: 'phone', fieldType: 'phone', isRequired: true },
          ],
        },
        {
          sectionId: 'experience',
          sectionName: 'Experience',
          isRequired: false,
          order: 2,
          fields: [
            { fieldName: 'companyName', fieldType: 'text', isRequired: false },
            { fieldName: 'position', fieldType: 'text', isRequired: false },
          ],
        },
      ],
    },
  },

  {
    category: 'corporate',
    description: 'Customer service focused corporate resume template',
    previewUrl: '/assets/resume-templates/template_07.png',
    thumbnailUrl: '/assets/resume-templates/template_07.png',
    tags: ['corporate', 'customer-service', 'professional'],
    rating: 4.3,
    usageCount: 134,
    isPremium: false,
    isActive: true,
    structure: {
      sections: [
        {
          sectionId: 'header',
          sectionName: 'Contact',
          isRequired: true,
          order: 1,
          fields: [
            { fieldName: 'fullName', fieldType: 'text', isRequired: true },
            { fieldName: 'email', fieldType: 'email', isRequired: true },
          ],
        },
      ],
    },
  },

  {
    category: 'executive',
    description: 'Business executive resume template for leadership roles',
    previewUrl: '/assets/resume-templates/template_08.png',
    thumbnailUrl: '/assets/resume-templates/template_08.png',
    tags: ['executive', 'leadership', 'senior'],
    rating: 4.7,
    usageCount: 201,
    isPremium: true,
    isActive: true,
    structure: {
      sections: [
        {
          sectionId: 'header',
          sectionName: 'Executive Profile',
          isRequired: true,
          order: 1,
          fields: [
            { fieldName: 'fullName', fieldType: 'text', isRequired: true },
            { fieldName: 'position', fieldType: 'text', isRequired: true },
          ],
        },
      ],
    },
  },

  {
    category: 'it',
    description: 'Frontend developer resume template',
    previewUrl: '/assets/resume-templates/template_09.png',
    thumbnailUrl: '/assets/resume-templates/template_09.png',
    tags: ['it', 'frontend', 'developer', 'tech'],
    rating: 4.8,
    usageCount: 423,
    isPremium: false,
    isActive: true,
    structure: {
      sections: [
        {
          sectionId: 'header',
          sectionName: 'Developer Info',
          isRequired: true,
          order: 1,
          fields: [
            { fieldName: 'fullName', fieldType: 'text', isRequired: true },
            { fieldName: 'github', fieldType: 'url', isRequired: false },
          ],
        },
        {
          sectionId: 'technologies',
          sectionName: 'Tech Stack',
          isRequired: false,
          order: 2,
          fields: [
            { fieldName: 'category', fieldType: 'text', isRequired: false },
            { fieldName: 'techStack', fieldType: 'array', isRequired: false },
          ],
        },
      ],
    },
  },

  {
    category: 'it',
    description: 'Software developer resume template',
    previewUrl: '/assets/resume-templates/template_10.png',
    thumbnailUrl: '/assets/resume-templates/template_10.png',
    tags: ['it', 'software', 'developer', 'engineer'],
    rating: 4.9,
    usageCount: 512,
    isPremium: false,
    isActive: true,
    structure: {
      sections: [
        {
          sectionId: 'header',
          sectionName: 'Profile',
          isRequired: true,
          order: 1,
          fields: [
            { fieldName: 'fullName', fieldType: 'text', isRequired: true },
            { fieldName: 'email', fieldType: 'email', isRequired: true },
          ],
        },
      ],
    },
  },

  {
    category: 'ats-friendly',
    description: 'Engineering resume optimized for ATS systems',
    previewUrl: '/assets/resume-templates/template_11.png',
    thumbnailUrl: '/assets/resume-templates/template_11.png',
    tags: ['ats', 'engineering', 'technical'],
    rating: 4.6,
    usageCount: 287,
    isPremium: false,
    isActive: true,
    structure: {
      sections: [
        {
          sectionId: 'header',
          sectionName: 'Header',
          isRequired: true,
          order: 1,
          fields: [
            { fieldName: 'fullName', fieldType: 'text', isRequired: true },
            { fieldName: 'position', fieldType: 'text', isRequired: true },
          ],
        },
      ],
    },
  },

  {
    category: 'ats-friendly',
    description: 'Internship resume template optimized for ATS',
    previewUrl: '/assets/resume-templates/template_12.png',
    thumbnailUrl: '/assets/resume-templates/template_12.png',
    tags: ['ats', 'internship', 'student', 'entry-level'],
    rating: 4.5,
    usageCount: 342,
    isPremium: false,
    isActive: true,
    structure: {
      sections: [
        {
          sectionId: 'header',
          sectionName: 'Contact',
          isRequired: true,
          order: 1,
          fields: [
            { fieldName: 'fullName', fieldType: 'text', isRequired: true },
            { fieldName: 'email', fieldType: 'email', isRequired: true },
          ],
        },
        {
          sectionId: 'education',
          sectionName: 'Education',
          isRequired: true,
          order: 2,
          fields: [
            { fieldName: 'degree', fieldType: 'text', isRequired: true },
            { fieldName: 'institution', fieldType: 'text', isRequired: true },
          ],
        },
      ],
    },
  },

  {
    category: 'executive',
    description: 'Traditional executive resume template',
    previewUrl: '/assets/resume-templates/template_13.png',
    thumbnailUrl: '/assets/resume-templates/template_13.png',
    tags: ['executive', 'traditional', 'classic'],
    rating: 4.4,
    usageCount: 167,
    isPremium: true,
    isActive: true,
    structure: {
      sections: [
        {
          sectionId: 'header',
          sectionName: 'Executive Info',
          isRequired: true,
          order: 1,
          fields: [
            { fieldName: 'fullName', fieldType: 'text', isRequired: true },
            { fieldName: 'position', fieldType: 'text', isRequired: true },
          ],
        },
      ],
    },
  },

  {
    category: 'creative',
    description: 'Eye-catching creative resume template',
    previewUrl: '/assets/resume-templates/template_14.png',
    thumbnailUrl: '/assets/resume-templates/template_14.png',
    tags: ['creative', 'designer', 'eye-catching'],
    rating: 4.7,
    usageCount: 298,
    isPremium: true,
    isActive: true,
    structure: {
      sections: [
        {
          sectionId: 'header',
          sectionName: 'Profile',
          isRequired: true,
          order: 1,
          fields: [
            { fieldName: 'fullName', fieldType: 'text', isRequired: true },
            { fieldName: 'portfolio', fieldType: 'url', isRequired: false },
          ],
        },
      ],
    },
  },

  {
    category: 'it',
    description: 'UI/UX designer resume template',
    previewUrl: '/assets/resume-templates/template_15.png',
    thumbnailUrl: '/assets/resume-templates/template_15.png',
    tags: ['it', 'ui', 'ux', 'designer'],
    rating: 4.8,
    usageCount: 378,
    isPremium: true,
    isActive: true,
    structure: {
      sections: [
        {
          sectionId: 'header',
          sectionName: 'Designer Profile',
          isRequired: true,
          order: 1,
          fields: [
            { fieldName: 'fullName', fieldType: 'text', isRequired: true },
            { fieldName: 'portfolio', fieldType: 'url', isRequired: true },
          ],
        },
      ],
    },
  },

  {
    category: 'creative',
    description: 'Colorful creative resume template',
    previewUrl: '/assets/resume-templates/template_16.png',
    thumbnailUrl: '/assets/resume-templates/template_16.png',
    tags: ['creative', 'colorful', 'modern'],
    rating: 4.6,
    usageCount: 234,
    isPremium: false,
    isActive: true,
    structure: {
      sections: [
        {
          sectionId: 'header',
          sectionName: 'Header',
          isRequired: true,
          order: 1,
          fields: [
            { fieldName: 'fullName', fieldType: 'text', isRequired: true },
            { fieldName: 'position', fieldType: 'text', isRequired: true },
          ],
        },
      ],
    },
  },
];

module.exports = templateData;