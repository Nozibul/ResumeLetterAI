/**
 * @file features/cover-letter/ui/CoverLetterPage.jsx
 * @description Cover letter generator — main page component.
 * Owns all state and orchestrates InputPanel + PreviewPanel.
 *
 * Streaming note: backend endpoint is POST, so native EventSource
 * (GET-only) cannot be used. Streaming is read via fetch + ReadableStream.
 * Auth uses httpOnly cookies (withCredentials / credentials: 'include').
 *
 * Request body varies by resumeSource:
 * - 'db' / 'paste' → JSON
 * - 'upload'       → FormData (file must travel as multipart/form-data;
 *                     Content-Type header is left unset so the browser
 *                     sets the correct multipart boundary automatically)
 *
 * @author Nozibul Islam
 */

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import InputPanel from './InputPanel';
import PreviewPanel from './PreviewPanel';
import coverLetterApi from '../api/coverLetterApi';
import { GENERATION_STAGES } from '../model/coverLetter.constants';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const INITIAL_FORM = {
  resumeSource: 'paste',
  selectedResumeId: null,
  resumeText: '',
  resumeFile: null,
  jobDescription: '',
  tone: 'professional',
  seniorityLevel: '', // '' = let the AI auto-detect from resume
};

function CoverLetterPage({ savedResumes = [] }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [stage, setStage] = useState(GENERATION_STAGES.IDLE);
  const [streamedContent, setStreamedContent] = useState('');
  const [backendPhase, setBackendPhase] = useState(null); // 'analyzing' | 'writing' | null
  const [coverLetterId, setCoverLetterId] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [errors, setErrors] = useState({});

  // Accumulates streamed chunks without stale closure issues
  const fullContentRef = useRef('');
  // Tracks the in-flight request so a new generate/regenerate can cancel it
  const abortControllerRef = useRef(null);

  const hasResumes = savedResumes.length > 0;

  // Cancel any in-flight stream if the user navigates away mid-generation
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  // ── Form field updates ─────────────────────────────────────────

  const updateField = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: null }));
  }, []);

  const handleResumeSourceChange = useCallback(
    (source) => {
      updateField('resumeSource', source);
      if (source !== 'db') updateField('selectedResumeId', null);
      if (source !== 'upload') updateField('resumeFile', null);
    },
    [updateField]
  );

  // ── Validation ────────────────────────────────────────────────

  const validate = useCallback(() => {
    const nextErrors = {};

    if (form.jobDescription.trim().length < 50) {
      nextErrors.jobDescription =
        'Job description must be at least 50 characters';
    }

    if (form.resumeSource === 'db' && !form.selectedResumeId) {
      nextErrors.resumeId = 'Please select a resume';
    } else if (
      form.resumeSource === 'paste' &&
      form.resumeText.trim().length < 100
    ) {
      nextErrors.resumeText = 'Resume text must be at least 100 characters';
    } else if (form.resumeSource === 'upload' && !form.resumeFile) {
      nextErrors.resumeFile = 'Please upload a resume file';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [form]);

  // ── Streaming ─────────────────────────────────────────────────

  const buildRequestBody = useCallback(() => {
    if (form.resumeSource === 'upload') {
      const formData = new FormData();
      formData.append('resumeSource', form.resumeSource);
      formData.append('jobDescription', form.jobDescription);
      formData.append('tone', form.tone);
      if (form.seniorityLevel) {
        formData.append('seniorityLevel', form.seniorityLevel);
      }
      formData.append('resumeFile', form.resumeFile);

      // No Content-Type header — the browser sets the multipart boundary
      // automatically. Setting it manually breaks the upload.
      return { body: formData, headers: undefined };
    }

    return {
      body: JSON.stringify({
        resumeSource: form.resumeSource,
        resumeId: form.selectedResumeId || undefined,
        resumeText: form.resumeSource !== 'db' ? form.resumeText : undefined,
        jobDescription: form.jobDescription,
        tone: form.tone,
        seniorityLevel: form.seniorityLevel || undefined,
      }),
      headers: { 'Content-Type': 'application/json' },
    };
  }, [form]);

  const streamCoverLetter = useCallback(
    async (signal) => {
      const { body, headers } = buildRequestBody();

      const attemptFetch = () =>
        fetch(`${API_BASE}/cover-letters/generate`, {
          method: 'POST',
          headers,
          credentials: 'include', // httpOnly cookie sent automatically
          signal,
          body,
        });

      let response = await attemptFetch();

      // Access token expired — try refresh once, then retry the original
      // request. Only meaningful for JSON/paste bodies; FormData (upload)
      // bodies can't be reused after being read once by fetch, so upload
      // source skips retry and just surfaces the login error.
      if (response.status === 401 && form.resumeSource !== 'upload') {
        const refreshRes = await fetch(`${API_BASE}/token/refresh-token`, {
          method: 'POST',
          credentials: 'include',
          signal,
        });

        if (refreshRes.ok) {
          response = await attemptFetch();
        }
      }

      if (!response.ok || !response.body) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to start generation');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // SSE events are separated by \n\n
        const events = buffer.split('\n\n');
        buffer = events.pop(); // keep incomplete chunk for next read

        for (const event of events) {
          const line = event.replace(/^data: /, '').trim();
          if (!line) continue;

          const payload = JSON.parse(line);

          if (payload.error) throw new Error(payload.error);

          if (payload.stage) {
            setBackendPhase(payload.stage);
          }

          if (payload.chunk) {
            fullContentRef.current += payload.chunk;
            setStreamedContent(fullContentRef.current);
          }

          if (payload.done) {
            setCoverLetterId(payload.id);
          }
        }
      }
    },
    [buildRequestBody, form.resumeSource]
  );

  // ── Generate ──────────────────────────────────────────────────

  const handleGenerate = useCallback(async () => {
    if (!validate()) return;

    // Cancel any previous in-flight stream before starting a new one —
    // prevents two streams writing into fullContentRef at the same time
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Reset state
    fullContentRef.current = '';
    setStreamedContent('');
    setIsSaved(false);
    setCoverLetterId(null);
    setBackendPhase(null);

    // Start animation — network call runs in parallel underneath
    setStage(GENERATION_STAGES.ANALYZING);

    streamCoverLetter(controller.signal)
      .then(() => setStage(GENERATION_STAGES.COMPLETE))
      .catch((err) => {
        if (err.name === 'AbortError') return; // cancelled on purpose, no toast
        toast.error(err.message || 'Generation failed. Please try again.');
        setStage(GENERATION_STAGES.IDLE);
      });
  }, [validate, streamCoverLetter]);

  const handleStepperComplete = useCallback(() => {
    setStage(GENERATION_STAGES.GENERATING);
  }, []);

  const handleRegenerate = useCallback(() => {
    handleGenerate();
  }, [handleGenerate]);

  // ── Actions ───────────────────────────────────────────────────

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(streamedContent);
      toast.success('Copied to clipboard');
    } catch {
      toast.error('Could not copy to clipboard');
    }
  }, [streamedContent]);

  const handleSave = useCallback(async () => {
    if (!coverLetterId) return;

    try {
      await coverLetterApi.save(coverLetterId);
      setIsSaved(true);
      toast.success('Saved to My Cover Letters');
    } catch (err) {
      toast.error(
        err?.response?.data?.message || 'Could not save cover letter'
      );
    }
  }, [coverLetterId]);

  // ── Render ────────────────────────────────────────────────────

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-6 max-w-6xl mx-auto p-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <InputPanel
          resumeSource={form.resumeSource}
          onResumeSourceChange={handleResumeSourceChange}
          hasResumes={hasResumes}
          selectedResumeId={form.selectedResumeId}
          onSelectedResumeChange={(id) => updateField('selectedResumeId', id)}
          savedResumes={savedResumes}
          resumeText={form.resumeText}
          onResumeTextChange={(val) => updateField('resumeText', val)}
          resumeFile={form.resumeFile}
          onResumeFileChange={(file) => updateField('resumeFile', file)}
          jobDescription={form.jobDescription}
          onJobDescriptionChange={(val) => updateField('jobDescription', val)}
          tone={form.tone}
          onToneChange={(val) => updateField('tone', val)}
          seniorityLevel={form.seniorityLevel}
          onSeniorityLevelChange={(val) => updateField('seniorityLevel', val)}
          onGenerate={handleGenerate}
          isGenerating={
            stage === GENERATION_STAGES.ANALYZING ||
            stage === GENERATION_STAGES.GENERATING
          }
          errors={errors}
        />
      </div>

      <PreviewPanel
        stage={stage}
        backendPhase={backendPhase}
        streamedContent={streamedContent}
        onStepperComplete={handleStepperComplete}
        onCopy={handleCopy}
        onSave={handleSave}
        onRegenerate={handleRegenerate}
        isSaved={isSaved}
      />
    </div>
  );
}

export default CoverLetterPage;
