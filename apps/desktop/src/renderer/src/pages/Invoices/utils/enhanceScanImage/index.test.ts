import { describe, it, expect, vi, afterEach } from 'vitest';
import { enhanceScanImage } from './index';

type FakeContext2D = {
  drawImage: (image: CanvasImageSource, dx: number, dy: number, dw: number, dh: number) => void;
  getImageData: (sx: number, sy: number, sw: number, sh: number) => ImageData;
  putImageData: (imageData: ImageData, dx: number, dy: number) => void;
};

function makeFile(name = 'invoice.png', type = 'image/png') {
  return new File([new Uint8Array([1, 2, 3])], name, { type });
}

function stubImageLoad(naturalWidth: number, naturalHeight: number): () => void {
  const originalSrcDescriptor = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
  const originalWidthDescriptor = Object.getOwnPropertyDescriptor(
    HTMLImageElement.prototype,
    'naturalWidth',
  );
  const originalHeightDescriptor = Object.getOwnPropertyDescriptor(
    HTMLImageElement.prototype,
    'naturalHeight',
  );

  Object.defineProperty(HTMLImageElement.prototype, 'naturalWidth', {
    configurable: true,
    get: () => naturalWidth,
  });
  Object.defineProperty(HTMLImageElement.prototype, 'naturalHeight', {
    configurable: true,
    get: () => naturalHeight,
  });
  Object.defineProperty(HTMLImageElement.prototype, 'src', {
    configurable: true,
    set(this: HTMLImageElement) {
      queueMicrotask(() => this.onload?.(new Event('load')));
    },
  });

  return () => {
    if (originalSrcDescriptor) {
      Object.defineProperty(HTMLImageElement.prototype, 'src', originalSrcDescriptor);
    }
    if (originalWidthDescriptor) {
      Object.defineProperty(HTMLImageElement.prototype, 'naturalWidth', originalWidthDescriptor);
    }
    if (originalHeightDescriptor) {
      Object.defineProperty(HTMLImageElement.prototype, 'naturalHeight', originalHeightDescriptor);
    }
  };
}

function stubCanvas(fakeContext: FakeContext2D | null) {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
    () => fakeContext as unknown as CanvasRenderingContext2D,
  );
  vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((callback) => {
    callback(new Blob(['enhanced'], { type: 'image/jpeg' }));
  });
}

describe('enhanceScanImage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('produces an enhanced JPEG file resized via resolveResizeDimensions', async () => {
    const restoreImage = stubImageLoad(300, 150);
    const pixelData = new Uint8ClampedArray(1568 * 784 * 4).fill(128);
    const drawImage = vi.fn();
    const getImageData = vi.fn(
      (): ImageData => ({
        data: pixelData,
        width: 1568,
        height: 784,
        colorSpace: 'srgb',
      }),
    );
    const putImageData = vi.fn();
    stubCanvas({ drawImage, getImageData, putImageData });

    const result = await enhanceScanImage(makeFile('invoice.png', 'image/png'));

    expect(result.type).toBe('image/jpeg');
    expect(result.name).toBe('invoice.jpg');
    expect(drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, 1568, 784);
    expect(getImageData).toHaveBeenCalledWith(0, 0, 1568, 784);
    expect(putImageData).toHaveBeenCalled();

    restoreImage();
  });

  it('rejects when a 2D canvas context is unavailable', async () => {
    const restoreImage = stubImageLoad(300, 150);
    stubCanvas(null);

    await expect(enhanceScanImage(makeFile())).rejects.toThrow('Canvas 2D context is unavailable.');

    restoreImage();
  });
});
