import Link from 'next/link'
import React from 'react'

export const QuickAction = () => {
  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/dashboard/resumes/new"
            className="flex items-center space-x-4 p-4 border-2 border-gray-200 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-all group"
          >
            <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center group-hover:bg-teal-500 transition-colors">
              <svg className="w-6 h-6 text-teal-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Create New Resume</h3>
              <p className="text-sm text-gray-500">Start building your resume</p>
            </div>
          </Link>

          <Link
            href="/dashboard/cover-letters/new"
            className="flex items-center space-x-4 p-4 border-2 border-gray-200 rounded-lg hover:border-teal-500 hover:bg-blue-50 transition-all group"
          >
            <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center group-hover:bg-teal-500 transition-colors">
              <svg className="w-6 h-6 text-teal-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Write Cover Letter</h3>
              <p className="text-sm text-gray-500">Create a new cover letter</p>
            </div>
          </Link>
        </div>
      </div>
    </>
  )
}
