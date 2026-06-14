import type { SubmitMessages } from './types';

export const SAVE_MESSAGES: SubmitMessages = {
  success: 'Invoice posted',
  failure: 'Failed to save invoice',
};

export const DRAFT_MESSAGES: SubmitMessages = {
  success: 'Draft saved',
  failure: 'Failed to save draft',
};
