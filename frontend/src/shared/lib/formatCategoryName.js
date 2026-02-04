export const formatCategoryName = (name) => {
  if (!name) return '';
  return name.replace(/-resume$/i, '').toUpperCase();
};
