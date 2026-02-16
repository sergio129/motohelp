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
        <h1 className="text-3xl font-semibold">Panel de administración</h1>
        <p className="text-slate-600">Control general de usuarios.</p>
      </header>

      <section className="grid gap-4">
        <h2 className="text-xl font-semibold">Usuarios registrados</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {users?.map((user) => (
          <Card key={user.id}>
            <CardHeader>
              <CardTitle>{user.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm text-slate-600">
              <p>{user.email}</p>
              <p>Rol: {user.role}</p>
              <p>Teléfono: {user.phone ?? "Sin registrar"}</p>
            </CardContent>
          </Card>
        ))}
          {!users?.length && <p className="text-slate-500">Aún no hay usuarios.</p>}
        </div>
      </section>

      <section className="grid gap-4">
        <h2 className="text-xl font-semibold">Verificación de mecánicos</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {mechanics?.map((profile) => (
            <Card key={profile.userId}>
              <CardHeader>
                <CardTitle>{profile.user.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-600">
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
                    onClick={() => handleVerify(profile.userId, !profile.verified)}
                  >
                    {profile.verified ? "Desverificar" : "Aprobar"}
                  </Button>
                  {profile.documentUrl && (
                    <a className="text-xs underline" href={profile.documentUrl} target="_blank">
                      Ver documento
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {!mechanics?.length && <p className="text-slate-500">No hay perfiles de mecánicos aún.</p>}
        </div>
      </section>

      <section className="grid gap-4">
        <h2 className="text-xl font-semibold">Solicitudes de servicio</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {requests?.map((request) => (
            <Card key={request.id}>
              <CardHeader>
                <CardTitle>{request.type}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-600">
                <p>{request.description}</p>
                <p>Dirección: {request.address}</p>
                <p>Cliente: {request.client?.name ?? "Sin asignar"}</p>
                <p>Mecánico: {request.mechanic?.name ?? "Sin asignar"}</p>
                <div className="flex items-center gap-3">
                  <span className={statusBadge(request.status)}>{request.status}</span>
                  <div className="flex flex-wrap gap-2">
                    {request.status !== "FINALIZADO" && request.status !== "CANCELADO" && (
                      <Button size="sm" onClick={() => handleStatus(request.id, "FINALIZADO")}>
                        Finalizar
                      </Button>
                    )}
                    {request.status !== "CANCELADO" && (
                      <Button variant="outline" size="sm" onClick={() => handleStatus(request.id, "CANCELADO")}>
                        Cancelar
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {!requests?.length && <p className="text-slate-500">No hay solicitudes registradas.</p>}
        </div>
      </section>
    </div>
  );
}
