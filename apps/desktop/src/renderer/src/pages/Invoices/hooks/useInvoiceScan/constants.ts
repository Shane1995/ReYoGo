import type { HeaderReview } from './types';

export const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;
export const ACCEPTED_MIME_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
export const ACCEPT_ATTR = '.jpg,.jpeg,.png,.pdf';

export const NO_HEADER_REVIEW: HeaderReview = {
  supplier: false,
  date: false,
  invoiceNumber: false,
};
