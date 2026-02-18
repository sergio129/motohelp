"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to monitoring service
    console.error("Error en la aplicación:", error);
    
    // Show toast notification
    toast.error("Ha ocurrido un error. Por favor, intenta nuevamente.");
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900 to-slate-900 flex flex-col items-center justify-center px-4">
      <div className="text-center">
        {/* Error Code */}
        <h1 className="text-9xl font-bold text-red-500 mb-4">500</h1>

        {/* Title */}
        <h2 className="text-4xl font-bold text-white mb-2">
          Error interno del servidor
        </h2>

        {/* Description */}
        <p className="text-lg text-slate-300 mb-8 max-w-md mx-auto">
          Algo salió mal. Nuestro equipo ha sido notificado y estamos trabajando
          para resolver el problema lo antes posible.
        </p>

        {/* Error Details (Development only) */}
        {process.env.NODE_ENV === "development" && (
          <div className="bg-slate-800 border border-red-500 rounded-lg p-4 mb-8 max-w-lg mx-auto text-left">
            <p className="text-red-400 font-mono text-sm whitespace-pre-wrap break-words">
              {error.message}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center flex-wrap">
          <Button
            onClick={reset}
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-2 rounded-lg font-semibold transition-all duration-200"
          >
            Reintentar
          </Button>
          <Button
            onClick={() => window.location.href = "/"}
            variant="outline"
            className="border-slate-400 text-slate-200 hover:bg-slate-800 px-8 py-2 rounded-lg font-semibold transition-all duration-200"
          >
            Ir al Inicio
          </Button>
        </div>

        {/* Help Text */}
        <p className="text-sm text-slate-400 mt-12">
          Si el problema persiste, por favor{" "}
          <a href="/contact" className="text-orange-400 hover:text-orange-300 underline">
            contacta con soporte
          </a>
        </p>
      </div>
    </div>
  );
}
