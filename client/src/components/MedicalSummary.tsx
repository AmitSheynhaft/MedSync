import React, { useMemo } from 'react';
import { Box, Typography } from '@mui/material';

interface MedicalSummaryProps {
  text: string;
}

const KNOWN_HEADINGS = new Set([
  'מחלות כרוניות',
  'תרופות קבועות',
  'היסטוריה רפואית רלוונטית',
  'מה חשוב לדעת לפני ביקור',
  'סיכום מנהלים',
  'ממצאים תקינים',
  'ממצאים חריגים',
  'ממצאים חריגים (בעדיפות גבוהה)',
  'פריטי פעולה',
  'המלצות',
]);

const DEMOGRAPHIC_LABEL_RE =
  /^(?:שם(?:\s+מלא)?|תאריך\s*לידה|גיל|מין|כתובת|טלפון|אימייל|דוא"?ל|קופת\s*חולים|סוג\s*דם|מספר\s*זהות|ת"?ז|נישואין|מצב\s*משפחתי)\s*[:\-]/;

function stripLeadingDemographics(raw: string): string {
  const lines = raw.split('\n');
  let start = 0;
  while (start < lines.length) {
    const line = lines[start].trim();
    if (!line) {
      start++;
      continue;
    }
    if (KNOWN_HEADINGS.has(line)) break;
    if (DEMOGRAPHIC_LABEL_RE.test(line)) {
      start++;
      continue;
    }
    if (/תאריך\s*לידה\s*:/.test(line) || /קופת\s*חולים\s*:/.test(line)) {
      start++;
      continue;
    }
    break;
  }
  return lines.slice(start).join('\n').trim();
}

// Break up text that arrives as one long line with inline numbered markers.
function injectStructure(raw: string): string {
  return raw
    .replace(/\r\n/g, '\n')
    .replace(/[*_`#]+/g, '')
    .replace(/([^\n])\s+(\d{1,2}[.)])\s+/g, '$1\n\n$2 ')
    .replace(/([^\n])\s+([•·])\s+/g, '$1\n$2 ');
}

interface Item {
  marker?: string;
  label?: string;
  text: string;
}

type Block =
  | { kind: 'heading'; text: string }
  | { kind: 'items'; items: Item[] }
  | { kind: 'paragraph'; text: string };

const HEADING_KEYWORDS = [
  'סיכום',
  'ממצאים',
  'פריטי',
  'המלצות',
  'פעולה',
  'מחלות',
  'תרופות',
  'היסטוריה',
  'מה חשוב',
];

function splitLabel(content: string): { label?: string; text: string } {
  const colonIdx = content.indexOf(':');
  if (colonIdx > 0 && colonIdx < 30) {
    const label = content.slice(0, colonIdx).trim();
    const rest = content.slice(colonIdx + 1).trim();
    if (label.split(/\s+/).length <= 4) {
      return { label, text: rest };
    }
  }
  return { text: content };
}

function isLikelyHeading(content: string): boolean {
  const trimmed = content.trim();
  if (!trimmed) return false;
  const words = trimmed.split(/\s+/);
  if (words.length <= 6 && !/[.:،,؛]/.test(trimmed.slice(0, -1))) {
    return HEADING_KEYWORDS.some((k) => trimmed.startsWith(k));
  }
  return false;
}

function parseSummary(raw: string): Block[] {
  const cleaned = stripLeadingDemographics(injectStructure(raw));
  const lines = cleaned.split('\n').map((l) => l.trim());

  const blocks: Block[] = [];
  let items: Item[] = [];
  let paragraph: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push({ kind: 'paragraph', text: paragraph.join(' ') });
      paragraph = [];
    }
  };
  const flushItems = () => {
    if (items.length) {
      blocks.push({ kind: 'items', items });
      items = [];
    }
  };

  for (const line of lines) {
    if (!line) {
      flushParagraph();
      flushItems();
      continue;
    }

    if (KNOWN_HEADINGS.has(line)) {
      flushParagraph();
      flushItems();
      blocks.push({ kind: 'heading', text: line });
      continue;
    }

    const numbered = line.match(/^(\d{1,2})[.)\-]\s*(.+)$/);
    const bulleted = line.match(/^[-•·]\s*(.+)$/);
    if (numbered) {
      flushParagraph();
      const content = numbered[2].trim();
      if (isLikelyHeading(content)) {
        flushItems();
        blocks.push({ kind: 'heading', text: content });
      } else {
        const { label, text } = splitLabel(content);
        items.push({ marker: `${numbered[1]}.`, label, text });
      }
      continue;
    }
    if (bulleted) {
      flushParagraph();
      const { label, text } = splitLabel(bulleted[1].trim());
      items.push({ label, text });
      continue;
    }

    flushItems();
    paragraph.push(line);
  }
  flushParagraph();
  flushItems();

  return blocks;
}

const ItemView: React.FC<{ item: Item }> = ({ item }) => (
  <Box
    sx={{
      display: 'flex',
      gap: 1,
      alignItems: 'flex-start',
      fontSize: 14,
      color: '#495057',
      lineHeight: 1.7,
    }}
  >
    {item.marker && (
      <Typography
        component="span"
        sx={{ fontWeight: 700, color: '#3b5bdb', flexShrink: 0, minWidth: 22 }}
      >
        {item.marker}
      </Typography>
    )}
    <Typography component="span" sx={{ fontSize: 14, lineHeight: 1.7 }}>
      {item.label && (
        <Typography component="span" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
          {item.label}:{' '}
        </Typography>
      )}
      {item.text}
    </Typography>
  </Box>
);

export const MedicalSummary: React.FC<MedicalSummaryProps> = ({ text }) => {
  const blocks = useMemo(() => parseSummary(text), [text]);

  if (blocks.length === 0) {
    return (
      <Typography sx={{ fontSize: 14, color: '#495057', lineHeight: 1.7 }}>
        {text}
      </Typography>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
      {blocks.map((block, idx) => {
        if (block.kind === 'heading') {
          return (
            <Typography
              key={idx}
              sx={{
                fontSize: 14,
                fontWeight: 700,
                color: '#1a1a2e',
                mt: idx === 0 ? 0 : 1.25,
              }}
            >
              {block.text}
            </Typography>
          );
        }
        if (block.kind === 'items') {
          return (
            <Box key={idx} sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              {block.items.map((it, i) => (
                <ItemView key={i} item={it} />
              ))}
            </Box>
          );
        }
        return (
          <Typography
            key={idx}
            sx={{ fontSize: 14, color: '#495057', lineHeight: 1.7 }}
          >
            {block.text}
          </Typography>
        );
      })}
    </Box>
  );
};

export default MedicalSummary;
