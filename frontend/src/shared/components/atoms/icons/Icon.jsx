/**
 * @file Icon.jsx
 * @author Nozibul Islam
 *
 * @copyright (c) 2025 ResumeLetterAI. All rights reserved.
 * @license MIT
 */

import { memo } from 'react';
import {
  ChevronRight,
  Star,
  Users,
  Award,
  Zap,
  Download,
  Edit3,
  Sparkles,
  Play,
  ArrowRight,
  LayoutTemplate,
} from 'lucide-react';

const Icon = memo(({ iconName, className = '', size = 'md', ...props }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
    xxl: 'w-12 h-12',
  };

  const iconMap = {
    star: Star,
    users: Users,
    award: Award,
    zap: Zap,
    download: Download,
    edit: Edit3,
    sparkles: Sparkles,
    play: Play,
    arrow: ArrowRight,
    chevron: ChevronRight,
    template: LayoutTemplate,
  };

  const IconComponent = iconMap[iconName] || Star;

  return <IconComponent className={`${sizes[size]} ${className}`} {...props} />;
});

export default Icon;
