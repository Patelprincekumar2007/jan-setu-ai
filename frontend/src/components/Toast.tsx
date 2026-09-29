import React from 'react';

export interface ToastMessage {
  id: string;
  title: string;
  desc: string;
  type?: 'success' | 'info' | 'warning';
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  if (!toast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-200">
      <div className="px-4 py-3 rounded-lg bg-[#131b2e] text-[#ffffff] shadow-2xl flex items-center gap-3 border border-[#3f465c]/40 max-w-md">
        <span
          className="material-symbols-outlined text-[22px] text-[#89f5e7] shrink-0"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {toast.type === 'warning' ? 'warning' : 'check_circle'}
        </span>
        <div className="flex flex-col min-w-0 flex-1">
          <span className="font-semibold text-[13px] text-[#ffffff] leading-tight">
            {toast.title}
          </span>
          <span className="text-[12px] text-[#bec6e0] leading-snug mt-0.5">
            {toast.desc}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-[#bec6e0] hover:text-[#ffffff] p-1 rounded"
        >
          <span className="material-symbols-outlined text-[16px]">close</span>
        </button>
      </div>
    </div>
  );
};
