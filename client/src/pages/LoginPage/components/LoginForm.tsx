import React from 'react';
import { Box, TextField, Button } from '@mui/material';

interface LoginFormProps {
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  submitting: boolean;
  color: string;
  onSubmit: (e: React.FormEvent) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  email, setEmail, password, setPassword, submitting, color, onSubmit,
}) => (
  <Box component="form" onSubmit={onSubmit} sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
    <TextField
      type="email"
      name="email"
      placeholder="כתובת אימייל"
      autoComplete="email"
      value={email}
      onChange={e => setEmail(e.target.value)}
    />
    <TextField
      type="password"
      name="password"
      placeholder="סיסמה"
      autoComplete="current-password"
      value={password}
      onChange={e => setPassword(e.target.value)}
    />
    <Button
      type="submit"
      variant="contained"
      size="large"
      fullWidth
      disabled={submitting}
      sx={{ mt: 0.5, py: 1.4, fontSize: 16, bgcolor: color, "&:hover": { bgcolor: color, filter: "brightness(0.9)" } }}
    >
      {submitting ? "מתחבר…" : "התחברות"}
    </Button>
  </Box>
);

export default LoginForm;
