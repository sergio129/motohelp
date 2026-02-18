"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError("Credenciales inválidas");
        setLoading(false);
        return;
      }

      if (result?.ok) {
        // Redirigir al dashboard
        window.location.href = "/dashboard";
      }
    } catch (err) {
      console.error("Error en login:", err);
      setError("Error al intentar iniciar sesión");
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-6 py-12 text-white">
      <div className="pointer-events-none absolute -left-24 top-[-120px] h-72 w-72 rounded-full bg-orange-500/20 blur-[120px]" />
      <div className="pointer-events-none absolute right-[-120px] top-24 h-72 w-72 rounded-full bg-red-500/20 blur-[140px]" />
      <Card className="w-full max-w-md border-white/10 bg-white/5 text-white shadow-2xl shadow-black/40">
        <CardHeader>
          <CardTitle className="text-white">Iniciar sesión</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label className="text-slate-200" htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="border-white/10 bg-slate-900/60 text-white placeholder:text-slate-500"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-200" htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="border-white/10 bg-slate-900/60 text-white placeholder:text-slate-500"
                required
              />
              <div className="text-right">
                <Link href="/auth/forgot-password" className="text-xs text-orange-400 hover:text-orange-300 transition-colors">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </div>
            {error && <p className="text-sm text-red-300">{error}</p>}
            <Button className="w-full bg-orange-500 text-slate-950 hover:bg-orange-400" type="submit" disabled={loading}>
              {loading ? "Ingresando..." : "Ingresar"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-slate-300">
          ¿No tienes cuenta? <Link className="ml-1 text-orange-200" href="/auth/sign-up">Regístrate</Link>
        </CardFooter>
      </Card>
    </div>
  );
}
