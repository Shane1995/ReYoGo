import { useCallback, useEffect, useState } from 'react';
import { enhanceScanImage } from '../../../utils/enhanceScanImage';
import {
  ACCEPTED_MIME_TYPES,
  MAX_UPLOAD_SIZE_BYTES,
  PREPROCESSABLE_MIME_TYPES,
} from '../constants';
import type { ScanStatus } from '../types';

function validateFile(file: File): string | null {
  if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
    return 'Unsupported file type — please upload a JPG, PNG, or PDF.';
  }
  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    return `File exceeds the ${Math.round(MAX_UPLOAD_SIZE_BYTES / (1024 * 1024))}MB size limit.`;
  }
  return null;
}

export function useScanFileSelection() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<ScanStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Revokes the *previous* preview URL whenever it changes or the hook unmounts.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const discardSelection = useCallback(() => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setStatus('idle');
    setErrorMessage('');
  }, []);

  const handleFileSelected = useCallback(
    async (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setSelectedFile(null);
        setPreviewUrl(null);
        setStatus('error');
        setErrorMessage(validationError);
        return;
      }

      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setErrorMessage('');

      if (!PREPROCESSABLE_MIME_TYPES.includes(file.type)) {
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setStatus('preview');
        return;
      }

      setStatus('processing');
      const enhanced = await enhanceScanImage(file).catch(() => file);
      setSelectedFile(enhanced);
      setPreviewUrl(URL.createObjectURL(enhanced));
      setStatus('preview');
    },
    [previewUrl],
  );

  return {
    selectedFile,
    setSelectedFile,
    previewUrl,
    setPreviewUrl,
    status,
    setStatus,
    errorMessage,
    setErrorMessage,
    discardSelection,
    handleFileSelected,
  };
}
