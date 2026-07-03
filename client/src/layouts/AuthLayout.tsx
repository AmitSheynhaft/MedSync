import React from 'react';
import { Outlet, useParams } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import SecurityIcon from "@mui/icons-material/Security";
import FavoriteIcon from "@mui/icons-material/Favorite";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";

const themes = {
  patient: {
    gradient: "linear-gradient(135deg, #087f5b 0%, #0ca678 50%, #38d9a9 100%)",
    title: "הבריאות שלך,\nבידיים שלך.",
    subtitle:
      "עקוב אחר ההיסטוריה הרפואית שלך, גש למסמכים והישאר מחובר לצוות הטיפול שלך — הכל במקום אחד.",
    badge: {
      icon: <FavoriteIcon />,
      title: "ממוקד מטופל",
      desc: "מתוכנן עבור מסע הבריאות שלך",
    },
  },
  therapist: {
    gradient: "linear-gradient(135deg, #5f3dc4 0%, #7048e8 50%, #9775fa 100%)",
    title: "הפרקטיקה שלך,\nמיועלת.",
    subtitle:
      "נהל מטופלים, תעד ביקורים עם סיכומים מבוססי בינה מלאכותית, והתמקד במה שחשוב — הטיפול.",
    badge: {
      icon: <MedicalServicesIcon />,
      title: "בנוי לקלינאים",
      desc: "תיעוד בסיוע בינה מלאכותית",
    },
  },
  default: {
    gradient: "linear-gradient(135deg, #3b5bdb 0%, #5c7cfa 100%)",
    title: "ההיסטוריה הרפואית שלך,\nמאוחדת.",
    subtitle:
      "התחבר לרופאים שלך, נהל מסמכים וקבל תובנות בריאות מבוססות בינה מלאכותית.",
    badge: {
      icon: <SecurityIcon />,
      title: "מאובטח ופרטי",
      desc: "הצפנה תואמת HIPAA",
    },
  },
};

export const AuthLayout: React.FC = () => {
  const { role } = useParams<{ role: string }>();
  const theme = themes[role as keyof typeof themes] || themes.default;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        minHeight: "100vh",
      }}
    >
      <Box
        sx={{
          flex: { xs: "none", md: "0 0 46%" },
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          px: { xs: 3, sm: 5, md: 7 },
          py: { xs: 4, md: 6 },
          background: theme.gradient,
          color: "#fff",
          transition: "background 0.4s ease",
        }}
      >
        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: "14px",
            mb: { xs: 2.5, md: 5 },
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 26,
            fontWeight: 800,
            background: "rgba(255,255,255,0.18)",
          }}
        >
          M
        </Box>

        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            lineHeight: 1.2,
            mb: 1.5,
            fontSize: { xs: 26, md: 34 },
            whiteSpace: "pre-line",
          }}
        >
          {theme.title}
        </Typography>
        <Typography
          sx={{
            fontSize: { xs: 14, md: 16 },
            lineHeight: 1.6,
            mb: { xs: 3, md: 5 },
            maxWidth: 320,
            color: "rgba(255,255,255,0.82)",
          }}
        >
          {theme.subtitle}
        </Typography>

        <Box
          sx={{
            display: { xs: "none", sm: "flex" },
            alignItems: "center",
            gap: 2,
            px: 2.5,
            py: 2,
            borderRadius: "14px",
            background: "rgba(255,255,255,0.12)",
          }}
        >
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              background: "rgba(255,255,255,0.15)",
            }}
          >
            {theme.badge.icon}
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: 15 }}>
              {theme.badge.title}
            </Typography>
            <Typography sx={{ fontSize: 12, color: "rgba(255,255,255,0.75)" }}>
              {theme.badge.desc}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#fff",
          p: { xs: 2, sm: 4 },
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default AuthLayout;
