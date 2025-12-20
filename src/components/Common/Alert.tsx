import { useEffect } from 'react';

interface AlertProps {
  type: 'success' | 'error' | 'info';
  message: string;
  onClose: () => void;
}

export default function Alert({ type, message, onClose }: AlertProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = {
    success: 'bg-green-100 border-green-400 text-green-700',
    error: 'bg-red-100 border-red-400 text-red-700',
    info: 'bg-blue-100 border-blue-400 text-blue-700',
  }[type];

  return (
    <div className={`fixed top-5 right-5 z-50 min-w-[300px] px-4 py-3 rounded border ${bgColor} shadow-lg animate-slide-in`}>
      <div className="flex justify-between items-center">
        <span>{message}</span>
        <button onClick={onClose} className="ml-4 text-xl font-bold hover:opacity-70">
          ×
        </button>
      </div>
    </div>
  );
}