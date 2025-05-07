import { ReactNode } from 'react';
import clsx from 'clsx';
import { RoundedButton, TransparentButton } from './Button';

interface ModalProps {
  headerIcon?: ReactNode;
  title?: string;
  content?: ReactNode;
  isOpen: boolean;
  onClose?: () => void;
  onOK?: () => void;
  isLoading?: boolean;
  hideCloseButton?: boolean;
  hideOKButton?: boolean;
  disableOutsideClick?: boolean;
  className?: string;
  children?: ReactNode;
  extraButtons?: ReactNode;
  okBtnLabel?: string;
  okBtnIcon?: ReactNode;
  cancelBtnLabel?: string;
  cancelBtnIcon?: ReactNode;
  modalSize?: string;
  zIndex?: number;
}

const Modal: React.FC<ModalProps> = ({
  headerIcon,
  title,
  content,
  isOpen,
  onClose,
  onOK,
  isLoading = false,
  hideCloseButton = false,
  hideOKButton = false,
  disableOutsideClick = false,
  className,
  children,
  extraButtons,
  okBtnLabel = 'OK',
  okBtnIcon,
  cancelBtnLabel = 'Cancel',
  cancelBtnIcon,
  modalSize = 'max-w-md',
  zIndex = 50,
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !disableOutsideClick && onClose) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-gray-950/70"
      onClick={handleBackdropClick}
      style={{ zIndex }}
    >
      <div
        className={clsx(
          'bg-gray-900 border border-white/20 rounded-lg p-6 w-full max-h-[90vh] overflow-auto',
          modalSize,
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-4 mb-4">
          {headerIcon}
          {title && <h2 className="text-2xl font-bold">{title}</h2>}
        </div>

        <div className="mb-6">
          {content || children}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          {extraButtons}

          {!hideCloseButton && (
            <TransparentButton onClick={onClose}>
              {cancelBtnIcon}
              {cancelBtnLabel}
            </TransparentButton>
          )}

          {!hideOKButton && (
            <RoundedButton
              onClick={onOK}
              disabled={isLoading}
              className={clsx(isLoading && 'opacity-70 cursor-not-allowed')}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading...
                </span>
              ) : (
                <>
                  {okBtnIcon}
                  {okBtnLabel}
                </>
              )}
            </RoundedButton>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
