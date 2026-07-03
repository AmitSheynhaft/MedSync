import React from "react";
import { Avatar, Box, Paper, Stack, Typography } from "@mui/material";
import PhoneIcon from "@mui/icons-material/Phone";
import { useNavigate } from "react-router-dom";
import { Encounter } from "../../../api/patients";

interface VisitsListProps {
  visits: Encounter[];
  patientId: string | undefined;
}

function ChevronLeft() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#adb5bd"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0 }}
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function VisitRow({
  visit,
  patientId,
}: {
  visit: Encounter;
  patientId: string | undefined;
}) {
  const navigate = useNavigate();
  return (
    <Stack
      direction="row"
      spacing={2}
      onClick={() =>
        patientId && navigate(`/patients/${patientId}/visits/${visit.id}`)
      }
      sx={{
        p: 1.5,
        borderRadius: 2,
        bgcolor: "#f8f9fa",
        cursor: "pointer",
        alignItems: "center",
        "&:hover": { bgcolor: "#f1f3f5" },
      }}
    >
      <Avatar
        sx={{ bgcolor: "#d3f9d8", color: "#2f9e44", width: 42, height: 42 }}
      >
        <PhoneIcon fontSize="small" />
      </Avatar>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
          {visit.doctor} ({visit.specialty})
        </Typography>
        <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
          {visit.date} • {visit.type}
        </Typography>
        {visit.note && (
          <Typography
            sx={{
              fontSize: 12,
              color: "#495057",
              mt: 0.5,
              fontStyle: "italic",
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            "{visit.note}"
          </Typography>
        )}
      </Box>

      <Box sx={{ color: '#adb5bd', flexShrink: 0, display: 'flex' }}>
        <ChevronLeft />
      </Box>
    </Stack>
  );
}

export const VisitsList: React.FC<VisitsListProps> = ({
  visits,
  patientId,
}) => {
  return (
    <Paper
      elevation={0}
      sx={{ p: 3, borderRadius: 3, border: "1px solid #e9ecef" }}
    >
      <Typography sx={{ fontWeight: 700, fontSize: 14, mb: 2 }}>
        ביקורים אחרונים
      </Typography>
      {visits.length === 0 ? (
        <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
          לא נרשמו ביקורים עדיין.
        </Typography>
      ) : (
        <Stack spacing={1.5}>
          {visits.map((visit) => (
            <VisitRow key={visit.id} visit={visit} patientId={patientId} />
          ))}
        </Stack>
      )}
    </Paper>
  );
};
