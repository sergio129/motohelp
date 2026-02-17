"use client";

import { useState } from "react";
import useSWR from "swr";
import { signOut } from "next-auth/react";
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
  description: string;
  address: string;
  status: string;
  client?: User | null;
  mechanic?: User | null;
  serviceType?: { id: string; name: string } | null;
};

type ServiceType = {
  id: string;
  name: string;
  description?: string | null;
  active: boolean;
};

type AdminStats = {
  totalServices: number;
  completedServices: number;
  pendingServices: number;
  canceledServices: number;
  averageRating: number;
  totalReviews: number;
  verifiedMechanics: number;
  servicesByStatus: Array<{ status: string; count: number }>;
};

export default function AdminDashboard() {
  const { data: users } = useSWR<User[]>("/api/users", fetcher);
  const { data: allMechanics, mutate: refreshAllMechanics } = useSWR<MechanicProfile[]>(
    "/api/admin/mechanics",
    fetcher
  );
  const { data: unverifiedMechanics, mutate: refreshUnverified } = useSWR<MechanicProfile[]>(
    "/api/admin/mechanics/unverified",
    fetcher
  );
  const { data: requests, mutate: refreshRequests } = useSWR<ServiceRequest[]>(
    "/api/service-requests?scope=all",
    fetcher
  );
  const { data: serviceTypes, mutate: refreshServiceTypes } = useSWR<ServiceType[]>(
    "/api/admin/service-types",
    fetcher
  );
  const { data: stats } = useSWR<AdminStats>("/api/admin/stats", fetcher);

  const [serviceName, setServiceName] = useState("");
  const [serviceDescription, setServiceDescription] = useState("");
  const [savingService, setSavingService] = useState(false);

  async function handleVerify(userId: string, verified: boolean) {
    await fetch("/api/admin/mechanics", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, verified }),
    });
    refreshAllMechanics();
    refreshUnverified();
  }

  async function handleStatus(id: string, status: string) {
    await fetch(`/api/service-requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    refreshRequests();
  }

  async function handleCreateService(event: React.FormEvent) {
    event.preventDefault();
    setSavingService(true);

    await fetch("/api/admin/service-types", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: serviceName, description: serviceDescription || undefined }),
    });

    setServiceName("");
    setServiceDescription("");
    setSavingService(false);
    refreshServiceTypes();
  }

  async function handleToggleService(id: string, active: boolean) {
    await fetch("/api/admin/service-types", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, active }),
    });
    refreshServiceTypes();
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
      <div className="pointer-events-none absolute inset-0 opacity-20">
        <div className="absolute right-[-120px] top-20 h-[520px] w-[900px] bg-[url('/holo-bike.svg')] bg-contain bg-no-repeat" />
        <div className="absolute left-[-120px] bottom-[-40px] h-[420px] w-[760px] bg-[url('/holo-bike.svg')] bg-contain bg-no-repeat" />
      </div>
      <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-12">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-white">Panel de administración</h1>
            <p className="text-slate-300">Control general de usuarios.</p>
          </div>
          <Button
            type="button"
            variant="default"
            className="bg-white/10 text-white hover:bg-white/20"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            Cerrar sesión
          </Button>
        </header>

        {/* Estadísticas */}
        <section>
          <h2 className="mb-4 text-xl font-semibold text-white">Estadísticas</h2>
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="border-orange-400/20 bg-orange-500/10">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-orange-300">{stats?.totalServices || 0}</div>
                <p className="text-xs text-orange-200">Total de servicios</p>
              </CardContent>
            </Card>
            <Card className="border-green-400/20 bg-green-500/10">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-green-300">{stats?.completedServices || 0}</div>
                <p className="text-xs text-green-200">Servicios completados</p>
              </CardContent>
            </Card>
            <Card className="border-yellow-400/20 bg-yellow-500/10">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-yellow-300">{stats?.pendingServices || 0}</div>
                <p className="text-xs text-yellow-200">Pendientes</p>
              </CardContent>
            </Card>
            <Card className="border-blue-400/20 bg-blue-500/10">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-blue-300">⭐ {stats?.averageRating || 0}</div>
                <p className="text-xs text-blue-200">Rating promedio</p>
              </CardContent>
            </Card>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Card className="border-white/10 bg-white/5">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-white">{stats?.verifiedMechanics || 0}</div>
                <p className="text-xs text-slate-400">Mecánicos verificados</p>
              </CardContent>
            </Card>
            <Card className="border-white/10 bg-white/5">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-white">{stats?.totalReviews || 0}</div>
                <p className="text-xs text-slate-400">Calificaciones recibidas</p>
              </CardContent>
            </Card>
          </div>
        </section>

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
          <Card className="border-blue-500/30 bg-blue-500/10">
            <CardHeader>
              <CardTitle className="text-blue-300">ℹ️ Información para mecánicos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-200">
              <p><strong>Campos obligatorios para crear perfil de mecánico:</strong></p>
              <ul className="ml-4 space-y-1">
                <li>✓ <strong>Nombre completo</strong> (mín. 2 caracteres)</li>
                <li>✓ <strong>Años de experiencia</strong> (0-60 años)</li>
                <li>✓ <strong>Especialidad</strong> (ej: "Mecánica general", "Frenos", etc.)</li>
                <li>✓ <strong>Seleccionar al menos 1 servicio</strong> que puede realizar</li>
                <li>○ Teléfono (opcional, mín. 7 caracteres)</li>
                <li>○ Documento (opcional, PDF o imagen)</li>
              </ul>
              <p className="mt-3 border-t border-blue-500/20 pt-2 text-xs">
                <strong>Nota:</strong> Los mecánicos sin verificar NO tendrán servicios activos visibles hasta que el administrador los apruebe.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4">
          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader>
              <CardTitle className="text-white">Agregar nuevo tipo</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4 md:grid-cols-2" onSubmit={handleCreateService}>
                <div className="space-y-2">
                  <label className="text-sm text-slate-200" htmlFor="serviceName">Nombre</label>
                  <input
                    id="serviceName"
                    value={serviceName}
                    onChange={(event) => setServiceName(event.target.value)}
                    className="h-10 w-full rounded-md border border-white/10 bg-slate-900/60 px-3 text-white"
                    placeholder="Ej: Cambio de aceite"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-slate-200" htmlFor="serviceDesc">Descripción</label>
                  <input
                    id="serviceDesc"
                    value={serviceDescription}
                    onChange={(event) => setServiceDescription(event.target.value)}
                    className="h-10 w-full rounded-md border border-white/10 bg-slate-900/60 px-3 text-white"
                    placeholder="Opcional"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={savingService}
                  className="bg-orange-500 text-slate-950 hover:bg-orange-400 md:col-span-2"
                >
                  {savingService ? "Guardando..." : "Agregar servicio"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {serviceTypes?.map((service) => (
              <Card key={service.id} className="border-white/10 bg-white/5 text-white">
                <CardHeader>
                  <CardTitle className="text-white">{service.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-slate-200">
                  <p>{service.description ?? "Sin descripción"}</p>
                  <div className="flex items-center justify-between">
                    <span className={statusBadge(service.active ? "FINALIZADO" : "CANCELADO")}>
                      {service.active ? "Activo" : "Inactivo"}
                    </span>
                    <Button
                      size="sm"
                      variant="default"
                      className={
                        service.active
                          ? "bg-white/10 text-white hover:bg-white/20"
                          : "bg-orange-500 text-slate-950 hover:bg-orange-400"
                      }
                      onClick={() => handleToggleService(service.id, !service.active)}
                    >
                      {service.active ? "Desactivar" : "Activar"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {!serviceTypes?.length && (
              <p className="text-slate-400">Aún no hay tipos de servicio configurados.</p>
            )}
          </div>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold text-white">Verificación de mecánicos</h2>
          
          {/* Pendientes por aprobar */}
          <div>
            <h3 className="mb-3 text-lg font-medium text-orange-300">
              ⏳ Pendientes por aprobar ({unverifiedMechanics?.filter(m => !m.verified).length || 0})
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              {unverifiedMechanics?.filter(m => !m.verified).map((profile) => (
                <Card key={profile.userId} className="border-orange-500/20 bg-orange-500/10 text-white">
                  <CardHeader>
                    <CardTitle className="text-white">{profile.user.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-slate-200">
                    <p>Email: {profile.user.email}</p>
                    <p>Especialidad: {profile.specialty}</p>
                    <p>Años experiencia: {profile.experienceYears}</p>
                    <p>Teléfono: {profile.user.phone ?? "No registrado"}</p>
                    <div className="flex items-center gap-3 pt-2">
                      <span className="inline-flex rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-semibold text-yellow-200">
                        Pendiente
                      </span>
                      <Button
                        size="sm"
                        className="bg-orange-500 text-slate-950 hover:bg-orange-400"
                        onClick={() => handleVerify(profile.userId, true)}
                      >
                        Aprobar
                      </Button>
                      {profile.documentUrl && (
                        <a className="text-xs underline text-slate-200" href={profile.documentUrl} target="_blank" rel="noreferrer">
                          Ver doc
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {!unverifiedMechanics?.filter(m => !m.verified).length && (
                <p className="text-slate-400">✅ No hay perfiles pendientes de aprobación.</p>
              )}
            </div>
          </div>

          {/* Verificados */}
          <div>
            <h3 className="mb-3 text-lg font-medium text-green-300">
              ✅ Mecánicos verificados ({allMechanics?.filter(m => m.verified).length || 0})
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              {allMechanics?.filter(m => m.verified).map((profile) => (
                <Card key={profile.userId} className="border-green-500/20 bg-green-500/10 text-white">
                  <CardHeader>
                    <CardTitle className="text-white">{profile.user.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-slate-200">
                    <p>Email: {profile.user.email}</p>
                    <p>Especialidad: {profile.specialty}</p>
                    <p>Años experiencia: {profile.experienceYears}</p>
                    <div className="flex items-center gap-3 pt-2">
                      <span className="inline-flex rounded-full bg-green-500/20 px-3 py-1 text-xs font-semibold text-green-200">
                        Verificado
                      </span>
                      <Button
                        size="sm"
                        variant="default"
                        className="bg-white/10 text-white hover:bg-white/20"
                        onClick={() => handleVerify(profile.userId, false)}
                      >
                        Desverificar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {!allMechanics?.filter(m => m.verified).length && (
                <p className="text-slate-400">No hay mecánicos verificados aún.</p>
              )}
            </div>
          </div>
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold text-white">Solicitudes de servicio</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {requests?.map((request) => (
              <Card key={request.id} className="border-white/10 bg-white/5 text-white">
                <CardHeader>
                  <CardTitle className="text-white">{request.serviceType?.name ?? "Servicio"}</CardTitle>
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
                      {request.status !== "CANCELADO" && request.status !== "FINALIZADO" && (
                        <Button variant="default" size="sm" className="bg-white/10 text-white hover:bg-white/20" onClick={() => handleStatus(request.id, "CANCELADO")}>
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
