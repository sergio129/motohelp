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
      PENDIENTE: "bg-yellow-100 text-yellow-800",
      ACEPTADO: "bg-blue-100 text-blue-800",
      EN_CAMINO: "bg-indigo-100 text-indigo-800",
      EN_PROCESO: "bg-purple-100 text-purple-800",
      FINALIZADO: "bg-green-100 text-green-800",
      CANCELADO: "bg-red-100 text-red-800",
    };
    return `${base} ${styles[status] ?? "bg-slate-100 text-slate-700"}`;
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-12">
      <header>
        <h1 className="text-3xl font-semibold">Panel de mecánico</h1>
        <p className="text-slate-600">Gestiona tu perfil y solicitudes asignadas.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Perfil profesional</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleProfileSubmit}>
            <div className="space-y-2">
              <Label htmlFor="experienceYears">Años de experiencia</Label>
              <Input
                id="experienceYears"
                type="number"
                min={0}
                value={experienceYears}
                placeholder={profile?.experienceYears?.toString() ?? "Ej: 5"}
                onChange={(event) => setExperienceYears(event.target.value)}
                required={!profile}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialty">Especialidad</Label>
              <Input
                id="specialty"
                value={specialty}
                placeholder={profile?.specialty ?? "Ej: Mecánica general"}
                onChange={(event) => setSpecialty(event.target.value)}
                required={!profile}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="document">Documento (PDF o imagen)</Label>
              <Input
                id="document"
                type="file"
                accept=".pdf,image/png,image/jpeg"
                onChange={(event) => setDocument(event.target.files?.[0] ?? null)}
              />
            </div>
            <div className="flex items-center gap-4 md:col-span-2">
              <Button type="submit" disabled={savingProfile}>
                {savingProfile ? "Guardando..." : "Guardar perfil"}
              </Button>
              <span className={statusBadge(profile?.verified ? "FINALIZADO" : "PENDIENTE")}>
                {profile?.verified ? "Verificado" : "Pendiente de verificación"}
              </span>
              {profile?.documentUrl && (
                <a className="text-sm text-slate-600 underline" href={profile.documentUrl} target="_blank">
                  Ver documento
                </a>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <section className="grid gap-4">
        <h2 className="text-xl font-semibold">Solicitudes asignadas</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {assigned?.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <CardTitle>{item.type}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-600">
                <p>{item.description}</p>
                <p>Dirección: {item.address}</p>
                <span className={statusBadge(item.status)}>{item.status}</span>
                <div className="flex flex-wrap gap-2">
                  {item.status === "ACEPTADO" && (
                    <Button size="sm" onClick={() => handleStatus(item.id, "EN_CAMINO")}>
                      Marcar en camino
                    </Button>
                  )}
                  {item.status === "EN_CAMINO" && (
                    <Button size="sm" onClick={() => handleStatus(item.id, "EN_PROCESO")}>
                      Iniciar servicio
                    </Button>
                  )}
                  {item.status === "EN_PROCESO" && (
                    <Button size="sm" onClick={() => handleStatus(item.id, "FINALIZADO")}>
                      Finalizar
                    </Button>
                  )}
                  {item.status !== "FINALIZADO" && item.status !== "CANCELADO" && (
                    <Button variant="outline" size="sm" onClick={() => handleStatus(item.id, "CANCELADO")}>
                      Cancelar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {!assigned?.length && <p className="text-slate-500">No tienes solicitudes asignadas.</p>}
        </div>
      </section>

      <section className="grid gap-4">
        <h2 className="text-xl font-semibold">Solicitudes disponibles</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {available?.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle>{item.type}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              <p>{item.description}</p>
              <p>Dirección: {item.address}</p>
              <Button onClick={() => handleAccept(item.id)}>Aceptar solicitud</Button>
            </CardContent>
          </Card>
        ))}
          {!available?.length && <p className="text-slate-500">No hay solicitudes pendientes.</p>}
        </div>
      </section>
    </div>
  );
}
