import { memo, useCallback } from 'react';
const Button = memo(
  ({
    variant = 'primary',
    size = 'md',
    children,
    className = '',
    icon,
    iconPosition = 'right',
    onClick,
    analytics = {},
    loading = false,
    disabled = false,
    ...props
  }) => {
    const handleClick = useCallback(
      (e) => {
        if (analytics.event) {
          // Analytics tracking would go here
          console.log('Analytics:', analytics.event, analytics.properties);
        }
        onClick?.(e);
      },
      [onClick, analytics]
    );

    const baseClasses =
      'inline-flex items-center justify-center font-semibold transition-all duration-300 cursor rounded-lg focus:outline-none focus:ring-4 disabled:opacity-50 relative overflow-hidden';

    const variants = {
      primary:
        'bg-gradient-to-r from-teal-400 to-teal-600 hover:from-teal-600 hover:to-teal-400 text-white shadow-lg hover:shadow-xl focus:ring-teal-400 transform hover:scale-103',
      secondary:
        'bg-white  border-1 border-teal-600 text-teal-600 hover:bg-teal-50 focus:ring-teal-300 hover:border-teal-700 ',
      ghost:
        'text-teal-600 hover:bg-teal-50 focus:ring-teal-300 hover:text-teal-700',
      outline:
        ' border-2 border-gray-300 text-gray-700 hover:border-teal-500 hover:text-teal-600 focus:ring-teal-300',
    };

    const sizes = {
      sm: 'px-4 py-2 text-sm gap-2',
      md: 'px-6 py-3 text-base gap-2',
      lg: 'px-8 py-4 text-lg gap-3',
      xl: 'px-10 py-5 text-xl gap-3',
    };

    return (
      <button
        className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
        onClick={handleClick}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-20 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        {icon && iconPosition === 'left' && <span>{icon}</span>}
        {children}
        {icon && iconPosition === 'right' && <span>{icon}</span>}
      </button>
    );
  }
);

export default Button;
