import React from "react";
import { Link, useParams } from "react-router-dom";
import { Box, Typography, Chip, Alert } from "@mui/material";
import { resolveLoginRole } from "./roleConfig";
import { useLoginForm } from "./hooks/useLoginForm";
import { LoginForm } from "./components/LoginForm";

export const LoginPage: React.FC = () => {
  const { role } = useParams<{ role: string }>();
  const config = resolveLoginRole(role);
  const { email, setEmail, password, setPassword, submitting, error, handleSubmit } = useLoginForm(role);

  return (
    <Box sx={{ width: "100%", maxWidth: 420, p: { xs: 1, sm: 4 } }}>
      <Box sx={{ display: "flex", justifyContent: "flex-start", mb: 3 }}>
        <Chip
          icon={config.icon}
          label={config.label}
          size="small"
          sx={{
            fontWeight: 600,
            bgcolor: `${config.color}14`,
            color: config.color,
            border: `1px solid ${config.color}30`,
            "& .MuiChip-icon": { color: config.color },
          }}
        />
      </Box>

      <Typography
        variant="h5"
        sx={{ fontWeight: 700, color: "#1a1a2e", mb: 0.5, width: "100%" }}
      >
        {config.heading}
      </Typography>
      <Typography sx={{ fontSize: 14, color: "text.secondary", mb: 2.5, width: "100%" }}>
        {config.subtitle}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <LoginForm
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        submitting={submitting}
        color={config.color}
        onSubmit={handleSubmit}
      />

      <Typography sx={{ textAlign: "center", mt: 2, fontSize: 14, color: "text.secondary" }}>
        אין לך חשבון?{" "}
        <Typography
          component={Link}
          to={`/register/${role}`}
          sx={{ color: config.color, fontWeight: 600, textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
        >
          הרשמה
        </Typography>
      </Typography>

      <Typography sx={{ textAlign: "center", mt: 1.5, fontSize: 13, color: "text.secondary" }}>
        <Typography
          component={Link}
          to="/login"
          sx={{ color: "text.secondary", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
        >
          החלף תפקיד ↩
        </Typography>
      </Typography>
    </Box>
  );
};

export default LoginPage;
