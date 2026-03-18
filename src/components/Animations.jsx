import { useEffect, useState } from "react";
import { CheckCircle, Loader2 } from "lucide-react";

export function SuccessAnimation({ message, onComplete }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onComplete) onComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div className="fixed top-20 right-4 z-50 animate-slideIn">
      <div className="bg-green-500/90 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur border border-green-400/30">
        <CheckCircle className="h-5 w-5 animate-bounce" />
        <span className="font-semibold">{message}</span>
      </div>
    </div>
  );
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-pink-500" />
        <p className="text-white/50 text-sm">Loading...</p>
      </div>
    </div>
  );
}