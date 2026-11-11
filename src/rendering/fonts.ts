export type FontFamilies = Record<string, string>;
export const fontOptions = [
  {
    id: "Georgia",
    label: "Classic serif",
    family: 'Georgia, "Times New Roman", serif',
  },
  {
    id: "Lora",
    label: "Lora · book serif",
    family: '"Card Lora", Georgia, serif',
  },
  {
    id: "GreatVibes",
    label: "Great Vibes · script",
    family: '"Card Great Vibes", cursive',
  },
  {
    id: "Arial",
    label: "Arial · clean sans",
    family: "Arial, Helvetica, sans-serif",
  },
  {
    id: "Trebuchet",
    label: "Trebuchet · soft sans",
    family: '"Trebuchet MS", Arial, sans-serif',
  },
  {
    id: "Times",
    label: "Times · traditional serif",
    family: '"Times New Roman", Times, serif',
  },
];
export function selectedFont(id: string | undefined, fallback: string) {
  return (
    fontOptions.find((font) => font.id === (id ?? fallback))?.family ?? fallback
  );
}
