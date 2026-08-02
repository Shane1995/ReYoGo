export const LOADING_COPY: Record<
  'processing' | 'scanning',
  { title: string; description: string }
> = {
  processing: {
    title: 'Enhancing your photo…',
    description: 'Sharpening contrast and resizing before sending it to Claude.',
  },
  scanning: {
    title: 'Reading your invoice…',
    description:
      'Claude is extracting the supplier, date, and line items. This usually takes a few seconds.',
  },
};
