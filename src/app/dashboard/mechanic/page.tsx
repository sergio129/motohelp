"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { signOut } from "next-auth/react";
import toast from "react-hot-toast";
import { fetcher } from "@/lib/fetcher";
import { formatStatus } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ServiceRequest = {
  id: string;
  description: string;
  address: string;
  status: string;
  serviceType?: { id: string; name: string } | null;
  clientId: string;
  client?: { id: string; name: string; email: string; phone?: string; documentId?: string } | null;
};

type ServiceType = {
  id: string;
  name: string;
  description?: string | null;
};

type Address = {
  id: string;
  label?: string | null;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  reference?: string | null;
  isPrimary: boolean;
};

type MechanicProfileResponse = {
  user: { name: string; phone?: string | null; documentId?: string | null } | null;
};

type MechanicProfile = {
  userId: string;
  verified: boolean;
  experienceYears: number;
  specialty: string;
  documentUrl?: string | null;
  services?: { serviceType: ServiceType }[];
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
  const { data: personalData, mutate: refreshPersonal } = useSWR<MechanicProfileResponse>(
    "/api/profile/mechanic",
    fetcher
  );
  const { data: addresses, mutate: refreshAddresses } = useSWR<Address[]>(
    "/api/addresses",
    fetcher
  );
  const { data: serviceTypes } = useSWR<ServiceType[]>("/api/service-types", fetcher);

  const [experienceYears, setExperienceYears] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [document, setDocument] = useState<File | null>(null);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [savingProfile, setSavingProfile] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [documentId, setDocumentId] = useState("");
  const [savingPersonal, setSavingPersonal] = useState(false);

  const [addrLabel, setAddrLabel] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");
  const [reference, setReference] = useState("");
  const [savingAddress, setSavingAddress] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedServiceIdForNotes, setSelectedServiceIdForNotes] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  async function handleAccept(id: string) {
    const loadingToast = toast.loading("Aceptando solicitud...");
    try {
      const res = await fetch(`/api/service-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "assign" }),
      });
      if (res.ok) {
        toast.success("¡Solicitud aceptada! Ya estás en camino", { id: loadingToast });
        refreshAvailable();
        refreshAssigned();
      } else {
        const data = await res.json();
        toast.error(data.message || "Error al aceptar", { id: loadingToast });
      }
    } catch {
      toast.error("Error al aceptar solicitud", { id: loadingToast });
    }
  }

  useEffect(() => {
    if (personalData?.user) {
      setName((prev) => prev || personalData.user?.name || "");
      setPhone((prev) => prev || personalData.user?.phone || "");
      setDocumentId((prev) => prev || personalData.user?.documentId || "");
    }
  }, [personalData]);

  async function handleStatus(id: string, status: string) {
    const statusMap: Record<string, string> = {
      EN_CAMINO: "Rumbo al destino",
      EN_PROCESO: "Iniciando servicio",
      FINALIZADO: "Abriendo formulario de notas",
      CANCELADO: "Cancelando servicio",
    };
    const loadingToast = toast.loading(`${statusMap[status] || "Actualizando"}...`);
    try {
      const res = await fetch(`/api/service-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        toast.success("✅ Estado actualizado", { id: loadingToast });
        refreshAssigned();
      } else {
        toast.error("Error al actualizar", { id: loadingToast });
      }
    } catch {
      toast.error("Error al actualizar", { id: loadingToast });
    }
  }

  async function handleProfileSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSavingProfile(true);

    const formData = new FormData();
    formData.append("experienceYears", experienceYears || String(profile?.experienceYears ?? ""));
    formData.append("specialty", specialty || String(profile?.specialty ?? ""));
    const currentServices = selectedServiceIds.length
      ? selectedServiceIds
      : profile?.services?.map((service) => service.serviceType.id) ?? [];
    formData.append("serviceTypeIds", JSON.stringify(currentServices));
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

  async function handleSavePersonal(event: React.FormEvent) {
    event.preventDefault();
    setSavingPersonal(true);

    await fetch("/api/profile/mechanic", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        phone: phone || undefined,
        documentId: documentId || undefined,
      }),
    });

    setSavingPersonal(false);
    refreshPersonal();
  }

  async function handleAddAddress(event: React.FormEvent) {
    event.preventDefault();
    setSavingAddress(true);

    try {
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: addrLabel || undefined,
          street,
          city,
          state,
          postalCode,
          country,
          reference: reference || undefined,
        }),
      });

      if (res.ok) {
        setAddrLabel("");
        setStreet("");
        setCity("");
        setState("");
        setPostalCode("");
        setCountry("");
        setReference("");
        toast.success("✅ Dirección guardada exitosamente");
        refreshAddresses();
      } else {
        const data = await res.json();
        toast.error(data.message || "Error al guardar dirección");
      }
    } catch (error) {
      toast.error("Error al guardar dirección");
    } finally {
      setSavingAddress(false);
    }
  }

  async function handleSetPrimary(id: string) {
    try {
      const res = await fetch("/api/addresses", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      
      if (res.ok) {
        toast.success("✅ Dirección principal actualizada");
        refreshAddresses();
      } else {
        const data = await res.json();
        toast.error(data.message || "Error al actualizar dirección");
      }
    } catch (error) {
      toast.error("Error al actualizar dirección");
    }
  }

  function toggleService(id: string) {
    setSelectedServiceIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
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

  function formatAddress(item: Address) {
    return `${item.street}, ${item.city}, ${item.state} ${item.postalCode}, ${item.country}`;
  }

  return (
    <div className="relative min-h-screen bg-slate-950 text-white">
      <div className="pointer-events-none absolute -left-32 top-[-120px] h-72 w-72 rounded-full bg-orange-500/10 blur-[140px]" />
      <div className="pointer-events-none absolute right-[-120px] top-32 h-72 w-72 rounded-full bg-red-500/10 blur-[160px]" />
      <div className="pointer-events-none absolute inset-0 opacity-20">
        <div className="absolute right-[-120px] top-16 h-[520px] w-[900px] bg-[url('/holo-bike.svg')] bg-contain bg-no-repeat" />
        <div className="absolute left-[-140px] bottom-[-60px] h-[420px] w-[760px] bg-[url('/holo-bike.svg')] bg-contain bg-no-repeat" />
      </div>
      <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-12">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-white">Panel de mecánico</h1>
            <p className="text-slate-300">Gestiona tu perfil y solicitudes asignadas.</p>
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

        <Card className="border-white/10 bg-white/5 text-white">
          <CardHeader>
            <CardTitle className="text-white">Perfil del mecánico</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-500/20 text-lg font-semibold text-orange-200">
                {(name || "M").slice(0, 1).toUpperCase()}
              </div>
              <div>
                <p className="text-lg font-semibold text-white">{name || "Mecánico"}</p>
                <p className="text-sm text-slate-300">{phone || "Sin teléfono"}</p>
                <p className="text-xs text-slate-400">{profile?.specialty || "Sin especialidad"}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className={statusBadge(profile?.verified ? "FINALIZADO" : "PENDIENTE")}>
                {profile?.verified ? "Verificado" : "Pendiente de verificación"}
              </span>
              <Button
                type="button"
                variant="default"
                className="bg-white/10 text-white hover:bg-white/20"
                onClick={() => setIsProfileOpen(true)}
              >
                Editar perfil
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* SOLICITUDES DISPONIBLES - Destacadas al inicio */}
        <section className="grid gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/20">
              <span className="text-lg">🔔</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Solicitudes disponibles</h2>
              <p className="text-xs text-slate-400">Nuevas solicitudes que puedes aceptar</p>
            </div>
          </div>
          
          {!profile?.verified && (
            <Card className="border-orange-500/30 bg-orange-500/10">
              <CardContent className="pt-6">
                <p className="text-sm text-orange-200">
                  ⏳ <strong>Tu perfil está pendiente de verificación.</strong> El administrador debe aprobar tu perfil profesional antes de que puedas ver y aceptar solicitudes de servicio.
                </p>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {available?.map((item) => (
            <Card key={item.id} className="border-orange-500/40 bg-gradient-to-br from-orange-500/10 to-orange-500/5 text-white shadow-lg shadow-orange-500/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <span className="text-orange-400">◆</span>
                  {item.serviceType?.name ?? "Servicio"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-200">
                <p className="font-medium">{item.description}</p>
                <p className="text-xs text-slate-300">📍 {item.address}</p>
                <Button className="w-full bg-orange-500 text-slate-950 hover:bg-orange-400 font-semibold" onClick={() => handleAccept(item.id)}>
                  Aceptar solicitud
                </Button>
              </CardContent>
            </Card>
          ))}
            {!available?.length && !profile?.verified && <p className="text-slate-400">No hay solicitudes disponibles mientras tu perfil está en verificación.</p>}
            {!available?.length && profile?.verified && (
              <Card className="border-white/10 bg-white/5 md:col-span-2">
                <CardContent className="py-8 text-center">
                  <p className="text-slate-400">✓ No hay nuevas solicitudes en este momento</p>
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        {/* SERVICIOS ACTIVOS - En proceso */}
        <section className="grid gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20">
              <span className="text-lg">⚙️</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Servicios activos</h2>
              <p className="text-xs text-slate-400">Servicios que estás gestionando actualmente</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {assigned
              ?.filter((item) => ["ACEPTADO", "EN_CAMINO", "EN_PROCESO"].includes(item.status))
              .map((item) => (
              <Card key={item.id} className="border-white/10 bg-white/5 text-white">
                <CardHeader>
                  <CardTitle className="text-white">{item.serviceType?.name ?? "Servicio"}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-slate-200">
                  <p>{item.description}</p>
                  <p className="text-xs text-slate-300">📍 {item.address}</p>
                  <span className={statusBadge(item.status)}>{formatStatus(item.status)}</span>
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
                      <Button size="sm" className="bg-orange-500 text-slate-950 hover:bg-orange-400" onClick={() => {
                        setSelectedServiceIdForNotes(item.id);
                        setNotes("");
                      }}>
                        Finalizar
                      </Button>
                    )}
                    <Button variant="default" size="sm" className="bg-white/10 text-white hover:bg-white/20" onClick={() => handleStatus(item.id, "CANCELADO")}> 
                      Cancelar
                    </Button>
                    <Button variant="default" size="sm" className="bg-slate-700/50 text-slate-200 hover:bg-slate-700" onClick={() => setSelectedClientId(item.clientId)}>
                      Ver cliente
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {!assigned?.filter((item) => ["ACEPTADO", "EN_CAMINO", "EN_PROCESO"].includes(item.status)).length && (
              <p className="text-slate-400 md:col-span-2">No tienes servicios activos en este momento.</p>
            )}
          </div>
        </section>

        {/* HISTORIAL DE SERVICIOS - Tabla compacta */}
        <section className="grid gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-700/40">
              <span className="text-lg">📋</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Historial de servicios</h2>
              <p className="text-xs text-slate-400">Servicios completados y cancelados</p>
            </div>
          </div>

          {assigned?.filter((item) => ["FINALIZADO", "CANCELADO"].includes(item.status)).length ? (
            <Card className="border-white/10 bg-white/5 text-white overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-white/10 bg-white/5">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-slate-200">Servicio</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-200">Descripción</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-200">Dirección</th>
                      <th className="px-4 py-3 text-center font-semibold text-slate-200">Estado</th>
                      <th className="px-4 py-3 text-center font-semibold text-slate-200">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {assigned
                      ?.filter((item) => ["FINALIZADO", "CANCELADO"].includes(item.status))
                      .map((item) => (
                      <tr key={item.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 font-medium text-white">{item.serviceType?.name ?? "Servicio"}</td>
                        <td className="px-4 py-3 text-slate-300 max-w-xs truncate">{item.description}</td>
                        <td className="px-4 py-3 text-slate-300 text-xs max-w-xs truncate">{item.address}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={statusBadge(item.status)}>{formatStatus(item.status)}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Button 
                            variant="default" 
                            size="sm" 
                            className="bg-slate-700/50 text-slate-200 hover:bg-slate-700 text-xs" 
                            onClick={() => setSelectedClientId(item.clientId)}
                          >
                            Ver cliente
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : (
            <Card className="border-white/10 bg-white/5">
              <CardContent className="py-8 text-center">
                <p className="text-slate-400">No hay servicios en el historial aún.</p>
              </CardContent>
            </Card>
          )}
        </section>
      </div>

      {isProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border border-white/10 bg-slate-950 text-white shadow-2xl shadow-black/40">
            <div className="max-h-[90vh] overflow-y-auto p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">Editar perfil</h2>
                  <p className="text-sm text-slate-400">Actualiza tus datos, direcciones y servicios.</p>
                </div>
                <Button
                  type="button"
                  variant="default"
                  className="bg-white/10 text-white hover:bg-white/20"
                  onClick={() => setIsProfileOpen(false)}
                >
                  Cerrar
                </Button>
              </div>

              <div className="mt-6 grid gap-6">
                <Card className="border-white/10 bg-white/5 text-white">
                  <CardHeader>
                    <CardTitle className="text-white">Datos personales</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSavePersonal}>
                      <div className="space-y-2">
                        <Label className="text-slate-200" htmlFor="name">Nombre completo</Label>
                        <Input
                          id="name"
                          value={name}
                          onChange={(event) => setName(event.target.value)}
                          className="border-white/10 bg-slate-900/60 text-white"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-200" htmlFor="phone">Teléfono</Label>
                        <Input
                          id="phone"
                          value={phone}
                          onChange={(event) => setPhone(event.target.value)}
                          className="border-white/10 bg-slate-900/60 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-200" htmlFor="documentId">Documento</Label>
                        <Input
                          id="documentId"
                          value={documentId}
                          onChange={(event) => setDocumentId(event.target.value)}
                          className="border-white/10 bg-slate-900/60 text-white"
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={savingPersonal}
                        className="bg-orange-500 text-slate-950 hover:bg-orange-400 md:col-span-2"
                      >
                        {savingPersonal ? "Guardando..." : "Guardar datos"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

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
                      <div className="space-y-2 md:col-span-2">
                        <Label className="text-slate-200">Servicios que presta</Label>
                        <div className="grid gap-2 md:grid-cols-2">
                          {serviceTypes?.map((service) => {
                            const isChecked = selectedServiceIds.includes(service.id) ||
                              (!!profile?.services?.some((item) => item.serviceType.id === service.id) && selectedServiceIds.length === 0);
                            return (
                              <label
                                key={service.id}
                                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                                  isChecked
                                    ? "border-orange-400/60 bg-orange-500/20 text-orange-100"
                                    : "border-white/10 bg-slate-900/40 text-slate-200"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => toggleService(service.id)}
                                  className="accent-orange-400"
                                />
                                {service.name}
                              </label>
                            );
                          })}
                        </div>
                        {!serviceTypes?.length && (
                          <p className="text-xs text-slate-400">No hay servicios configurados aún.</p>
                        )}
                      </div>
                      <Button type="submit" disabled={savingProfile} className="bg-orange-500 text-slate-950 hover:bg-orange-400 md:col-span-2">
                        {savingProfile ? "Guardando..." : "Guardar perfil"}
                      </Button>
                      {profile?.documentUrl && (
                        <a className="text-sm text-slate-200 underline md:col-span-2" href={profile.documentUrl} target="_blank">
                          Ver documento actual
                        </a>
                      )}
                    </form>
                  </CardContent>
                </Card>

                <Card className="border-white/10 bg-white/5 text-white">
                  <CardHeader>
                    <CardTitle className="text-white">Direcciones</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <form className="grid gap-4 md:grid-cols-2" onSubmit={handleAddAddress}>
                      <div className="space-y-2">
                        <Label className="text-slate-200" htmlFor="addrLabel">Etiqueta</Label>
                        <Input
                          id="addrLabel"
                          value={addrLabel}
                          onChange={(event) => setAddrLabel(event.target.value)}
                          className="border-white/10 bg-slate-900/60 text-white"
                          placeholder="Casa / Trabajo"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-200" htmlFor="street">Calle</Label>
                        <Input
                          id="street"
                          value={street}
                          onChange={(event) => setStreet(event.target.value)}
                          className="border-white/10 bg-slate-900/60 text-white"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-200" htmlFor="city">Ciudad</Label>
                        <Input
                          id="city"
                          value={city}
                          onChange={(event) => setCity(event.target.value)}
                          className="border-white/10 bg-slate-900/60 text-white"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-200" htmlFor="state">Estado</Label>
                        <Input
                          id="state"
                          value={state}
                          onChange={(event) => setState(event.target.value)}
                          className="border-white/10 bg-slate-900/60 text-white"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-200" htmlFor="postal">Código postal</Label>
                        <Input
                          id="postal"
                          value={postalCode}
                          onChange={(event) => setPostalCode(event.target.value)}
                          className="border-white/10 bg-slate-900/60 text-white"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-200" htmlFor="country">País</Label>
                        <Input
                          id="country"
                          value={country}
                          onChange={(event) => setCountry(event.target.value)}
                          className="border-white/10 bg-slate-900/60 text-white"
                          required
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label className="text-slate-200" htmlFor="reference">Referencia</Label>
                        <Input
                          id="reference"
                          value={reference}
                          onChange={(event) => setReference(event.target.value)}
                          className="border-white/10 bg-slate-900/60 text-white"
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={savingAddress}
                        className="bg-white/10 text-white hover:bg-white/20 md:col-span-2"
                      >
                        {savingAddress ? "Guardando..." : "Agregar dirección"}
                      </Button>
                    </form>

                    <div className="grid gap-3">
                      {addresses?.map((item) => (
                        <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-slate-900/40 p-3 text-sm text-slate-200">
                          <div>
                            <p className="font-semibold text-white">{item.label ?? "Dirección"}</p>
                            <p>{formatAddress(item)}</p>
                            {item.reference && <p className="text-xs text-slate-400">{item.reference}</p>}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={item.isPrimary ? "rounded-full bg-orange-500/20 px-3 py-1 text-xs text-orange-200" : "rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200"}>
                              {item.isPrimary ? "Principal" : "Secundaria"}
                            </span>
                            {!item.isPrimary && (
                              <Button
                                variant="default"
                                size="sm"
                                className="bg-white/10 text-white hover:bg-white/20"
                                onClick={() => handleSetPrimary(item.id)}
                              >
                                Hacer principal
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                      {!addresses?.length && <p className="text-slate-400">Aún no tienes direcciones guardadas.</p>}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para agregar notas al finalizar */}
      {selectedServiceIdForNotes ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-950 text-white shadow-2xl shadow-black/40">
            <div className="p-6">
              <div className="mb-4">
                <h2 className="text-lg font-semibold">Finalizar servicio</h2>
                <p className="text-sm text-slate-400">Agrega notas sobre el trabajo realizado (opcional).</p>
              </div>

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej: Se revisó el motor, se reemplazó filtro de aire, afinamiento completo..."
                className="min-h-24 w-full rounded-md border border-white/10 bg-slate-900/60 px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400 mb-4"
              />

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="default"
                  className="flex-1 bg-white/10 text-white hover:bg-white/20"
                  onClick={() => {
                    setSelectedServiceIdForNotes(null);
                    setNotes("");
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  className="flex-1 bg-orange-500 text-slate-950 hover:bg-orange-400"
                  onClick={async () => {
                    const loadingToast = toast.loading("Finalizando servicio...");
                    try {
                      const res = await fetch(`/api/service-requests/${selectedServiceIdForNotes}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ status: "FINALIZADO", notes }),
                      });
                      if (res.ok) {
                        toast.success("✅ Servicio finalizado exitosamente", { id: loadingToast });
                        refreshAssigned();
                        setSelectedServiceIdForNotes(null);
                        setNotes("");
                      } else {
                        const data = await res.json();
                        toast.error(data.message || "Error al finalizar", { id: loadingToast });
                      }
                    } catch (error) {
                      toast.error("Error al finalizar servicio", { id: loadingToast });
                    }
                  }}
                >
                  Finalizar y guardar
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Modal para ver info del cliente */}
      {selectedClientId && assigned?.find((s) => s.clientId === selectedClientId) ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-950 text-white shadow-2xl shadow-black/40">
            <div className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Información del cliente</h2>
                <Button
                  type="button"
                  variant="default"
                  className="h-8 w-8 p-0 bg-white/10 text-white hover:bg-white/20"
                  onClick={() => setSelectedClientId(null)}
                >
                  ✕
                </Button>
              </div>

              {assigned
                ?.find((s) => s.clientId === selectedClientId)
                ?.client && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-xs text-slate-400">Nombre</p>
                    <p className="text-sm font-semibold">
                      {assigned.find((s) => s.clientId === selectedClientId)?.client?.name}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-400">Teléfono</p>
                    <p className="text-sm font-semibold">
                      {assigned.find((s) => s.clientId === selectedClientId)?.client?.phone ||
                        "No registrado"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-400">Email</p>
                    <p className="text-sm font-semibold">
                      {assigned.find((s) => s.clientId === selectedClientId)?.client?.email}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-400">Documento</p>
                    <p className="text-sm font-semibold">
                      {assigned.find((s) => s.clientId === selectedClientId)?.client?.documentId ||
                        "No registrado"}
                    </p>
                  </div>
                </div>
              )}

              <Button
                type="button"
                className="mt-6 w-full bg-orange-500 text-slate-950 hover:bg-orange-400"
                onClick={() => setSelectedClientId(null)}
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}