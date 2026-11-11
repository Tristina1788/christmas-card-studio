import type { Template } from "../config/templates";
export interface Artwork {
  background: HTMLImageElement;
  foreground?: HTMLImageElement;
  lowResolution: boolean;
}
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () =>
      reject(
        new Error(
          "This design’s original image could not load. Please choose another design or contact the studio.",
        ),
      );
    img.src = src;
  });
}
export async function loadArtwork(template: Template): Promise<Artwork> {
  const [background, foreground] = await Promise.all([
    loadImage(template.background),
    template.foreground
      ? loadImage(template.foreground)
      : Promise.resolve(undefined),
  ]);
  // A different aspect ratio cannot be stretched without altering the artwork.
  for (const img of [background, foreground].filter(
    (i): i is HTMLImageElement => !!i,
  )) {
    if (Math.abs(img.naturalWidth / img.naturalHeight - 5 / 7) > 0.002)
      throw new Error(
        "This artwork has a different aspect ratio. It needs studio review before editing.",
      );
  }
  return {
    background,
    foreground,
    lowResolution: [background, foreground].some(
      (i) => !!i && (i.naturalWidth < 1500 || i.naturalHeight < 2100),
    ),
  };
}
export async function decodePhoto(file: File): Promise<ImageBitmap> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
    throw new Error(
      "Choose a JPEG, PNG, or WebP photo. HEIC photos can be converted to JPEG on your phone.",
    );
  if (file.size > 25 * 1024 * 1024)
    throw new Error("This photo is larger than 25 MB. Choose a smaller copy.");
  try {
    const bitmap = await createImageBitmap(file, {
      imageOrientation: "from-image",
    });
    if (bitmap.width * bitmap.height > 80_000_000) {
      bitmap.close();
      throw new Error("too-large");
    }
    return bitmap;
  } catch (error) {
    if (error instanceof Error && error.message === "too-large")
      throw new Error("Choose a photo smaller than 80 megapixels.");
    throw new Error(
      "We couldn’t read this photo. Try opening it on your device and saving a new JPEG or PNG copy.",
    );
  }
}
