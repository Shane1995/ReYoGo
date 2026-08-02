import {
  ENHANCED_MIME_TYPE,
  JPEG_QUALITY,
  LUMINANCE_CLIP_HIGH,
  LUMINANCE_CLIP_LOW,
} from './constants';
import { resolveResizeDimensions } from './utils/resolveResizeDimensions';
import { stretchLuminanceContrast } from './utils/stretchLuminanceContrast';

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to decode the selected image.'));
    };
    image.src = objectUrl;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to encode the enhanced image.'));
          return;
        }
        resolve(blob);
      },
      ENHANCED_MIME_TYPE,
      JPEG_QUALITY,
    );
  });
}

function enhancedFileName(originalName: string): string {
  return `${originalName.replace(/\.[^.]+$/, '')}.jpg`;
}

export async function enhanceScanImage(file: File): Promise<File> {
  const image = await loadImage(file);
  const { width, height } = resolveResizeDimensions({
    width: image.naturalWidth,
    height: image.naturalHeight,
  });

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Canvas 2D context is unavailable.');
  }

  context.drawImage(image, 0, 0, width, height);

  const imageData = context.getImageData(0, 0, width, height);
  const stretched = stretchLuminanceContrast(
    imageData.data,
    LUMINANCE_CLIP_LOW,
    LUMINANCE_CLIP_HIGH,
  );
  imageData.data.set(stretched);
  context.putImageData(imageData, 0, 0);

  const blob = await canvasToBlob(canvas);
  return new File([blob], enhancedFileName(file.name), { type: ENHANCED_MIME_TYPE });
}
