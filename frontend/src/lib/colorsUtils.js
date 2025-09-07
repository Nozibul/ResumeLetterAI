// utils/colorUtils.js

const COLORS = [
  'blue',
  'red',
  'green',
  'orange',
  'purple',
  'teal',
  'amber',
  'pink',
  'indigo',
  'cyan',
];

export const getColorGradient = (index) => {
  const colors = {
    blue: 'from-blue-300 to-blue-500',
    red: 'from-red-300 to-red-500',
    green: 'from-green-300 to-green-500',
    orange: 'from-orange-300 to-orange-700',
    purple: 'from-purple-300 to-purple-500',
    teal: 'from-teal-300 to-teal-500',
    amber: 'from-amber-300 to-amber-500',
    pink: 'from-pink-300 to-pink-500',
    indigo: 'from-indigo-300 to-indigo-500',
    cyan: 'from-cyan-300 to-cyan-500',
  };

  const colorName = COLORS[index % COLORS.length];
  return colors[colorName];
};

export const getBorderColor = (index) => {
  const colors = {
    blue: 'border-blue-300',
    red: 'border-red-300',
    green: 'border-green-300',
    orange: 'border-orange-300',
    purple: 'border-purple-300',
    teal: 'border-teal-300',
    amber: 'border-amber-300',
    pink: 'border-pink-300',
    indigo: 'border-indigo-300',
    cyan: 'border-cyan-300',
  };

  const colorName = COLORS[index % COLORS.length];
  return colors[colorName];
};
