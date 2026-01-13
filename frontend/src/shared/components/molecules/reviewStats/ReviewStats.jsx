import React from 'react';
import Icons from '../../atoms/icons/Icons';

export const ReviewStats = () => {
  const stats = [
    { icon: 'star', value: '4.9/5', label: 'Average Rating' },
    { icon: 'heart', value: '2.5K+', label: 'Happy Customers' },
    { icon: 'zap', value: '85%', label: 'Satisfaction Rate' },
  ];

  return (
    <section>
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-blue-100 px-4 py-2 rounded-full mb-4">
          <Icons
            iconName="award"
            className="w-4 h-4 text-teal-600"
            aria-hidden="true"
          />
          <span className="text-md font-medium text-teal-700">
            Customer Reviews
          </span>
        </div>

        <h2 className="text-4xl font-bold bg-gradient-to-r from-teal-500 to-blue-400 bg-clip-text text-transparent mb-4">
          What Our Clients Say!
        </h2>
        <p className="text-gray-600 text-lg mx-auto">
          Don’t just take our word for it—here’s what our amazing customers have
          to say.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto mb-10">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="text-center p-6 bg-white rounded-xl shadow-xl hover:shadow-md transition-shadow"
          >
            <Icons
              iconName={stat.icon}
              className="w-10 h-10 text-teal-500 mx-auto mb-3"
            />
            <div className="text-2xl font-bold text-gray-700">{stat.value}</div>
            <p className="text-md text-gray-700">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
