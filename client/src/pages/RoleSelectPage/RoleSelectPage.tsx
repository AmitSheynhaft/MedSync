import React from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import { RoleCard } from "./components/RoleCard";

export const RoleSelectPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isRegister = location.pathname.includes("register");
  const basePath = isRegister ? "/register" : "/login";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
        p: 3,
      }}
    >
      <Box
        sx={{
          width: 52,
          height: 52,
          borderRadius: "14px",
          mb: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 26,
          fontWeight: 800,
          background: "linear-gradient(135deg, #3b5bdb, #5c7cfa)",
          color: "#fff",
        }}
      >
        M
      </Box>
      <Typography variant="h4" sx={{ fontWeight: 800, color: "#1a1a2e", mb: 0.5, textAlign: "center" }}>
        {isRegister ? "יצירת חשבון" : "ברוכים הבאים ל-MedSync"}
      </Typography>
      <Typography sx={{ fontSize: 16, color: "text.secondary", mb: 5, textAlign: "center" }}>
        {isRegister ? "בחרו את התפקיד שלכם להתחלה" : "בחרו כיצד ברצונכם להתחבר"}
      </Typography>

      <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", justifyContent: "center" }}>
        <RoleCard
          title="מטופל"
          description="גישה לרשומות הרפואיות שלך, ניהול פגישות ותקשורת עם צוות הטיפול שלך."
          icon={<PersonIcon sx={{ fontSize: 28, color: "#fff" }} />}
          iconGradient="linear-gradient(135deg, #0ca678, #38d9a9)"
          hoverColor="#0ca678"
          hoverShadow="0 12px 40px rgba(12,166,120,0.15)"
          onClick={() => navigate(`${basePath}/patient`)}
        />
        <RoleCard
          title="רופא"
          description="ניהול מטופלים, תיעוד ביקורים בסיוע בינה מלאכותית ייעול הפרקטיקה שלך."
          icon={<LocalHospitalIcon sx={{ fontSize: 28, color: "#fff" }} />}
          iconGradient="linear-gradient(135deg, #5f3dc4, #7950f2)"
          hoverColor="#7048e8"
          hoverShadow="0 12px 40px rgba(112,72,232,0.15)"
          onClick={() => navigate(`${basePath}/doctor`)}
        />
        {!isRegister && (
          <RoleCard
            title="מנהל מערכת"
            description="ניהול משתמשים, מרפאות והגדרות המערכת."
            icon={<AdminPanelSettingsIcon sx={{ fontSize: 28, color: "#fff" }} />}
            iconGradient="linear-gradient(135deg, #c92a2a, #ff6b6b)"
            hoverColor="#e03131"
            hoverShadow="0 12px 40px rgba(224,49,49,0.15)"
            onClick={() => navigate(`${basePath}/admin`)}
          />
        )}
      </Box>
    </Box>
  );
};

export default RoleSelectPage;
