// lib/resumeFormatter.js

const formatResumeForAI = (resume) => {
  const {
    personalInfo,
    summary,
    workExperience,
    skills,
    projects,
    education,
    sectionVisibility,
  } = resume;

  let text = '';

  text += `Name: ${personalInfo.fullName}\n`;
  text += `Title: ${personalInfo.jobTitle}\n\n`;

  if (sectionVisibility?.summary && summary?.text) {
    text += `Professional Summary:\n${summary.text}\n\n`;
  }

  if (sectionVisibility?.workExperience && workExperience?.length) {
    text += `Work Experience:\n`;
    workExperience.forEach((exp) => {
      text += `${exp.jobTitle} at ${exp.company}\n`;
      exp.responsibilities?.forEach((r) => {
        text += `- ${r}\n`;
      });
      text += '\n';
    });
  }

  if (sectionVisibility?.skills && skills) {
    text += `Technical Skills:\n`;
    if (skills.programmingLanguages?.length)
      text += `Languages: ${skills.programmingLanguages.join(', ')}\n`;
    if (skills.frontend?.length)
      text += `Frontend: ${skills.frontend.join(', ')}\n`;
    if (skills.backend?.length)
      text += `Backend: ${skills.backend.join(', ')}\n`;
    text += '\n';
  }

  if (sectionVisibility?.projects && projects?.length) {
    text += `Notable Projects:\n`;
    projects.forEach((proj) => {
      text += `${proj.projectName}: ${proj.description}\n`;
      proj.highlights?.forEach((h) => {
        text += `- ${h}\n`;
      });
      text += '\n';
    });
  }

  if (sectionVisibility?.education && education?.length) {
    text += `Education:\n`;
    education.forEach((edu) => {
      text += `${edu.degree} - ${edu.institution}\n`;
    });
  }

  return text.trim();
};

module.exports = { formatResumeForAI };
