'use client';
/**
 * @file FAQ.jsx
 * @author Nozibul Islam
 *
 * @copyright (c) 2025 ResumeLetterAI. All rights reserved.
 * @license MIT
 */

import Button from '@/shared/components/atoms/buttons/Button';
import Typography from '@/shared/components/atoms/typography/Typography';
import React, { useState, useRef, useEffect } from 'react';

const FAQ = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [heights, setHeights] = useState({});
  const contentRefs = useRef({});

  const faqData = [
    {
      id: 1,
      question: 'What is ResumeLetterAI?',
      answer:
        'ResumeLetterAI is an AI-powered platform that helps you create professional resumes and cover letters within minutes. You can also manually customize templates to match your style.',
    },
    {
      id: 2,
      question: 'Is ResumeLetterAI free to use?',
      answer:
        'Yes! ResumeLetterAI is completely free. You can create, edit, and download your resume or cover letter without paying anything.',
    },
    {
      id: 3,
      question: 'Can I manually edit my resume or cover letter?',
      answer:
        'Absolutely. Along with AI-generated suggestions, you can manually edit your documents in real time. Every change updates instantly.',
    },
    {
      id: 4,
      question: 'Do you offer ATS-friendly resume templates?',
      answer:
        'Yes, all our resume templates are ATS-friendly. They are designed to pass applicant tracking system filters and reach recruiters directly.',
    },
    {
      id: 5,
      question: 'What file formats are available for download?',
      answer:
        'You can download your resume and cover letter in PDF format. Additionally, we’ll email a copy directly to your inbox.',
    },
    {
      id: 6,
      question: 'Can ResumeLetterAI generate cover letters?',
      answer:
        'Yes, our AI Cover Letter Generator creates professional cover letters tailored to your resume. You can also edit them manually as needed.',
    },
    {
      id: 7,
      question: 'Do I need to create an account to use ResumeLetterAI?',
      answer:
        'No account is required to start building your resume or cover letter. However, creating a free account helps you save your progress and access your documents later.',
    },
    {
      id: 8,
      question: 'Is my data safe with ResumeLetterAI?',
      answer:
        'Yes. We value your privacy and ensure that your data is secure. Your resumes and cover letters are stored safely and never shared with third parties.',
    },
  ];

  useEffect(() => {
    // Calculate heights for smooth animations
    const newHeights = {};
    faqData.forEach((faq) => {
      if (contentRefs.current[faq.id]) {
        newHeights[faq.id] = contentRefs.current[faq.id].scrollHeight;
      }
    });
    setHeights(newHeights);
  }, []);

  const handleClick = (id) => {
    setActiveTab(activeTab === id ? 0 : id);
  };

  const ChevronIcon = ({ isRotated }) => (
    <div
      className={`transform transition-all duration-700 ease-out ${isRotated ? 'rotate-180 scale-110' : 'scale-100'}`}
    >
      <svg className="fill-current text-gray-700 h-6 w-6" viewBox="0 0 20 20">
        <path d="M13.962,8.885l-3.736,3.739c-0.086,0.086-0.201,0.13-0.314,0.13S9.686,12.71,9.6,12.624l-3.562-3.56C5.863,8.892,5.863,8.611,6.036,8.438c0.175-0.173,0.454-0.173,0.626,0l3.25,3.247l3.426-3.424c0.173-0.172,0.451-0.172,0.624,0C14.137,8.434,14.137,8.712,13.962,8.885 M18.406,10c0,4.644-3.763,8.406-8.406,8.406S1.594,14.644,1.594,10S5.356,1.594,10,1.594S18.406,5.356,18.406,10 M17.521,10c0-4.148-3.373-7.521-7.521-7.521c-4.148,0-7.521,3.374-7.521,7.521c0,4.147,3.374,7.521,7.521,7.521C14.148,17.521,17.521,14.147,17.521,10"></path>
      </svg>
    </div>
  );

  return (
    <section className="min-h-screen bg-gradient-to-br from-[#f9fefe] via-white to-white">
      <div>
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -inset-10 opacity-20">
            <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full mix-blend-multiply filter blur-lg animate-pulse"></div>
            <div className="absolute top-3/4 right-1/4 w-72 h-72  rounded-full mix-blend-multiply filter blur-lg animate-pulse delay-1000"></div>
            <div className="absolute bottom-1/4 left-1/3 w-72 h-72  rounded-full mix-blend-multiply filter blur-lg animate-pulse delay-500"></div>
          </div>
        </div>

        <main className="relative py-20">
          <div className="flex justify-center items-start">
            <div className="w-full max-w-2xl">
              {/* Enhanced Header */}
              <div className="text-center mb-12">
                <Typography variant="h2">Frequently Asked Questions</Typography>
                {/* <h1 className="text-5xl font-bold  mb-4"></h1> */}
                <div className="mt-2 w-28 h-1 bg-gradient-to-r from-teal-500 to-purple-300 mx-auto rounded-full"></div>
                <p className="text-gray-600 mt-4 text-xl">
                  Everything you need to know about orders and shipping
                </p>
              </div>

              {/* Enhanced Accordion */}
              <div className="space-y-4">
                {faqData?.map((faq, index) => (
                  <div
                    key={faq.id}
                    className={`group rounded-2xl shadow-xl transition-all duration-500 ease-out hover:shadow-purple-500/25 hover:border-teal-400/30 hover:scale-[1.02] ${
                      activeTab === faq.id
                        ? 'ring-2 ring-teal-400/50 shadow-purple-400/30'
                        : ''
                    }`}
                    style={{
                      animationDelay: `${index * 100}ms`,
                      animation: 'slideInUp 0.6s ease-out forwards',
                    }}
                  >
                    <button
                      onClick={() => handleClick(faq.id)}
                      className="w-full flex justify-between items-center p-6 text-left focus:outline-none focus:ring-1 focus:ring-teal-400 focus:ring-opacity-50 rounded-2xl transition-all duration-300"
                    >
                      <span className=" font-semibold text-lg pr-8 transition-colors duration-300">
                        {faq.question}
                      </span>
                      <ChevronIcon isRotated={activeTab === faq.id} />
                    </button>

                    <div
                      className="overflow-hidden transition-all duration-700 ease-out"
                      style={{
                        maxHeight:
                          activeTab === faq.id
                            ? `${heights[faq.id] || 200}px`
                            : '0px',
                        opacity: activeTab === faq.id ? 1 : 0,
                      }}
                    >
                      <div
                        ref={(el) => (contentRefs.current[faq.id] = el)}
                        className="px-6 pb-6"
                      >
                        <div className="h-px via-teal-400/50 to-transparent mb-4"></div>
                        <p className="leading-relaxed text-base">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>

        <style jsx>{`
          @keyframes slideInUp {
            from {
              opacity: 0;
              transform: translateY(30px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
        `}</style>
      </div>
      <div className="max-w-6xl mx-auto mt-8 mb-20">
        {/* CTA Section */}
        <div className="bg-gradient-to-br from-[#56bfaa] to-[#18247e] rounded-2xl p-12 text-center">
          <h1 className="text-3xl font-semibold text-white mb-4 py-4">
            Transform your career today and join thousands of satisfied users!
          </h1>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button className="text-lg" variant="secondary">
              Create Your Resume Now
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
