export const termsLinkSx = (color: string) => ({
  fontSize: 13,
  color,
  fontWeight: 600,
  textDecoration: 'none',
  '&:hover': { textDecoration: 'underline' },
});

export const termsCheckboxSx = (color: string) => ({
  color,
  '&.Mui-checked': { color },
});

export const termsTextSx = {
  fontSize: 13,
  color: 'text.secondary',
};
