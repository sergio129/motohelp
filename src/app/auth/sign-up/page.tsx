"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const roles = [
  { value: "CLIENT", label: "Cliente" },
  { value: "MECHANIC", label: "Mecánico" },
];

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("CLIENT");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role, phone: phone || undefined }),
    });

    if (!response.ok) {
      const payload = await response.json();
      setError(payload?.message ?? "No se pudo registrar");
      setLoading(false);
      return;
    }

    router.push("/auth/sign-in");
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-6 py-12 text-white">
      <div className="pointer-events-none absolute -left-24 top-[-120px] h-72 w-72 rounded-full bg-orange-500/20 blur-[120px]" />
      <div className="pointer-events-none absolute right-[-120px] top-24 h-72 w-72 rounded-full bg-red-500/20 blur-[140px]" />
      <Card className="w-full max-w-md border-white/10 bg-white/5 text-white shadow-2xl shadow-black/40">
        <CardHeader>
          <CardTitle className="text-white">Crear cuenta</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label className="text-slate-200" htmlFor="name">Nombre completo</Label>
              <Input
                id="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="border-white/10 bg-slate-900/60 text-white placeholder:text-slate-500"
                required
              />
            </div>
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
              <Label className="text-slate-200" htmlFor="phone">Teléfono (opcional)</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="border-white/10 bg-slate-900/60 text-white placeholder:text-slate-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-200" htmlFor="role">Rol</Label>
              <select
                id="role"
                value={role}
                onChange={(event) => setRole(event.target.value)}
                className="flex h-10 w-full rounded-md border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white"
              >
                {roles.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
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
              <p className="text-xs text-slate-300">Mínimo 8 caracteres, 1 mayúscula y 1 número.</p>
            </div>
            {error && <p className="text-sm text-red-300">{error}</p>}
            <Button className="w-full bg-orange-500 text-slate-950 hover:bg-orange-400" type="submit" disabled={loading}>
              {loading ? "Registrando..." : "Crear cuenta"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-slate-300">
          ¿Ya tienes cuenta? <Link className="ml-1 text-orange-200" href="/auth/sign-in">Ingresar</Link>
        </CardFooter>
      </Card>
    </div>
  );
}
