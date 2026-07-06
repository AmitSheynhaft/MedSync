import React from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { Box, Typography, Link } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import { RoleCard } from "./components/RoleCard";

export const RoleSelectPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isRegister = location.pathname.includes("register");
  const basePath = isRegister ? "/register" : "/login";
  const [showStaffOptions, setShowStaffOptions] = React.useState(false);

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
        {showStaffOptions
          ? "בחרו את סוג התפקיד בצוות הרפואי"
          : isRegister
            ? "בחרו את התפקיד שלכם להתחלה"
            : "בחרו כיצד ברצונכם להתחבר"}
      </Typography>

      <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", justifyContent: "center" }}>
        {showStaffOptions ? (
          <>
            <RoleCard
              title="מטפל"
              description="ניהול מטופלים, תיעוד ביקורים בסיוע בינה מלאכותית וייעול הפרקטיקה שלך."
              icon={<MedicalServicesIcon sx={{ fontSize: 28, color: "#fff" }} />}
              iconGradient="linear-gradient(135deg, #5f3dc4, #7950f2)"
              hoverColor="#7048e8"
              hoverShadow="0 12px 40px rgba(112,72,232,0.15)"
              onClick={() => navigate(`${basePath}/doctor`)}
            />
            <RoleCard
              title="מזכירות"
              description="תיאום תורים בין מטפלים למטופלים והעלאת מסמכים רפואיים."
              icon={<SupportAgentIcon sx={{ fontSize: 28, color: "#fff" }} />}
              iconGradient="linear-gradient(135deg, #1864ab, #339af0)"
              hoverColor="#1971c2"
              hoverShadow="0 12px 40px rgba(25,113,194,0.15)"
              onClick={() => navigate(`${basePath}/secretary`)}
            />
          </>
        ) : (
          <>
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
              title="צוות רפואי"
              description="מטפלים ומזכירות — ניהול מטופלים, תיאום תורים ותיעוד רפואי."
              icon={<LocalHospitalIcon sx={{ fontSize: 28, color: "#fff" }} />}
              iconGradient="linear-gradient(135deg, #5f3dc4, #7950f2)"
              hoverColor="#7048e8"
              hoverShadow="0 12px 40px rgba(112,72,232,0.15)"
              onClick={() => setShowStaffOptions(true)}
            />
          </>
        )}
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

      {showStaffOptions && (
        <Link
          component="button"
          type="button"
          onClick={() => setShowStaffOptions(false)}
          sx={{ mt: 4, fontSize: 14, color: "text.secondary", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
        >
          ← חזרה לבחירת תפקיד
        </Link>
      )}
    </Box>
  );
};

export default RoleSelectPage;
