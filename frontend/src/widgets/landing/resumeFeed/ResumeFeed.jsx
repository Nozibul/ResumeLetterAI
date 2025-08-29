'use client';
import Button from '@/shared/components/atoms/buttons/Button';
import ContentFeed from '@/shared/components/atoms/contentFeed/ContentFeed';
import Link from 'next/link';
import { useState } from 'react';

const items = [
  { id: 1, title: 'Web Design Trends', category: 'Design', time: '2h' },
  { id: 2, title: 'JS Performance', category: 'Dev', time: '4h' },
  { id: 3, title: 'CSS Grid vs Flex', category: 'CSS', time: '6h' },
  { id: 4, title: 'React Hooks Guide', category: 'React', time: '8h' },
  { id: 5, title: 'API Integration', category: 'Backend', time: '10h' },
  { id: 6, title: 'Database Design', category: 'SQL', time: '12h' },
  { id: 7, title: 'UI/UX Principles', category: 'Design', time: '1d' },
  { id: 8, title: 'Node.js Basics', category: 'Backend', time: '2d' },
];

const ResumeFeed = () => {
  const [active, setActive] = useState(1);
  const current = items.find((i) => i.id === active);

  return (
    <>
      <section className="min-h-screen flex items-center justify-center p-4">
        <div className=" max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Feed */}
          <ContentFeed items={items} active={active} setActive={setActive} />

          {/* Detail */}
          <div className="lg:col-span-2 bg-gray-50 rounded-2xl p-8">
            <div className="prose max-w-none">
              <p className="text-gray-700 mb-4">
                This is the detailed content for {current.title}. Lorem ipsum
                dolor sit amet, consectetur adipiscing elit.
              </p>

              <h3 className="font-semibold mb-2">Key Points:</h3>
              <ul className="space-y-1 text-gray-600">
                <li>• Point one about {current.category.toLowerCase()}</li>
                <li>• Point two with more details</li>
                <li>• Point three for better understanding</li>
              </ul>
            </div>
          </div>

          {/* Button - Full width bottom */}
          <div className="lg:col-span-3 flex justify-center mt-4">
            <Link href="/resume-templates">
              <Button className="cursor-pointer" variant="primary" size="md">
                See All Resume Templates{' '}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default ResumeFeed;
