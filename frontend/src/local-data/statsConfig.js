// ==========================================
// STATS CARDS CONFIGURATION
// ==========================================
export const statsConfig = [
  {
    id: 'resumes',
    title: 'My Resumes',
    count: 0,
    description: 'No resumes yet',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    ),
    bgColor: 'bg-teal-100',
    iconColor: 'text-teal-600',
  },
  {
    id: 'coverLetters',
    title: 'Cover Letters',
    count: 0,
    description: 'No cover letters yet',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    ),
    bgColor: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    id: 'templates',
    title: 'Templates',
    count: 12,
    description: 'Available templates',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
      />
    ),
    bgColor: 'bg-purple-100',
    iconColor: 'text-purple-600',
  },
];