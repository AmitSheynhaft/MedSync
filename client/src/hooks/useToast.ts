import { useState, useCallback } from 'react';

export type TToastSeverity = 'success' | 'error' | 'warning' | 'info';

export type TToastState = {
  severity: TToastSeverity;
  message: string;
};

export type ToastState = TToastState;

export const useToast = () => {
  const [toast, setToast] = useState<TToastState | null>(null);

  const showToast = useCallback((severity: TToastSeverity, message: string) => {
    setToast({ severity, message });
  }, []);

  const clearToast = useCallback(() => setToast(null), []);

  return { toast, setToast, showToast, clearToast };
};
