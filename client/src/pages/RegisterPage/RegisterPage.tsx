import React from "react";
import { Link, useParams } from "react-router-dom";
import { Box, Typography, Chip, Alert, Stepper, Step, StepLabel } from "@mui/material";
import { resolveRegisterRole, STEPS } from "./roleConfig";
import { useRegisterForm } from "./hooks/useRegisterForm";
import { RegisterForm } from "./components/RegisterForm";

export const RegisterPage: React.FC = () => {
  const { role } = useParams<{ role: string }>();
  const config = resolveRegisterRole(role);
  const isTherapist = role === "therapist";
  const form = useRegisterForm(isTherapist);

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

      <Stepper
        activeStep={form.step}
        alternativeLabel
        dir="rtl"
        sx={{
          mb: 3,
          "& .MuiStepIcon-root.Mui-active": { color: config.color },
          "& .MuiStepIcon-root.Mui-completed": { color: config.color },
          "& .MuiStepLabel-label": { fontSize: 13, mt: 0.5 },
          "& .MuiStepLabel-label.Mui-active": { fontWeight: 700, color: "#1a1a2e" },
        }}
      >
        {STEPS.map(label => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {form.error && <Alert severity="error" sx={{ mb: 2 }}>{form.error}</Alert>}

      <RegisterForm form={form} isTherapist={isTherapist} color={config.color} />

      <Typography sx={{ textAlign: "center", mt: 2, fontSize: 14, color: "text.secondary" }}>
        כבר יש לך חשבון?{" "}
        <Typography component={Link} to={`/login/${role}`}
          sx={{ color: config.color, fontWeight: 600, textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>
          התחברות
        </Typography>
      </Typography>

      <Typography sx={{ textAlign: "center", mt: 1.5, fontSize: 13, color: "text.secondary" }}>
        <Typography component={Link} to="/register"
          sx={{ color: "text.secondary", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>
          ← החלף תפקיד
        </Typography>
      </Typography>
    </Box>
  );
};

export default RegisterPage;
