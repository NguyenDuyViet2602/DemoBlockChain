// src/hooks/useConfirm.jsx
import { useState, useCallback } from 'react';
import ConfirmationDialog from '../components/ConfirmationDialog';

export const useConfirm = () => {
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    confirmText: 'Xác nhận',
    cancelText: 'Hủy',
    type: 'danger',
  });

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        title: options.title || 'Xác nhận',
        message: options.message,
        onConfirm: () => resolve(true),
        confirmText: options.confirmText || 'Xác nhận',
        cancelText: options.cancelText || 'Hủy',
        type: options.type || 'danger',
      });
    });
  }, []);

  const close = useCallback(() => {
    setConfirmState((prev) => ({
      ...prev,
      isOpen: false,
      onConfirm: () => {},
    }));
  }, []);

  const ConfirmDialog = () => (
    <ConfirmationDialog
      isOpen={confirmState.isOpen}
      onClose={close}
      onConfirm={confirmState.onConfirm || (() => {})}
      title={confirmState.title}
      message={confirmState.message}
      confirmText={confirmState.confirmText}
      cancelText={confirmState.cancelText}
      type={confirmState.type}
    />
  );

  return { confirm, ConfirmDialog };
};

