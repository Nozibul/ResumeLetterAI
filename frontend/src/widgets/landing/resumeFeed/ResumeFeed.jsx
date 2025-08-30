'use client';
import Button from '@/shared/components/atoms/buttons/Button';
import ContentFeed from '@/shared/components/atoms/contentFeed/ContentFeed';
import Link from 'next/link';
import { useState } from 'react';
import { resumeTemplates } from '@/local-data/template-data';
import TemplateFeed from '@/shared/components/atoms/templateFeed/TemplateFeed';

const ResumeFeed = () => {
  const [active, setActive] = useState('1');
  const current = resumeTemplates.find((i) => i.id === active);

  return (
    <>
      <section className="min-h-screen flex items-center justify-center ">
        <div className=" max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-8">
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

          {/* Button - Full width bottom */}
          <div className="lg:col-span-3 flex justify-center mt-4">
            <Link href="/resume-templates">
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
