"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email) {
      toast.error("Por favor ingresa tu email");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setSubmitted(true);
        toast.success("Revisa tu email para reestablecertu contraseña");
      } else {
        toast.error(data.error || "Error al procesar la solicitud");
      }
    } catch (error) {
      toast.error("Error al procesar la solicitud");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center">
              <span className="text-3xl">✉️</span>
            </div>
            <h1 className="text-3xl font-bold text-white">Email enviado</h1>
            <p className="text-slate-400">
              Hemos enviado las instrucciones a <strong>{email}</strong>
            </p>
          </div>

          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold text-white">¿Qué hacer ahora?</h2>
            <ol className="text-sm text-slate-300 space-y-3 list-decimal list-inside">
              <li>Revisa tu email (también en "SPAM")</li>
              <li>Haz clic en el botón "Reestablecercontraseña"</li>
              <li>Ingresa tu nueva contraseña</li>
              <li>¡Inicia sesión con tu nueva contraseña!</li>
            </ol>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-sm text-yellow-200">
              ⏰ El enlace expira en <strong>1 hora</strong>
            </div>
          </div>

          <div className="space-y-3 text-center">
            <p className="text-sm text-slate-400">¿No recibiste el email?</p>
            <Button
              onClick={() => setSubmitted(false)}
              className="w-full bg-white/10 text-white hover:bg-white/20"
            >
              Intentar de nuevo
            </Button>
          </div>

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
          <h1 className="text-3xl font-bold text-white">Recuperar Contraseña</h1>
          <p className="text-slate-400">
            Te enviaremos instrucciones para reestablecertu contraseña
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-200">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="border-white/10 bg-slate-900/60 text-white placeholder-slate-500"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 text-slate-950 hover:bg-orange-400 disabled:opacity-50 font-semibold"
          >
            {loading ? "Enviando..." : "Enviar instrucciones"}
          </Button>
        </form>

        <div className="text-center space-y-2">
          <p className="text-sm text-slate-400">¿Ya tienes acceso?</p>
          <Link
            href="/auth/sign-in"
            className="text-sm text-orange-400 hover:text-orange-300 transition-colors"
          >
            Volver a iniciar sesión →
          </Link>
        </div>

        <div className="text-center">
          <Link
            href="/auth/sign-up"
            className="text-sm text-slate-400 hover:text-slate-300 transition-colors"
          >
            ¿No tienes cuenta? Regístrate
          </Link>
        </div>
      </div>
    </div>
  );
}
