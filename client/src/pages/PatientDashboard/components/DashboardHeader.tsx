import React from "react";
import { Avatar, Box, Stack, Typography } from "@mui/material";

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "בוקר טוב";
  if (h < 18) return "צהריים טובים";
  return "ערב טוב";
}

interface DashboardHeaderProps {
  userName: string;
  userInitials: string;
  firstName: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  userName,
  userInitials,
  firstName,
}) => {
  return (
    <Box
      component="header"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1.5,
        px: { xs: 2, sm: 4 },
        minHeight: 68,
        borderBottom: "1px solid #e9ecef",
        bgcolor: "#fff",
        flexShrink: 0,
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="h6"
          noWrap
          sx={{ fontWeight: 700, color: "#1a1a2e", fontSize: { xs: 16, sm: 20 } }}
        >
          {getGreeting()}, {firstName} 👋
        </Typography>
        <Typography sx={{ fontSize: 13, color: "text.secondary" }} noWrap>
          זהו סיכום הבריאות שלך.
        </Typography>
      </Box>

      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", flexShrink: 0 }}>
        <Box sx={{ textAlign: "right", display: { xs: "none", sm: "block" } }}>
          <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#1a1a2e" }}>
            {userName}
          </Typography>
          <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
            דף המטופל
          </Typography>
        </Box>
        <Avatar
          sx={{
            bgcolor: "primary.main",
            width: 38,
            height: 38,
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          {userInitials}
        </Avatar>
      </Stack>
    </Box>
  );
};
