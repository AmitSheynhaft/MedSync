import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  direction: 'rtl',
  palette: {
    primary: { main: '#3b5bdb' },
    background: { default: '#f8f9fa' },
  },
  typography: {
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600, borderRadius: 12 },
      },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined', fullWidth: true },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            background: '#f8f9fa',
            '&:hover fieldset': { borderColor: '#3b5bdb' },
          },
          '& .MuiInputBase-input': {
            fontSize: '13px',
            '&::placeholder': { opacity: 0.5 },
          },
          '& .MuiInputBase-inputSizeSmall': {
            paddingTop: '6.5px',
            paddingBottom: '6.5px',
          },
          '& .MuiInputLabel-root': { fontSize: '13px' },
        },
      },
    },
  },
});

export default theme;
