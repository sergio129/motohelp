"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setError("Token inválido");
    }
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Validaciones
    if (!password || !confirmPassword) {
      setError("Todos los campos son requeridos");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Contraseña actualizada exitosamente");
        // Redirigir a login después de 2 segundos
        setTimeout(() => {
          router.push("/auth/sign-in");
        }, 2000);
      } else {
        setError(data.error || "Error al reestablecerla contraseña");
      }
    } catch (error) {
      setError("Error al procesar la solicitud");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  if (error && error === "Token inválido") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
              <span className="text-3xl">❌</span>
            </div>
            <h1 className="text-3xl font-bold text-white">Token inválido</h1>
            <p className="text-slate-400">
              El enlace de recuperación no es válido o ha expirado
            </p>
          </div>

          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-sm text-red-200">
            Por favor, solicita un nuevo enlace de recuperación
          </div>

          <Link href="/auth/forgot-password" className="block">
            <Button className="w-full bg-orange-500 text-slate-950 hover:bg-orange-400 font-semibold">
              Solicitar nuevo enlace
            </Button>
          </Link>

          <div className="text-center">
            <Link
              href="/auth/sign-in"
              className="text-sm text-orange-400 hover:text-orange-300 transition-colors"
            >
              ← Volver a iniciar sesión
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-white">Nueva Contraseña</h1>
          <p className="text-slate-400">
            Ingresa tu nueva contraseña para reestablecer tu acceso
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-200">
              Nueva Contraseña
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="border-white/10 bg-slate-900/60 text-white placeholder-slate-500 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-slate-200">
              Confirmar Contraseña
            </Label>
            <Input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••"
              className="border-white/10 bg-slate-900/60 text-white placeholder-slate-500"
              required
            />
          </div>

          <div className="bg-slate-900 border border-white/10 rounded-lg p-3 text-sm text-slate-300 space-y-1">
            <p className="font-medium">Requisitos de contraseña:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>Mínimo 6 caracteres</li>
              <li>Las contraseñas deben coincidir</li>
            </ul>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 text-slate-950 hover:bg-orange-400 disabled:opacity-50 font-semibold"
          >
            {loading ? "Guardando..." : "Guardar Nueva Contraseña"}
          </Button>
        </form>

        <div className="text-center">
          <Link
            href="/auth/sign-in"
            className="text-sm text-orange-400 hover:text-orange-300 transition-colors"
          >
            ← Volver a iniciar sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
