// Returns true if the color is dark (for white text), false if light (for black text)
export function isColorDark(hex: string): boolean {
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 128;
}
const SUBJECT_COLORS = [
  "#F2FCE2",
  "#FEF7CD",
  "#FEC6A1",
  "#E5DEFF",
  "#FFDEE2",
  "#FDE1D3",
  "#D3E4FD",
  "#F1F0FB",
  "#E0F2F1",
  "#EDE7F6",
  "#FFF3E0",
  "#E8F5E9",
  "#F3E5F5",
  "#E1F5FE",
  "#FFF8E1"
];

const subjectColorMap = new Map<string, string>();

export const getSubjectColor = (subject: any) => {
  const subjectId = typeof subject === 'string' ? subject : subject?.id || subject?.name;
  if (!subjectId) return '#FFFFFF';
  if (!subjectColorMap.has(subjectId)) {
    const idx = subjectColorMap.size % SUBJECT_COLORS.length;
    subjectColorMap.set(subjectId, SUBJECT_COLORS[idx]);
  }
  return subjectColorMap.get(subjectId) as string;
};

export const SUBJECT_COLORS_PALETTE = SUBJECT_COLORS;

export default SUBJECT_COLORS;
