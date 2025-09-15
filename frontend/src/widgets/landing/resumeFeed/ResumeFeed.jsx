'use client';
import Button from '@/shared/components/atoms/buttons/Button';
import ContentFeed from '@/shared/components/atoms/contentFeed/ContentFeed';
import Link from 'next/link';
import { useState } from 'react';
import { resumeTemplates } from '@/local-data/template-data';
import Typography from '@/shared/components/atoms/typography/Typography';
import TemplateFeed from '@/features/templates/ui/TemplateFeed';

const ResumeFeed = () => {
  const [active, setActive] = useState('1');
  const current = resumeTemplates.find((i) => i.id === active);

  return (
    <>
      <section className="min-h-screen flex flex-col items-center justify-center mt-20">
        {/* Heading */}
        <div className="w-full text-center mb-10">
          <Typography variant="h3">
            Expertly Crafted Resume Templates
          </Typography>
          <Typography variant="body" className="text-gray-500 mt-2">
            Access professionally crafted, free resume examples to create a
            resume that gets results.
          </Typography>
        </div>

        {/* Grid Content */}
        <div className="max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
          {/* Feed */}
          <ContentFeed
            resumeFeed={resumeTemplates}
            active={active}
            setActive={setActive}
          />

          {/* Detail */}
          <div className="lg:col-span-2 bg-gray-50 rounded-2xl p-4">
            <TemplateFeed feedImage={current?.template} />
          </div>

          {/* Button */}
          <div className="lg:col-span-3 flex justify-center mt-4">
            <Link href="/resume-templates" className="mb-16">
              <Button className="cursor-pointer" variant="primary" size="md">
                See All Resume Templates
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default ResumeFeed;
