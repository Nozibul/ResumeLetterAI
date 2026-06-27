// modules/cover-letter/services/CoverLetterService.js

const CoverLetter = require('../models/CoverLetter');
const Resume = require('../../resume/models/Resume');
const { generateCoverLetter } = require('../../../lib/ai/provider');
const { formatResumeForAI } = require('../../../lib/resumeFormatter');

const getResumeText = async ({
  resumeSource,
  resumeId,
  resumeText,
  userId,
}) => {
  if (resumeSource === 'db') {
    const resume = await Resume.findOne({ _id: resumeId, userId });
    if (!resume) throw new Error('Resume not found');
    return { text: formatResumeForAI(resume), id: resume._id };
  }

  if (resumeSource === 'paste') {
    return { text: resumeText, id: null };
  }

  // upload case fileExtractor will handle it later
  throw new Error('File upload not yet supported');
};

const generate = async ({
  resumeSource,
  resumeId,
  resumeText,
  jobDescription,
  tone,
  userId,
  onChunk,
}) => {
  // Step 1: Resume text finding
  const { text: finalResumeText, id: finalResumeId } = await getResumeText({
    resumeSource,
    resumeId,
    resumeText,
    userId,
  });

  // Step 2: Generate with AI Cover letter content
  const content = await generateCoverLetter({
    resumeText: finalResumeText,
    jobDescription,
    tone: tone || 'professional',
    onChunk,
  });

// Step 3: Save to DB (isSaved false, will be true if user explicitly saves)  const coverLetter = await CoverLetter.create({
    userId,
    resumeSource,
    resumeId: finalResumeId,
    resumeText: finalResumeText,
    jobDescription,
    tone: tone || 'professional',
    content,
    isSaved: false,
  });

  return coverLetter;
};

const save = async ({ coverLetterId, userId }) => {
  const coverLetter = await CoverLetter.findOne({ _id: coverLetterId, userId });
  if (!coverLetter) throw new Error('Cover letter not found');

  coverLetter.isSaved = true;
  await coverLetter.save();

  return coverLetter;
};

const list = async (userId) => {
  return CoverLetter.find({ userId, isSaved: true })
    .select('jobDescription tone createdAt')
    .sort({ createdAt: -1 });
};

module.exports = { generate, save, list };
