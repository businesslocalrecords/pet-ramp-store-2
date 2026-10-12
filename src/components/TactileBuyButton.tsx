import React from 'react';
import { Loader2, Lock } from 'lucide-react';
import { formatMoney } from '../lib/offers';

interface TactileBuyButtonProps {
  label: string;
  sublabel?: string;
  price: number;
  loading?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

/**
 * Tactile "neuromorphic" buy button — a hard bottom shadow makes the control
 * look physically pressable, and the press animation collapses the shadow.
 */
export const TactileBuyButton: React.FC<TactileBuyButtonProps> = ({
  label,
  sublabel,
  price,
  loading = false,
  disabled = false,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className="group w-full rounded-2xl bg-emerald-500 px-6 py-4 text-center text-white shadow-[0_6px_0_0_#047857] transition-all duration-150 hover:bg-emerald-400 active:translate-y-1.5 active:shadow-[0_0px_0_0_#047857] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:translate-y-0 disabled:active:shadow-[0_6px_0_0_#047857]"
    >
      <span className="flex items-center justify-center gap-2">
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            <span className="text-base font-bold">Processing…</span>
          </>
        ) : (
          <>
            <Lock className="h-4 w-4 opacity-90" aria-hidden="true" />
            <span className="text-base font-extrabold tracking-tight">
              {label} &mdash; ${formatMoney(price)}
            </span>
          </>
        )}
      </span>
      {sublabel && !loading && (
        <span className="mt-0.5 block text-[11px] font-medium text-emerald-50/90">
          {sublabel}
        </span>
      )}
    </button>
  );
};