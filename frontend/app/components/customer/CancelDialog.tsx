import { useState } from "react";
import { useRouter } from "next/navigation";
import { customerApi } from "@/lib/customer-api";

interface CancelDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isCancelling: boolean;
}

export function CancelDialog({ isOpen, onClose, onConfirm, isCancelling }: CancelDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#1e1e2d] border border-[rgba(255,255,255,0.1)] rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <h3 className="text-xl font-bold text-white mb-2">Cancel Appointment</h3>
        <p className="text-[#94a3b8] text-sm mb-6">
          Are you sure you want to cancel this booking? This action cannot be undone.
        </p>
        
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isCancelling}
            className="px-4 py-2 text-sm font-medium text-[#94a3b8] hover:text-white transition-colors disabled:opacity-50"
          >
            Never mind
          </button>
          <button
            onClick={onConfirm}
            disabled={isCancelling}
            className="px-4 py-2 text-sm font-bold text-white bg-[rgba(239,68,68,0.2)] border border-[rgba(239,68,68,0.3)] rounded-lg hover:bg-[rgba(239,68,68,0.3)] transition-all flex items-center gap-2"
          >
            {isCancelling ? (
              <>
                <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                Cancelling...
              </>
            ) : (
              "Yes, Cancel It"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
