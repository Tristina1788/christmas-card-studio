import type { Template } from "../config/templates";
/** Explicit contain fitting preserves every source pixel when artwork is slightly off 5:7. */
export function artworkPlacement(
  template: Pick<Template, "width" | "height" | "backgroundFit">,
  image: { naturalWidth: number; naturalHeight: number },
) {
  if (template.backgroundFit !== "contain")
    return { x: 0, y: 0, width: template.width, height: template.height };
  const scale = Math.min(
    template.width / image.naturalWidth,
    template.height / image.naturalHeight,
  );
  const width = image.naturalWidth * scale,
    height = image.naturalHeight * scale;
  return {
    x: (template.width - width) / 2,
    y: (template.height - height) / 2,
    width,
    height,
  };
}
