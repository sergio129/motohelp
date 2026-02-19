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
  caseNumber: string;
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
  const [profileTab, setProfileTab] = useState<"personal" | "professional" | "addresses">("personal");
  const [addressesSubTab, setAddressesSubTab] = useState<"list" | "add">("list");
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [deletingAddressId, setDeletingAddressId] = useState<string | null>(null);

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

  async function handleSaveProfile(event: React.FormEvent) {
    event.preventDefault();
    setSavingProfile(true);
    const loadingToast = toast.loading("Guardando información...");

    try {
      // Guardar datos personales
      const personalRes = await fetch("/api/profile/mechanic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone: phone || undefined,
          documentId: documentId || undefined,
        }),
      });

      if (!personalRes.ok) {
        const error = await personalRes.json();
        throw new Error(error.message || "Error al guardar datos personales");
      }

      // Guardar datos profesionales si hay datos
      if (experienceYears || specialty || selectedServiceIds.length > 0 || document) {
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

        const profileRes = await fetch("/api/mechanic-profile", {
          method: "POST",
          body: formData,
        });

        if (!profileRes.ok) {
          const error = await profileRes.json();
          throw new Error(error.message || "Error al guardar perfil profesional");
        }
      }

      // Guardar dirección si hay datos y estamos en el tab de addresses
      if (profileTab === "addresses" && street && city && state && postalCode && country) {
        const addressRes = await fetch("/api/addresses", {
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

        if (!addressRes.ok) {
          const error = await addressRes.json();
          throw new Error(error.message || "Error al guardar dirección");
        }

        // Limpiar campos de dirección después de guardar exitosamente
        setAddrLabel("");
        setStreet("");
        setCity("");
        setState("");
        setPostalCode("");
        setCountry("");
        setReference("");
      }

      toast.success("✅ Información guardada exitosamente", { id: loadingToast });
      
      // Refrescar todos los datos
      refreshProfile?.();
      refreshPersonal?.();
      refreshAddresses?.();
      
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error al guardar";
      toast.error(message, { id: loadingToast });
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleAddAddress(event?: React.FormEvent) {
    event?.preventDefault();
    setSavingAddress(true);

    try {
      const endpoint = editingAddressId ? "/api/addresses" : "/api/addresses";
      const method = editingAddressId ? "PUT" : "POST";
      const body = editingAddressId
        ? JSON.stringify({
            id: editingAddressId,
            label: addrLabel || undefined,
            street,
            city,
            state,
            postalCode,
            country,
            reference: reference || undefined,
          })
        : JSON.stringify({
            label: addrLabel || undefined,
            street,
            city,
            state,
            postalCode,
            country,
            reference: reference || undefined,
          });

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body,
      });

      if (res.ok) {
        setAddrLabel("");
        setStreet("");
        setCity("");
        setState("");
        setPostalCode("");
        setCountry("");
        setReference("");
        setEditingAddressId(null);
        toast.success(editingAddressId ? "✅ Dirección actualizada" : "✅ Dirección guardada exitosamente");
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

  function handleEditAddress(addr: Address) {
    setAddrLabel(addr.label || "");
    setStreet(addr.street);
    setCity(addr.city);
    setState(addr.state);
    setPostalCode(addr.postalCode);
    setCountry(addr.country);
    setReference(addr.reference || "");
    setEditingAddressId(addr.id);
  }

  function handleCancelEdit() {
    setAddrLabel("");
    setStreet("");
    setCity("");
    setState("");
    setPostalCode("");
    setCountry("");
    setReference("");
    setEditingAddressId(null);
  }

  async function handleDeleteAddress(id: string) {
    setDeletingAddressId(id);
  }

  async function confirmDeleteAddress() {
    if (!deletingAddressId) return;

    try {
      const res = await fetch("/api/addresses", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deletingAddressId }),
      });

      if (res.ok) {
        toast.success("✅ Dirección eliminada");
        refreshAddresses();
        setDeletingAddressId(null);
      } else {
        const data = await res.json();
        toast.error(data.message || "Error al eliminar dirección");
      }
    } catch (error) {
      toast.error("Error al eliminar dirección");
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

  function toggleService(serviceId: string) {
    setSelectedServiceIds((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  }

  function formatAddress(addr: Address): string {
    return `${addr.street}, ${addr.city}, ${addr.state}, ${addr.postalCode}, ${addr.country}`;
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
                <p className="text-xs text-slate-300">🧾 Caso: {item.caseNumber}</p>
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
                  <p className="text-xs text-slate-400">🧾 Caso: {item.caseNumber}</p>
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
                <table className="w-full text-base">
                  <thead className="border-b border-white/10 bg-white/5">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold text-slate-200">Caso</th>
                      <th className="px-6 py-4 text-left font-semibold text-slate-200">Servicio</th>
                      <th className="px-6 py-4 text-left font-semibold text-slate-200">Descripción</th>
                      <th className="px-6 py-4 text-left font-semibold text-slate-200">Dirección</th>
                      <th className="px-6 py-4 text-center font-semibold text-slate-200">Estado</th>
                      <th className="px-6 py-4 text-center font-semibold text-slate-200">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {assigned
                      ?.filter((item) => ["FINALIZADO", "CANCELADO"].includes(item.status))
                      .map((item) => (
                      <tr key={item.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs text-orange-300">{item.caseNumber}</td>
                        <td className="px-6 py-4 font-medium text-white">{item.serviceType?.name ?? "Servicio"}</td>
                        <td className="px-6 py-4 text-slate-300">{item.description}</td>
                        <td className="px-6 py-4 text-slate-300 text-sm">{item.address}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={statusBadge(item.status)}>{formatStatus(item.status)}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Button 
                            variant="default" 
                            size="sm" 
                            className="bg-slate-700/50 text-slate-200 hover:bg-slate-700 text-sm" 
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
          <div className="w-full max-w-4xl max-h-[95vh] overflow-hidden rounded-2xl border border-white/10 bg-slate-950 text-white shadow-2xl shadow-black/40">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 sm:px-6 py-4">
                <div>
                  <h2 className="text-xl font-semibold">Editar perfil</h2>
                  <p className="text-sm text-slate-400">Actualiza tu información, especialidad y direcciones</p>
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

              {/* Tabs */}
              <div className="flex border-b border-white/10 px-5 sm:px-6">
                <button
                  onClick={() => setProfileTab("personal")}
                  className={`px-4 py-3 text-sm font-medium transition-colors ${
                    profileTab === "personal"
                      ? "border-b-2 border-orange-500 text-white"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Información Personal
                </button>
                <button
                  onClick={() => setProfileTab("professional")}
                  className={`px-4 py-3 text-sm font-medium transition-colors ${
                    profileTab === "professional"
                      ? "border-b-2 border-orange-500 text-white"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Datos Profesionales
                </button>
                <button
                  onClick={() => setProfileTab("addresses")}
                  className={`px-4 py-3 text-sm font-medium transition-colors ${
                    profileTab === "addresses"
                      ? "border-b-2 border-orange-500 text-white"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Direcciones
                </button>
              </div>

              {/* Content - Scrolleablo */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-5 sm:p-6">
                  {profileTab === "personal" && (
                    <form className="grid gap-4 md:grid-cols-2">
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
                    </form>
                  )}

                  {profileTab === "professional" && (
                    <form className="space-y-6">
                      <div className="grid gap-4 md:grid-cols-2">
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
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-200" htmlFor="document">Documento (PDF o imagen)</Label>
                        <Input
                          id="document"
                          type="file"
                          accept=".pdf,image/png,image/jpeg"
                          className="border-white/10 bg-slate-900/60 text-white"
                          onChange={(event) => setDocument(event.target.files?.[0] ?? null)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-200">Servicios que presta</Label>
                        <div className="grid gap-2 md:grid-cols-2">
                          {serviceTypes?.map((service) => {
                            const isChecked = selectedServiceIds.includes(service.id) ||
                              (!!profile?.services?.some((item) => item.serviceType.id === service.id) && selectedServiceIds.length === 0);
                            return (
                              <label
                                key={service.id}
                                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm cursor-pointer transition-colors ${
                                  isChecked
                                    ? "border-orange-400/60 bg-orange-500/20 text-orange-100"
                                    : "border-white/10 bg-slate-900/40 text-slate-200 hover:border-white/20"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => toggleService(service.id)}
                                  className="rounded"
                                />
                                {service.name}
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </form>
                  )}

                  {profileTab === "addresses" && (
                    <div className="space-y-4">
                      {/* Sub-tabs para direcciones */}
                      <div className="flex gap-2 border-b border-white/10">
                        <button
                          onClick={() => setAddressesSubTab("list")}
                          className={`px-4 py-2 text-sm font-medium transition-colors ${
                            addressesSubTab === "list"
                              ? "border-b-2 border-orange-500 text-white"
                              : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          Ver direcciones
                        </button>
                        <button
                          onClick={() => setAddressesSubTab("add")}
                          className={`px-4 py-2 text-sm font-medium transition-colors ${
                            addressesSubTab === "add"
                              ? "border-b-2 border-orange-500 text-white"
                              : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          {editingAddressId ? "Editar dirección" : "Agregar dirección"}
                        </button>
                      </div>

                      {/* Sub-tab: Ver direcciones */}
                      {addressesSubTab === "list" && (
                        <div className="space-y-3">
                          <h3 className="font-semibold text-white">Mis direcciones</h3>
                        {addresses?.length ? (
                          <div className="overflow-x-auto rounded-lg border border-white/10 bg-white/[0.02]">
                            <table className="w-full text-sm">
                              <thead className="border-b border-white/10 bg-white/5">
                                <tr>
                                  <th className="px-4 py-3 text-left font-semibold text-slate-300">Etiqueta</th>
                                  <th className="px-4 py-3 text-left font-semibold text-slate-300">Dirección</th>
                                  <th className="px-4 py-3 text-center font-semibold text-slate-300">Estado</th>
                                  <th className="px-4 py-3 text-center font-semibold text-slate-300">Acciones</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/10">
                                {addresses.map((item) => (
                                  <tr key={item.id} className="hover:bg-white/[0.05] transition-colors">
                                    <td className="px-4 py-3">{item.label || "Dirección"}</td>
                                    <td className="px-4 py-3 text-slate-400">{formatAddress(item)}</td>
                                    <td className="px-4 py-3 text-center">
                                      {item.isPrimary && (
                                        <span className="inline-block rounded-full bg-orange-500/30 px-2 py-1 text-xs font-semibold text-orange-200">
                                          Principal
                                        </span>
                                      )}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                      <div className="flex items-center justify-center gap-2">
                                        {!item.isPrimary && (
                                          <Button
                                            type="button"
                                            size="sm"
                                            onClick={() => handleSetPrimary(item.id)}
                                            className="text-xs bg-white/5 text-slate-300 hover:bg-white/10"
                                          >
                                            Usar principal
                                          </Button>
                                        )}
                                        <Button
                                          type="button"
                                          size="sm"
                                          onClick={() => handleEditAddress(item)}
                                          className="text-xs bg-white/5 text-slate-300 hover:bg-white/10"
                                        >
                                          Editar
                                        </Button>
                                        <Button
                                          type="button"
                                          size="sm"
                                          onClick={() => handleDeleteAddress(item.id)}
                                          className="text-xs bg-red-500/20 text-red-300 hover:bg-red-500/30"
                                        >
                                          Eliminar
                                        </Button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="rounded-lg border border-dashed border-white/10 bg-white/[0.02] p-6 text-center">
                            <p className="text-sm text-slate-400">
                              📍 Aún no tienes direcciones guardadas. ¡Agrega una abajo!
                            </p>
                          </div>
                        )}
                        </div>
                      )}

                      {/* Sub-tab: Agregar/Editar dirección */}
                      {addressesSubTab === "add" && (
                        <div className="space-y-4">
                          <div className="flex items-start gap-2">
                            <div className="mt-1 flex-shrink-0">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/20 text-orange-300">
                                {editingAddressId ? "✎" : "+"}
                              </div>
                            </div>
                            <div>
                              <h3 className="font-semibold text-white">
                                {editingAddressId ? "Editar dirección" : "Agregar nueva dirección"}
                              </h3>
                              <p className="text-xs text-slate-400">Completa los datos y guarda</p>
                            </div>
                          </div>

                          <form className="space-y-3 rounded-xl border border-white/10 bg-gradient-to-br from-slate-900/50 to-slate-950 p-4">
                          <div className="grid gap-2 md:grid-cols-2">
                            <div className="space-y-1">
                              <Label className="text-xs font-semibold text-slate-300 uppercase" htmlFor="addrLabel">Etiqueta</Label>
                              <Input
                                id="addrLabel"
                                value={addrLabel}
                                onChange={(event) => setAddrLabel(event.target.value)}
                                className="border-white/10 bg-slate-900/40 text-xs text-white placeholder-slate-500"
                                placeholder="ej: Casa, Taller, Oficina"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs font-semibold text-slate-300 uppercase" htmlFor="street">Calle *</Label>
                              <Input
                                id="street"
                                value={street}
                                onChange={(event) => setStreet(event.target.value)}
                                className="border-white/10 bg-slate-900/40 text-xs text-white"
                                required
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs font-semibold text-slate-300 uppercase" htmlFor="city">Ciudad *</Label>
                              <Input
                                id="city"
                                value={city}
                                onChange={(event) => setCity(event.target.value)}
                                className="border-white/10 bg-slate-900/40 text-xs text-white"
                                required
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs font-semibold text-slate-300 uppercase" htmlFor="state">Estado *</Label>
                              <Input
                                id="state"
                                value={state}
                                onChange={(event) => setState(event.target.value)}
                                className="border-white/10 bg-slate-900/40 text-xs text-white"
                                required
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs font-semibold text-slate-300 uppercase" htmlFor="postal">Código postal *</Label>
                              <Input
                                id="postal"
                                value={postalCode}
                                onChange={(event) => setPostalCode(event.target.value)}
                                className="border-white/10 bg-slate-900/40 text-xs text-white"
                                required
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs font-semibold text-slate-300 uppercase" htmlFor="country">País *</Label>
                              <Input
                                id="country"
                                value={country}
                                onChange={(event) => setCountry(event.target.value)}
                                className="border-white/10 bg-slate-900/40 text-xs text-white"
                                required
                              />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs font-semibold text-slate-300 uppercase" htmlFor="reference">Referencia (opcional)</Label>
                            <Input
                              id="reference"
                              value={reference}
                              onChange={(event) => setReference(event.target.value)}
                              placeholder="ej: Puerta azul, Apto 301"
                              className="border-white/10 bg-slate-900/40 text-xs text-white placeholder-slate-500"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              onClick={() => {
                                if (street && city && state && postalCode && country) {
                                  handleAddAddress();
                                }
                              }}
                              disabled={savingAddress}
                              className="flex-1 bg-orange-500 text-slate-950 hover:bg-orange-400 font-semibold disabled:opacity-50"
                            >
                              {savingAddress ? "Guardando..." : editingAddressId ? "Actualizar dirección" : "+ Agregar dirección"}
                            </Button>
                            {editingAddressId && (
                              <Button
                                type="button"
                                onClick={handleCancelEdit}
                                className="bg-white/10 text-white hover:bg-white/20"
                              >
                                Cancelar
                              </Button>
                            )}
                          </div>
                        </form>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer con botones - Sticky */}
              <div className="sticky bottom-0 border-t border-white/10 px-5 sm:px-6 py-4 flex gap-3 justify-end bg-slate-950">
                <Button
                  type="button"
                  variant="default"
                  className="bg-white/10 text-white hover:bg-white/20"
                  onClick={() => setIsProfileOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                  className="bg-orange-500 text-slate-950 hover:bg-orange-400 disabled:opacity-50"
                >
                  {savingProfile ? "Guardando..." : "Guardar cambios"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación para eliminar dirección */}
      {deletingAddressId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-slate-950 text-white shadow-2xl shadow-black/40 p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Eliminar dirección</h3>
                <p className="text-sm text-slate-400 mt-1">¿Estás seguro de que deseas eliminar esta dirección? Esta acción no se puede deshacer.</p>
              </div>
              <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
                <Button
                  type="button"
                  variant="default"
                  className="bg-white/10 text-white hover:bg-white/20"
                  onClick={() => setDeletingAddressId(null)}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={confirmDeleteAddress}
                  className="bg-red-500 text-white hover:bg-red-600"
                >
                  Eliminar
                </Button>
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