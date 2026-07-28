import { useCallback, useEffect, useState } from 'react';
import { ACCEPTED_MIME_TYPES, MAX_UPLOAD_SIZE_BYTES } from '../constants';
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
    (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setSelectedFile(null);
        setPreviewUrl(null);
        setStatus('error');
        setErrorMessage(validationError);
        return;
      }

      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setStatus('preview');
      setErrorMessage('');
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
