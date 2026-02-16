"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string | null;
};

type MechanicProfile = {
  userId: string;
  verified: boolean;
  experienceYears: number;
  specialty: string;
  documentUrl?: string | null;
  user: User;
};

type ServiceRequest = {
  id: string;
  type: string;
  description: string;
  address: string;
  status: string;
  client?: User | null;
  mechanic?: User | null;
};

export default function AdminDashboard() {
  const { data: users } = useSWR<User[]>("/api/users", fetcher);
  const { data: mechanics, mutate: refreshMechanics } = useSWR<MechanicProfile[]>(
    "/api/admin/mechanics",
    fetcher
  );
  const { data: requests, mutate: refreshRequests } = useSWR<ServiceRequest[]>(
    "/api/service-requests?scope=all",
    fetcher
  );

  async function handleVerify(userId: string, verified: boolean) {
    await fetch("/api/admin/mechanics", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, verified }),
    });
    refreshMechanics();
  }

  async function handleStatus(id: string, status: string) {
    await fetch(`/api/service-requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    refreshRequests();
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
          <h1 className="text-3xl font-semibold text-white">Panel de administración</h1>
          <p className="text-slate-300">Control general de usuarios.</p>
        </header>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold text-white">Usuarios registrados</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {users?.map((user) => (
            <Card key={user.id} className="border-white/10 bg-white/5 text-white">
              <CardHeader>
                <CardTitle className="text-white">{user.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm text-slate-200">
                <p>{user.email}</p>
                <p>Rol: {user.role}</p>
                <p>Teléfono: {user.phone ?? "Sin registrar"}</p>
              </CardContent>
            </Card>
          ))}
            {!users?.length && <p className="text-slate-400">Aún no hay usuarios.</p>}
          </div>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold text-white">Verificación de mecánicos</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {mechanics?.map((profile) => (
              <Card key={profile.userId} className="border-white/10 bg-white/5 text-white">
                <CardHeader>
                  <CardTitle className="text-white">{profile.user.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-slate-200">
                  <p>{profile.user.email}</p>
                  <p>Especialidad: {profile.specialty}</p>
                  <p>Años experiencia: {profile.experienceYears}</p>
                  <div className="flex items-center gap-3">
                    <span className={statusBadge(profile.verified ? "FINALIZADO" : "PENDIENTE")}>
                      {profile.verified ? "Verificado" : "Pendiente"}
                    </span>
                    <Button
                      size="sm"
                      variant={profile.verified ? "outline" : "default"}
                      className={profile.verified ? "border-white/20 text-white hover:bg-white/10" : "bg-orange-500 text-slate-950 hover:bg-orange-400"}
                      onClick={() => handleVerify(profile.userId, !profile.verified)}
                    >
                      {profile.verified ? "Desverificar" : "Aprobar"}
                    </Button>
                    {profile.documentUrl && (
                      <a className="text-xs underline text-slate-200" href={profile.documentUrl} target="_blank">
                        Ver documento
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {!mechanics?.length && <p className="text-slate-400">No hay perfiles de mecánicos aún.</p>}
          </div>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold text-white">Solicitudes de servicio</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {requests?.map((request) => (
              <Card key={request.id} className="border-white/10 bg-white/5 text-white">
                <CardHeader>
                  <CardTitle className="text-white">{request.type}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-slate-200">
                  <p>{request.description}</p>
                  <p>Dirección: {request.address}</p>
                  <p>Cliente: {request.client?.name ?? "Sin asignar"}</p>
                  <p>Mecánico: {request.mechanic?.name ?? "Sin asignar"}</p>
                  <div className="flex items-center gap-3">
                    <span className={statusBadge(request.status)}>{request.status}</span>
                    <div className="flex flex-wrap gap-2">
                      {request.status !== "FINALIZADO" && request.status !== "CANCELADO" && (
                        <Button size="sm" className="bg-orange-500 text-slate-950 hover:bg-orange-400" onClick={() => handleStatus(request.id, "FINALIZADO")}>
                          Finalizar
                        </Button>
                      )}
                      {request.status !== "CANCELADO" && (
                        <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10" onClick={() => handleStatus(request.id, "CANCELADO")}>
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {!requests?.length && <p className="text-slate-400">No hay solicitudes registradas.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
