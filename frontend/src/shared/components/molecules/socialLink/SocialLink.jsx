import React from 'react';
import * as Icons from 'lucide-react';
import Link from 'next/link';
import PropTypes from 'prop-types';

const SocialLink = React.memo(({ social }) => {
  const IconComponent = Icons[social.icon];

  return (
    <Link
      href={social.href}
      className={`w-10 h-10 bg-teal-600 hover:bg-teal-300 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 `}
      aria-label={social.ariaLabel}
      data-testid={`social-${social.name.toLowerCase()}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      <IconComponent className="text-white  w-6 h-6" />
    </Link>
  );
});

SocialLink.displayName = 'SocialLink';

SocialLink.propTypes = {
  social: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    href: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
    hoverColor: PropTypes.string.isRequired,
    ariaLabel: PropTypes.string.isRequired,
  }).isRequired,
};
export default SocialLink;
