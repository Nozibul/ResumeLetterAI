/**
 * @file app/cover-letter/page.jsx
 * @description Cover letter generator page
 * @author Nozibul Islam
 *
 * Data flow:
 * - savedResumes → Redux (selectAllResumes)
 * - Fetch only if not cached within last 5 minutes (selectIsResumesCached)
 * - Auth protection handled by CoverLetterLayout
 */

'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CoverLetterPage from '@/features/cover-letter/ui/CoverLetterPage';
import { fetchAllResumes } from '@/shared/store/actions/resumeActions';
import {
  selectAllResumes,
  selectIsResumesCached,
} from '@/shared/store/selectors/resumeSelectors';

export default function CoverLetterRoute() {
  const dispatch = useDispatch();
  const savedResumes = useSelector(selectAllResumes);
  const isCached = useSelector(selectIsResumesCached);

  useEffect(() => {
    if (!isCached) {
      dispatch(fetchAllResumes());
    }
  }, [dispatch, isCached]);

  return <CoverLetterPage savedResumes={savedResumes} />;
}
