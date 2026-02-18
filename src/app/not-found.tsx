"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900 to-slate-900 flex flex-col items-center justify-center px-4">
      <div className="text-center">
        {/* Error Code */}
        <h1 className="text-9xl font-bold text-orange-500 mb-4">404</h1>

        {/* Title */}
        <h2 className="text-4xl font-bold text-white mb-2">
          Página No Encontrada
        </h2>

        {/* Description */}
        <p className="text-lg text-slate-300 mb-8 max-w-md mx-auto">
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
          Verifica la URL e intenta nuevamente.
        </p>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-2 rounded-lg font-semibold transition-all duration-200">
              Ir al Inicio
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" className="border-slate-400 text-slate-200 hover:bg-slate-800 px-8 py-2 rounded-lg font-semibold transition-all duration-200">
              Ir al Dashboard
            </Button>
          </Link>
        </div>

        {/* Help Text */}
        <p className="text-sm text-slate-400 mt-12">
          ¿Necesitas ayuda?{" "}
          <Link href="/contact" className="text-orange-400 hover:text-orange-300 underline">
            Contacta con soporte
          </Link>
        </p>
      </div>
    </div>
  );
}
