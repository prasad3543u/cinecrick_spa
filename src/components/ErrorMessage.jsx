import { AlertCircle, AlertTriangle, Info, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ErrorMessage({ title = "Something went wrong", message, onRetry }) {
  return (
    <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-8 text-center">
      <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20 mb-4">
        <AlertCircle className="h-8 w-8 text-red-400" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-red-300/70 mb-6 max-w-md mx-auto">{message}</p>
      {onRetry && (
        <Button 
          onClick={onRetry}
          className="bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30"
        >
          <RotateCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      )}
    </div>
  );
}

export function WarningMessage({ message }) {
  return (
    <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 flex items-start gap-3">
      <AlertTriangle className="h-5 w-5 text-yellow-400 shrink-0 mt-0.5" />
      <p className="text-yellow-300/90 text-sm">{message}</p>
    </div>
  );
}

export function InfoMessage({ message }) {
  return (
    <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 flex items-start gap-3">
      <Info className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
      <p className="text-blue-300/90 text-sm">{message}</p>
    </div>
  );
}