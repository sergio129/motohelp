"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ServiceRequest = {
  id: string;
  type: string;
  description: string;
  address: string;
  status: string;
};

type MechanicProfile = {
  userId: string;
  verified: boolean;
  experienceYears: number;
  specialty: string;
  documentUrl?: string | null;
};

export default function MechanicDashboard() {
  const { data: available, mutate: refreshAvailable } = useSWR<ServiceRequest[]>(
    "/api/service-requests",
    fetcher
  );
  const { data: assigned, mutate: refreshAssigned } = useSWR<ServiceRequest[]>(
    "/api/service-requests?scope=assigned",
    fetcher
  );
  const { data: profile, mutate: refreshProfile } = useSWR<MechanicProfile | null>(
    "/api/mechanic-profile",
    fetcher
  );

  const [experienceYears, setExperienceYears] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [document, setDocument] = useState<File | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  async function handleAccept(id: string) {
    await fetch(`/api/service-requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "assign" }),
    });
    refreshAvailable();
    refreshAssigned();
  }

  async function handleStatus(id: string, status: string) {
    await fetch(`/api/service-requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    refreshAssigned();
  }

  async function handleProfileSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSavingProfile(true);

    const formData = new FormData();
    formData.append("experienceYears", experienceYears || String(profile?.experienceYears ?? ""));
    formData.append("specialty", specialty || String(profile?.specialty ?? ""));
    if (document) {
      formData.append("document", document);
    }

    await fetch("/api/mechanic-profile", {
      method: "POST",
      body: formData,
    });

    setDocument(null);
    setSavingProfile(false);
    refreshProfile();
  }

  function statusBadge(status: string) {
    const base = "inline-flex rounded-full px-3 py-1 text-xs font-semibold";
    const styles: Record<string, string> = {
      PENDIENTE: "bg-yellow-500/20 text-yellow-200",
      ACEPTADO: "bg-blue-500/20 text-blue-200",
      EN_CAMINO: "bg-indigo-500/20 text-indigo-200",
      EN_PROCESO: "bg-purple-500/20 text-purple-200",
      FINALIZADO: "bg-green-500/20 text-green-200",
      CANCELADO: "bg-red-500/20 text-red-200",
    };
    return `${base} ${styles[status] ?? "bg-white/10 text-slate-200"}`;
  }

  return (
    <div className="relative min-h-screen bg-slate-950 text-white">
      <div className="pointer-events-none absolute -left-32 top-[-120px] h-72 w-72 rounded-full bg-orange-500/10 blur-[140px]" />
      <div className="pointer-events-none absolute right-[-120px] top-32 h-72 w-72 rounded-full bg-red-500/10 blur-[160px]" />
      <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-12">
        <header>
          <h1 className="text-3xl font-semibold text-white">Panel de mecánico</h1>
          <p className="text-slate-300">Gestiona tu perfil y solicitudes asignadas.</p>
        </header>

        <Card className="border-white/10 bg-white/5 text-white">
          <CardHeader>
            <CardTitle className="text-white">Perfil profesional</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4 md:grid-cols-2" onSubmit={handleProfileSubmit}>
            <div className="space-y-2">
              <Label className="text-slate-200" htmlFor="experienceYears">Años de experiencia</Label>
              <Input
                id="experienceYears"
                type="number"
                min={0}
                value={experienceYears}
                placeholder={profile?.experienceYears?.toString() ?? "Ej: 5"}
                onChange={(event) => setExperienceYears(event.target.value)}
                className="border-white/10 bg-slate-900/60 text-white"
                required={!profile}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-200" htmlFor="specialty">Especialidad</Label>
              <Input
                id="specialty"
                value={specialty}
                placeholder={profile?.specialty ?? "Ej: Mecánica general"}
                onChange={(event) => setSpecialty(event.target.value)}
                className="border-white/10 bg-slate-900/60 text-white"
                required={!profile}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label className="text-slate-200" htmlFor="document">Documento (PDF o imagen)</Label>
              <Input
                id="document"
                type="file"
                accept=".pdf,image/png,image/jpeg"
                className="border-white/10 bg-slate-900/60 text-white"
                onChange={(event) => setDocument(event.target.files?.[0] ?? null)}
              />
            </div>
            <div className="flex items-center gap-4 md:col-span-2">
              <Button type="submit" disabled={savingProfile} className="bg-orange-500 text-slate-950 hover:bg-orange-400">
                {savingProfile ? "Guardando..." : "Guardar perfil"}
              </Button>
              <span className={statusBadge(profile?.verified ? "FINALIZADO" : "PENDIENTE")}>
                {profile?.verified ? "Verificado" : "Pendiente de verificación"}
              </span>
              {profile?.documentUrl && (
                <a className="text-sm text-slate-200 underline" href={profile.documentUrl} target="_blank">
                  Ver documento
                </a>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold text-white">Solicitudes asignadas</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {assigned?.map((item) => (
              <Card key={item.id} className="border-white/10 bg-white/5 text-white">
                <CardHeader>
                  <CardTitle className="text-white">{item.type}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-slate-200">
                  <p>{item.description}</p>
                  <p>Dirección: {item.address}</p>
                  <span className={statusBadge(item.status)}>{item.status}</span>
                  <div className="flex flex-wrap gap-2">
                    {item.status === "ACEPTADO" && (
                      <Button size="sm" className="bg-orange-500 text-slate-950 hover:bg-orange-400" onClick={() => handleStatus(item.id, "EN_CAMINO")}>
                        Marcar en camino
                      </Button>
                    )}
                    {item.status === "EN_CAMINO" && (
                      <Button size="sm" className="bg-orange-500 text-slate-950 hover:bg-orange-400" onClick={() => handleStatus(item.id, "EN_PROCESO")}>
                        Iniciar servicio
                      </Button>
                    )}
                    {item.status === "EN_PROCESO" && (
                      <Button size="sm" className="bg-orange-500 text-slate-950 hover:bg-orange-400" onClick={() => handleStatus(item.id, "FINALIZADO")}>
                        Finalizar
                      </Button>
                    )}
                    {item.status !== "FINALIZADO" && item.status !== "CANCELADO" && (
                      <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10" onClick={() => handleStatus(item.id, "CANCELADO")}>
                        Cancelar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {!assigned?.length && <p className="text-slate-400">No tienes solicitudes asignadas.</p>}
          </div>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold text-white">Solicitudes disponibles</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {available?.map((item) => (
            <Card key={item.id} className="border-white/10 bg-white/5 text-white">
              <CardHeader>
                <CardTitle className="text-white">{item.type}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-200">
                <p>{item.description}</p>
                <p>Dirección: {item.address}</p>
                <Button className="bg-orange-500 text-slate-950 hover:bg-orange-400" onClick={() => handleAccept(item.id)}>
                  Aceptar solicitud
                </Button>
              </CardContent>
            </Card>
          ))}
            {!available?.length && <p className="text-slate-400">No hay solicitudes pendientes.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
