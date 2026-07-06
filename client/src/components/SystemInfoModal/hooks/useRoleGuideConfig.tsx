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
import SearchIcon from "@mui/icons-material/Search";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import type { RoleName } from "../../../auth/types";
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
  secretary: {
    color: "#1c7ed6",
    accent: "#e7f5ff",
    steps: [
      {
        icon: <SupportAgentIcon />,
        title: "ברוכה הבאה ל-MedSync",
        description:
          "מרכז הניהול של המזכירות במרפאה. מכאן ניתן לקבוע תורים, לנהל אותם ולתחזק את מסמכי המטופלים.",
        tip: "אפשר לחזור למדריך הזה בכל עת מהתפריט העליון.",
      },
      {
        icon: <EventAvailableIcon />,
        title: "קביעת תורים",
        description:
          "שיבוץ תור חדש בין מטפל למטופל במרפאה שלך. המערכת מציגה את השעות הפנויות של המטפל בתאריך שבחרת.",
        tip: "התור נקבע בפסיקה של 30 דקות. אישור מוצג מיד לאחר השיבוץ.",
      },
      {
        icon: <SearchIcon />,
        title: "חיפוש חכם",
        description:
          "רשימות המטפלים והמטופלים מסוננות אוטומטית למרפאה שלך, כולל חיפוש חופשי ותוצאות טעונות בהדרגה.",
        tip: "ניתן לנקות את הבחירה בכל שלב ולחזור למצב ההתחלתי.",
      },
      {
        icon: <DescriptionIcon />,
        title: "העלאת מסמכים",
        description:
          "אפשר להעלות מסמכים עבור המטופל בכל עת — גם ללא שיבוץ תור פעיל. המסמכים מוצמדים אוטומטית לתיק המטופל.",
        tip: "בחירת מטופל מציגה את אזור ההעלאה מיד מתחת.",
      },
      {
        icon: <EventNoteIcon />,
        title: "צפייה וניהול תורים",
        description:
          "רשימת התורים הקרובים במרפאה נטענת אוטומטית ומתעדכנת אחרי כל שינוי, ללא צורך בריענון.",
      },
      {
        icon: <DeleteOutlineIcon />,
        title: "מחיקת תורים",
        description:
          "ניתן למחוק תור בלחיצה על סמל הפח. תופיע חלונית אישור לפני הביצוע כדי למנוע טעויות.",
        tip: "רק תורים במרפאה שלך ניתנים למחיקה.",
      },
    ],
  },
};

export function useRoleGuide(role?: RoleName): IRoleGuide {
  return useMemo(() => {
    if (role === "doctor") return ROLE_GUIDES_CONFIG.doctor;
    if (role === "secretary") return ROLE_GUIDES_CONFIG.secretary;
    return ROLE_GUIDES_CONFIG.patient;
  }, [role]);
}
