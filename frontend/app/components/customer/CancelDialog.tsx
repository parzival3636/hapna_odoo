import { Loader2, AlertCircle } from "lucide-react";

interface CancelDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isCancelling: boolean;
}

export function CancelDialog({ isOpen, onClose, onConfirm, isCancelling }: CancelDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
      <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 lg:p-12 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-300">
        <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mb-8 shadow-sm">
          <AlertCircle className="w-8 h-8" />
        </div>
        
        <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em] mb-3">Critical Intervention</p>
        <h3 className="text-2xl font-heading font-black text-slate-900 mb-4 tracking-tight">Abort Appointment?</h3>
        <p className="text-slate-500 font-medium text-sm mb-10 leading-relaxed">
          You are about to permanently disconnect this session from the registry. This operation cannot be reversed.
        </p>
        
        <div className="flex flex-col gap-3">
          <button
            onClick={onConfirm}
            disabled={isCancelling}
            className="w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-widest text-white bg-red-600 hover:bg-red-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl shadow-red-100"
          >
            {isCancelling ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Aborting...
              </>
            ) : (
              "Confirm Abort"
            )}
          </button>
          
          <button
            onClick={onClose}
            disabled={isCancelling}
            className="w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors disabled:opacity-50"
          >
            Maintain Activity
          </button>
        </div>
      </div>
    </div>
  );
}
