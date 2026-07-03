import { useMemo } from "react";
import HomeIcon from "@mui/icons-material/Home";
import DescriptionIcon from "@mui/icons-material/Description";
import PersonIcon from "@mui/icons-material/Person";
import PeopleIcon from "@mui/icons-material/People";
import EventNoteIcon from "@mui/icons-material/EventNote";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import WavingHandIcon from "@mui/icons-material/WavingHand";
import type { RoleName } from "../../../api/auth";
import type { TGuideRole, IRoleGuide } from "../types";

const ROLE_GUIDES_CONFIG: Record<TGuideRole, IRoleGuide> = {
  patient: {
    color: "#0ca678",
    accent: "#e6f7f1",
    steps: [
      {
        icon: <WavingHandIcon />,
        title: "ברוך הבא ל-MedSync",
        description:
          "כל המידע הרפואי שלך במקום אחד, פשוט ובטוח. בוא נעבור יחד על המסכים העיקריים במערכת.",
        tip: "אפשר לחזור למדריך הזה בכל עת.",
      },
      {
        icon: <HomeIcon />,
        title: "לוח הבית",
        description:
          "מסך הבית מציג מבט מרוכז על מצבך הרפואי, הביקורים האחרונים והעדכונים החשובים.",
        tip: "מכאן מתחילים – זהו המסך הראשון שתראה בכל כניסה.",
      },
      {
        icon: <DescriptionIcon />,
        title: "מסמכים רפואיים",
        description:
          "במסך המסמכים תוכל להעלות מסמכים, לצפות בהם בכל עת ולשמור אותם מסודרים במקום אחד.",
        tip: "לחיצה על מסמך פותחת אותו יחד עם סיכום קצר וברור.",
      },
      {
        icon: <SmartToyIcon />,
        title: "סיכומי בינה מלאכותית",
        description:
          "כל מסמך רפואי מקבל סיכום אוטומטי בשפה פשוטה, כדי שתבין בקלות את המידע החשוב.",
        tip: "הסיכום נוצר אוטומטית – פשוט פתח מסמך כדי לראות אותו.",
      },
      {
        icon: <PersonIcon />,
        title: "הפרופיל שלי",
        description:
          "במסך הפרופיל תוכל לעדכן את הפרטים האישיים והרפואיים שלך בכל רגע.",
        tip: "מומלץ לוודא שהפרטים מעודכנים כדי לקבל שירות מיטבי.",
      },
    ],
  },
  doctor: {
    color: "#7048e8",
    accent: "#f3f0ff",
    steps: [
      {
        icon: <MedicalServicesIcon />,
        title: "ברוך הבא ל-MedSync",
        description:
          "כלי ניהול חכם למעקב אחר המטופלים שלך. בוא נעבור יחד על המסכים העיקריים במערכת.",
        tip: "אפשר לחזור למדריך הזה בכל עת.",
      },
      {
        icon: <PeopleIcon />,
        title: "ניהול מטופלים",
        description:
          "מסך המטופלים מציג את רשימת המטופלים שלך. לחיצה על מטופל פותחת את התיק הרפואי המלא שלו.",
        tip: "זהו מסך הבית שלך – ממנו מנווטים לכל השאר.",
      },
      {
        icon: <EventNoteIcon />,
        title: "ביקורים ותיעוד",
        description:
          "נהל ביקורים, תעד הערות והקלט שיחות ישירות מתוך המערכת, הכל שמור בתיק המטופל.",
        tip: "ההקלטה מתומללת ומסוכמת אוטומטית לאחר הביקור.",
      },
      {
        icon: <SmartToyIcon />,
        title: "סיכומים חכמים",
        description:
          "המערכת יוצרת סיכומים אוטומטיים של מסמכים וביקורים בעזרת בינה מלאכותית, לחיסכון בזמן.",
        tip: "הסיכומים זמינים ישירות מתוך תיק המטופל.",
      },
      {
        icon: <NotificationsActiveIcon />,
        title: "התראות קליניות",
        description:
          "קבל התראות אוטומטיות על ממצאים ומצבים הדורשים תשומת לב מיוחדת, כדי לא לפספס דבר.",
        tip: "ההתראות מופיעות בתיק המטופל הרלוונטי.",
      },
    ],
  },
};

export function useRoleGuide(role?: RoleName): IRoleGuide {
  return useMemo(() => (role === "doctor" ? ROLE_GUIDES_CONFIG.doctor : ROLE_GUIDES_CONFIG.patient), [role]);
}
