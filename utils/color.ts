const YIQ_TEXT_DARK = "#212529";
const YIQ_TEXT_LIGHT = "#ffffff";
const YIQ_CONTRASTED_THRESHOLD = 150;

export function colorYIQ(
  color: string,
  dark = YIQ_TEXT_DARK,
  light = YIQ_TEXT_LIGHT
): string {
  const [r, g, b] = color
    .slice(1)
    .match(/.{2}/g)
    .map((hex) => parseInt(hex, 16));

  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= YIQ_CONTRASTED_THRESHOLD ? dark : light;
}
