// Canvas PNGs default to 96 dpi. Add a standards-compliant pHYs chunk for 300 ppi.
function crc32(bytes: Uint8Array) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ 0xffffffff) >>> 0;
}
export async function pngBlob(canvas: HTMLCanvasElement) {
  const original = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (b) =>
        b
          ? resolve(b)
          : reject(new Error("PNG generation failed. Please try again.")),
      "image/png",
    ),
  );
  const bytes = new Uint8Array(await original.arrayBuffer());
  const chunk = new Uint8Array(21),
    view = new DataView(chunk.buffer);
  view.setUint32(0, 9);
  chunk.set([112, 72, 89, 115], 4);
  view.setUint32(8, 11811);
  view.setUint32(12, 11811);
  chunk[16] = 1;
  view.setUint32(17, crc32(chunk.subarray(4, 17)));
  const parts: BlobPart[] = [bytes.slice(0, 33), chunk];
  let pos = 33;
  while (pos < bytes.length) {
    const size =
      new DataView(bytes.buffer, bytes.byteOffset + pos, 4).getUint32(0) + 12;
    if (String.fromCharCode(...bytes.subarray(pos + 4, pos + 8)) !== "pHYs")
      parts.push(bytes.slice(pos, pos + size));
    pos += size;
  }
  return new Blob(parts, { type: "image/png" });
}
export function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob),
    anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
