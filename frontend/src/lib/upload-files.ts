export const MAX_SOURCE_IMAGE_SIZE_MB = 10;
export const MAX_PDF_SIZE_MB = 4;

const MB = 1024 * 1024;
const MAX_SOURCE_IMAGE_SIZE = MAX_SOURCE_IMAGE_SIZE_MB * MB;
const MAX_PDF_SIZE = MAX_PDF_SIZE_MB * MB;
const TARGET_UPLOAD_SIZE = 3.5 * MB;
const ALLOWED_TYPES = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp"]);

const canvasBlob = (canvas: HTMLCanvasElement, quality: number) => new Promise<Blob>((resolve, reject) => {
  canvas.toBlob(
    (blob) => blob ? resolve(blob) : reject(new Error("The image could not be optimized.")),
    "image/jpeg",
    quality,
  );
});

export async function prepareUploadFile(file: File): Promise<File> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error(`${file.name} is not a supported PDF or image file.`);
  }

  if (file.type === "application/pdf") {
    if (file.size > MAX_PDF_SIZE) throw new Error(`${file.name} exceeds the ${MAX_PDF_SIZE_MB} MB PDF limit.`);
    return file;
  }

  if (file.size > MAX_SOURCE_IMAGE_SIZE) {
    throw new Error(`${file.name} exceeds the ${MAX_SOURCE_IMAGE_SIZE_MB} MB image limit.`);
  }
  if (file.size <= TARGET_UPLOAD_SIZE) return file;

  const bitmap = await createImageBitmap(file);
  try {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Your browser cannot optimize this image.");

    let scale = Math.min(1, 2400 / Math.max(bitmap.width, bitmap.height));
    let blob = file as Blob;

    for (let resize = 0; resize < 4 && blob.size > TARGET_UPLOAD_SIZE; resize += 1) {
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

      for (const quality of [0.9, 0.8, 0.7, 0.6, 0.5]) {
        blob = await canvasBlob(canvas, quality);
        if (blob.size <= TARGET_UPLOAD_SIZE) break;
      }
      scale *= 0.78;
    }

    if (blob.size > TARGET_UPLOAD_SIZE) throw new Error(`${file.name} could not be reduced to a deployment-safe size.`);
    const baseName = file.name.replace(/\.[^.]+$/, "") || "document";
    return new File([blob], `${baseName}.jpg`, { type: "image/jpeg", lastModified: file.lastModified });
  } finally {
    bitmap.close();
  }
}

export async function prepareUploadFiles(files: File[]) {
  const prepared: File[] = [];
  for (const file of files) prepared.push(await prepareUploadFile(file));
  return prepared;
}
