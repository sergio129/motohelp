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
import { RatingComponent } from "@/components/RatingComponent";

type ServiceRequest = {
  id: string;
  description: string;
  address: string;
  status: string;
  createdAt: string;
  serviceType?: { id: string; name: string } | null;
  mechanicId?: string | null;
  review?: { id: string; rating: number; comment: string } | null;
};

type ServiceRequestDetail = ServiceRequest & {
  mechanic?: { id: string; name: string; phone?: string } | null;
  notes?: string | null;
  statusHistory?: Array<{ previousStatus: string; newStatus: string; changedAt: string }>;
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

type ClientProfileResponse = {
  user: { name: string; phone?: string | null; documentId?: string | null } | null;
  profile: {
    motoBrand?: string | null;
    motoModel?: string | null;
    motoYear?: number | null;
    motoPlate?: string | null;
    motoColor?: string | null;
  } | null;
};

export default function ClientDashboard() {
  // Estados primero
  const [serviceTypeId, setServiceTypeId] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [documentId, setDocumentId] = useState("");
  const [motoBrand, setMotoBrand] = useState("");
  const [motoModel, setMotoModel] = useState("");
  const [motoYear, setMotoYear] = useState("");
  const [motoPlate, setMotoPlate] = useState("");
  const [motoColor, setMotoColor] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [addrLabel, setAddrLabel] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");
  const [reference, setReference] = useState("");
  const [savingAddress, setSavingAddress] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [selectedServiceIdForRating, setSelectedServiceIdForRating] = useState<string | null>(null);
  const [selectedServiceIdForDetails, setSelectedServiceIdForDetails] = useState<string | null>(null);
  const [profileTab, setProfileTab] = useState<"personal" | "addresses">("personal");

  // SWR Hooks
  const { data, mutate } = useSWR<ServiceRequest[]>("/api/service-requests", fetcher);
  const { data: serviceTypes } = useSWR<ServiceType[]>("/api/service-types", fetcher);
  const { data: profileData, mutate: refreshProfile } = useSWR<ClientProfileResponse>(
    "/api/profile/client",
    fetcher
  );
  const { data: addresses, mutate: refreshAddresses } = useSWR<Address[]>(
    "/api/addresses",
    fetcher
  );
  const { data: selectedServiceDetails } = useSWR<ServiceRequestDetail>(
    selectedServiceIdForDetails ? `/api/service-requests/${selectedServiceIdForDetails}` : null,
    fetcher
  );
  const primaryAddress = addresses?.find((item) => item.isPrimary) ?? null;
  const primaryAddressText = primaryAddress ? formatAddress(primaryAddress) : "";

  useEffect(() => {
    if (profileData?.user) {
      setName((prev) => prev || profileData.user?.name || "");
      setPhone((prev) => prev || profileData.user?.phone || "");
      setDocumentId((prev) => prev || profileData.user?.documentId || "");
    }
    if (profileData?.profile) {
      setMotoBrand((prev) => prev || profileData.profile?.motoBrand || "");
      setMotoModel((prev) => prev || profileData.profile?.motoModel || "");
      setMotoYear((prev) => prev || (profileData.profile?.motoYear?.toString() ?? ""));
      setMotoPlate((prev) => prev || profileData.profile?.motoPlate || "");
      setMotoColor((prev) => prev || profileData.profile?.motoColor || "");
    }
  }, [profileData]);

  useEffect(() => {
    if (!address && addresses?.length) {
      const primary = addresses.find((item) => item.isPrimary) ?? addresses[0];
      setAddress(formatAddress(primary));
      setSelectedAddressId(primary?.id ?? "");
    }
  }, [addresses, address]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    const loadingToast = toast.loading("Creando solicitud...");

    try {
      const res = await fetch("/api/service-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceTypeId, description, address, scheduledAt }),
      });

      if (res.ok) {
        toast.success("¡Solicitud creada! Los mecánicos la verán pronto", { id: loadingToast });
        setServiceTypeId("");
        setDescription("");
        setAddress("");
        setScheduledAt("");
        setSelectedAddressId("");
        setIsRequestOpen(false);
        mutate();
      } else {
        // Leer el mensaje de error del servidor
        const errorData = await res.json().catch(() => ({ message: "Error al crear solicitud" }));
        toast.error(errorData.message || "Error al crear solicitud", { id: loadingToast });
      }
    } catch {
      toast.error("Error al crear solicitud", { id: loadingToast });
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveProfile(event: React.FormEvent) {
    event.preventDefault();
    setSavingProfile(true);
    const loadingToast = toast.loading("Guardando información...");

    try {
      // Guardar datos personales
      const personalRes = await fetch("/api/profile/client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone: phone || undefined,
          documentId: documentId || undefined,
          motoBrand: motoBrand || undefined,
          motoModel: motoModel || undefined,
          motoYear: motoYear ? Number(motoYear) : undefined,
          motoPlate: motoPlate || undefined,
          motoColor: motoColor || undefined,
        }),
      });

      if (!personalRes.ok) {
        const error = await personalRes.json();
        throw new Error(error.message || "Error al guardar datos personales");
      }

      // Guardar dirección si hay datos
      if (street && city && state && postalCode && country) {
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

        setAddrLabel("");
        setStreet("");
        setCity("");
        setState("");
        setPostalCode("");
        setCountry("");
        setReference("");
      }

      toast.success("✅ Información guardada exitosamente", { id: loadingToast });
      refreshProfile();
      refreshAddresses();
      setIsProfileOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error al guardar";
      toast.error(message, { id: loadingToast });
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleAddAddress(event: React.FormEvent) {
    event.preventDefault();
    setSavingAddress(true);

    await fetch("/api/addresses", {
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

    setAddrLabel("");
    setStreet("");
    setCity("");
    setState("");
    setPostalCode("");
    setCountry("");
    setReference("");
    setSavingAddress(false);
    refreshAddresses();
  }

  async function handleSetPrimary(id: string) {
    await fetch("/api/addresses", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    refreshAddresses();
  }

  function formatAddress(item: Address) {
    return `${item.street}, ${item.city}, ${item.state} ${item.postalCode}, ${item.country}`;
  }

  async function handleCancel(id: string) {
    const loadingToast = toast.loading("Cancelando solicitud...");
    try {
      const res = await fetch(`/api/service-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELADO" }),
      });
      if (res.ok) {
        toast.success("Solicitud cancelada", { id: loadingToast });
        mutate();
      } else {
        toast.error("Error al cancelar", { id: loadingToast });
      }
    } catch {
      toast.error("Error al cancelar", { id: loadingToast });
    }
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
            <h1 className="text-3xl font-semibold text-white">Panel de cliente</h1>
            <p className="text-slate-300">Crea solicitudes y revisa el historial.</p>
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
            <CardTitle className="text-white">Perfil del cliente</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-500/20 text-lg font-semibold text-orange-200">
                {(name || "C").slice(0, 1).toUpperCase()}
              </div>
              <div>
                <p className="text-lg font-semibold text-white">{name || "Cliente"}</p>
                <p className="text-sm text-slate-300">{phone || "Sin teléfono"}</p>
                <p className="text-xs text-slate-400">{addresses?.find((item) => item.isPrimary)?.label ?? "Sin dirección principal"}</p>
              </div>
            </div>
            <Button
              type="button"
              variant="default"
              className="bg-white/10 text-white hover:bg-white/20"
              onClick={() => setIsProfileOpen(true)}
            >
              Editar perfil
            </Button>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5 text-white">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 py-6">
            <div>
              <p className="text-lg font-semibold text-white">Nueva solicitud</p>
              <p className="text-sm text-slate-300">
                {data?.some((s) => ["PENDIENTE", "ACEPTADO", "EN_CAMINO", "EN_PROCESO"].includes(s.status))
                  ? "⏳ Tienes un servicio activo. Complétalo o cancélalo para crear uno nuevo."
                  : "Abre el formulario y completa los datos del servicio."}
              </p>
            </div>
            <Button
              type="button"
              className="bg-orange-500 text-slate-950 hover:bg-orange-400 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed"
              onClick={() => setIsRequestOpen(true)}
              disabled={data?.some((s) => ["PENDIENTE", "ACEPTADO", "EN_CAMINO", "EN_PROCESO"].includes(s.status)) ?? false}
            >
              Nueva solicitud
            </Button>
          </CardContent>
        </Card>

        {/* SERVICIOS ACTIVOS */}
        <section className="grid gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20">
              <span className="text-lg">⚙️</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Servicios activos</h2>
              <p className="text-xs text-slate-400">Servicios en progreso</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {data
              ?.filter((item) => ["PENDIENTE", "ACEPTADO", "EN_CAMINO", "EN_PROCESO"].includes(item.status))
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
                    {item.status === "PENDIENTE" && (
                      <Button
                        variant="default"
                        size="sm"
                        className="bg-white/10 text-white hover:bg-white/20"
                        onClick={() => handleCancel(item.id)}
                      >
                        Cancelar
                      </Button>
                    )}
                    <Button
                      variant="default"
                      size="sm"
                      className="bg-orange-500/20 text-orange-300 hover:bg-orange-500/30"
                      onClick={() => setSelectedServiceIdForDetails(item.id)}
                    >
                      Ver detalles
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {!data?.filter((item) => ["PENDIENTE", "ACEPTADO", "EN_CAMINO", "EN_PROCESO"].includes(item.status)).length && (
              <p className="text-slate-400 md:col-span-2">No tienes servicios activos en este momento.</p>
            )}
          </div>
        </section>

        {/* HISTORIAL DE SERVICIOS - Tabla */}
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

          {data?.filter((item) => ["FINALIZADO", "CANCELADO"].includes(item.status)).length ? (
            <Card className="border-white/10 bg-white/5 text-white overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-base">
                  <thead className="border-b border-white/10 bg-white/5">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold text-slate-200">Servicio</th>
                      <th className="px-6 py-4 text-left font-semibold text-slate-200">Descripción</th>
                      <th className="px-6 py-4 text-left font-semibold text-slate-200">Dirección</th>
                      <th className="px-6 py-4 text-center font-semibold text-slate-200">Estado</th>
                      <th className="px-6 py-4 text-center font-semibold text-slate-200">Calificación</th>
                      <th className="px-6 py-4 text-center font-semibold text-slate-200">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {data
                      ?.filter((item) => ["FINALIZADO", "CANCELADO"].includes(item.status))
                      .map((item) => (
                      <tr key={item.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 font-medium text-white">{item.serviceType?.name ?? "Servicio"}</td>
                        <td className="px-6 py-4 text-slate-300">{item.description}</td>
                        <td className="px-6 py-4 text-slate-300 text-sm">{item.address}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={statusBadge(item.status)}>{formatStatus(item.status)}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {item.review ? (
                            <span className="text-sm bg-orange-500/20 text-orange-300 px-3 py-1 rounded inline-flex items-center gap-1">
                              ⭐ {item.review.rating}/5
                            </span>
                          ) : (
                            <span className="text-sm text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Button
                            variant="default"
                            size="sm"
                            className="bg-orange-500/20 text-orange-300 hover:bg-orange-500/30 text-sm"
                            onClick={() => setSelectedServiceIdForDetails(item.id)}
                          >
                            Ver detalles
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
          <div className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl border border-white/10 bg-slate-950 text-white shadow-2xl shadow-black/40">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 sm:px-6 py-4">
                <div>
                  <h2 className="text-xl font-semibold">Editar perfil</h2>
                  <p className="text-sm text-slate-400">Actualiza tu información personal y direcciones</p>
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
                      <div className="space-y-2">
                        <Label className="text-slate-200" htmlFor="motoBrand">Marca</Label>
                        <Input
                          id="motoBrand"
                          value={motoBrand}
                          onChange={(event) => setMotoBrand(event.target.value)}
                          className="border-white/10 bg-slate-900/60 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-200" htmlFor="motoModel">Modelo</Label>
                        <Input
                          id="motoModel"
                          value={motoModel}
                          onChange={(event) => setMotoModel(event.target.value)}
                          className="border-white/10 bg-slate-900/60 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-200" htmlFor="motoYear">Año</Label>
                        <Input
                          id="motoYear"
                          type="number"
                          value={motoYear}
                          onChange={(event) => setMotoYear(event.target.value)}
                          className="border-white/10 bg-slate-900/60 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-200" htmlFor="motoPlate">Placa</Label>
                        <Input
                          id="motoPlate"
                          value={motoPlate}
                          onChange={(event) => setMotoPlate(event.target.value)}
                          className="border-white/10 bg-slate-900/60 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-200" htmlFor="motoColor">Color</Label>
                        <Input
                          id="motoColor"
                          value={motoColor}
                          onChange={(event) => setMotoColor(event.target.value)}
                          className="border-white/10 bg-slate-900/60 text-white"
                        />
                      </div>
                    </form>
                  )}

                  {profileTab === "addresses" && (
                    <div className="space-y-4">
                      <div className="mb-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                        <p className="text-sm text-blue-200">
                          <strong>Agregar nueva dirección:</strong> Completa los datos y se agregará a tu lista de direcciones.
                        </p>
                      </div>

                      <form className="grid gap-4 md:grid-cols-2 bg-slate-900/40 rounded-lg p-4 border border-white/10">
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
                      </form>

                      <div className="mt-6">
                        <h3 className="text-sm font-semibold text-white mb-3">Tus direcciones guardadas</h3>
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
                                    type="button"
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
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer con botones */}
              <div className="border-t border-white/10 px-5 sm:px-6 py-4 flex gap-3 justify-end">
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

      {isRequestOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl border border-white/10 bg-slate-950 text-white shadow-2xl shadow-black/40">
            <div className="max-h-[90vh] overflow-y-auto p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">Nueva solicitud</h2>
                  <p className="text-sm text-slate-400">Usa tu dirección principal o escribe una nueva.</p>
                </div>
                <Button
                  type="button"
                  variant="default"
                  className="bg-white/10 text-white hover:bg-white/20"
                  onClick={() => setIsRequestOpen(false)}
                >
                  Cerrar
                </Button>
              </div>

              <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label className="text-slate-200" htmlFor="serviceType">Tipo de servicio</Label>
                  <select
                    id="serviceType"
                    value={serviceTypeId}
                    onChange={(event) => setServiceTypeId(event.target.value)}
                    className="flex h-10 w-full rounded-md border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white"
                    required
                  >
                    <option value="" disabled>
                      Selecciona un servicio
                    </option>
                    {serviceTypes?.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-200" htmlFor="scheduledAt">Fecha y hora</Label>
                  <Input
                    id="scheduledAt"
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(event) => setScheduledAt(event.target.value)}
                    className="border-white/10 bg-slate-900/60 text-white"
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-slate-200" htmlFor="description">Descripción</Label>
                  <Input
                    id="description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    className="border-white/10 bg-slate-900/60 text-white"
                    required
                  />
                </div>
                {addresses?.length ? (
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-slate-200" htmlFor="addressSaved">Dirección guardada</Label>
                    <select
                      id="addressSaved"
                      value={selectedAddressId}
                      onChange={(event) => {
                        const nextId = event.target.value;
                        setSelectedAddressId(nextId);
                        const found = addresses.find((item) => item.id === nextId);
                        setAddress(found ? formatAddress(found) : "");
                      }}
                      className="flex h-10 w-full rounded-md border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white"
                    >
                      <option value="">Elegir dirección guardada</option>
                      {addresses?.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.label ?? "Dirección"}{item.isPrimary ? " (principal)" : ""}
                        </option>
                      ))}
                    </select>
                    {primaryAddressText && (
                      <p className="text-xs text-slate-400">Principal: {primaryAddressText}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 md:col-span-2">No tienes dirección principal guardada. Puedes escribir una nueva aquí.</p>
                )}
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-slate-200" htmlFor="address">Dirección</Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(event) => {
                      setAddress(event.target.value);
                      if (selectedAddressId) {
                        setSelectedAddressId("");
                      }
                    }}
                    className="border-white/10 bg-slate-900/60 text-white"
                    required
                  />
                </div>
                <Button type="submit" disabled={loading} className="bg-orange-500 text-slate-950 hover:bg-orange-400 md:col-span-2">
                  {loading ? "Enviando..." : "Crear solicitud"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}

      {selectedServiceIdForDetails && selectedServiceDetails ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl border border-white/10 bg-slate-950 text-white shadow-2xl shadow-black/40">
            <div className="max-h-[90vh] overflow-y-auto p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-semibold">Detalles del servicio</h2>
                  <p className="text-sm text-slate-400">Información completa de tu solicitud.</p>
                </div>
                <Button
                  type="button"
                  variant="default"
                  className="bg-white/10 text-white hover:bg-white/20"
                  onClick={() => setSelectedServiceIdForDetails(null)}
                >
                  Cerrar
                </Button>
              </div>

              <div className="grid gap-4">
                {/* Información general */}
                <Card className="border-white/10 bg-white/5">
                  <CardHeader>
                    <CardTitle className="text-white">Servicio</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-slate-200">
                    <div>
                      <p className="text-xs text-slate-400">Tipo</p>
                      <p>{selectedServiceDetails?.serviceType?.name ?? "Sin especificar"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Descripción</p>
                      <p>{selectedServiceDetails?.description}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Dirección</p>
                      <p>{selectedServiceDetails?.address}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Estado</p>
                      <p className={statusBadge(selectedServiceDetails?.status || "PENDIENTE")}>{formatStatus(selectedServiceDetails?.status || "PENDIENTE")}</p>
                    </div>
                    {selectedServiceDetails?.notes && (
                      <div>
                        <p className="text-xs text-slate-400">Notas del mecánico</p>
                        <p>{selectedServiceDetails.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Mecánico asignado */}
                {selectedServiceDetails?.mechanic && (
                  <Card className="border-white/10 bg-white/5">
                    <CardHeader>
                      <CardTitle className="text-white">Mecánico asignado</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-slate-200">
                      <div>
                        <p className="text-xs text-slate-400">Nombre</p>
                        <p>{selectedServiceDetails.mechanic.name}</p>
                      </div>
                      {selectedServiceDetails.mechanic.phone && (
                        <div>
                          <p className="text-xs text-slate-400">Teléfono</p>
                          <p>{selectedServiceDetails.mechanic.phone}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Calificación */}
                {selectedServiceDetails?.review && (
                  <Card className="border-orange-400/30 bg-orange-500/10">
                    <CardHeader>
                      <CardTitle className="text-orange-200">Tu calificación</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-slate-200">
                      <div>
                        <p className="text-xs text-slate-400">Puntuación</p>
                        <p className="text-lg">⭐ {selectedServiceDetails.review.rating} / 5</p>
                      </div>
                      {selectedServiceDetails.review.comment && (
                        <div>
                          <p className="text-xs text-slate-400">Comentario</p>
                          <p>{selectedServiceDetails.review.comment}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Formulario de calificación */}
                {selectedServiceDetails?.status === "FINALIZADO" && !selectedServiceDetails?.review && (
                  <Card className="border-blue-500/30 bg-blue-500/10">
                    <CardHeader>
                      <CardTitle className="text-blue-200">Califica este servicio</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <RatingComponent
                        serviceId={selectedServiceDetails.id}
                        onSubmit={async (rating, comment) => {
                          const loadingToast = toast.loading("Guardando calificación...");
                          try {
                            const res = await fetch("/api/reviews", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ serviceId: selectedServiceDetails.id, rating, comment })
                            });
                            if (res.ok) {
                              toast.success("¡Gracias por calificar! ⭐", { id: loadingToast });
                              mutate();
                              // Actualizar detalles
                              const detailsRes = await fetch(`/api/service-requests/${selectedServiceDetails.id}`);
                              if (detailsRes.ok) {
                                // Los datos se actualizarán automáticamente con SWR
                              }
                            } else {
                              const errorData = await res.json();
                              const errorMessage = errorData.message || "Error al calificar";
                              toast.error(errorMessage, { id: loadingToast });
                              throw new Error(errorMessage);
                            }
                          } catch (error) {
                            const msg = error instanceof Error ? error.message : "Error de conexión";
                            if (!msg.includes("Error al calificar")) {
                              toast.error(msg, { id: loadingToast });
                            }
                            throw error;
                          }
                        }}
                      />
                    </CardContent>
                  </Card>
                )}

                {/* Calificación existente */}
                {selectedServiceDetails?.status === "FINALIZADO" && selectedServiceDetails?.review && (
                  <Card className="border-orange-400/30 bg-orange-500/10">
                    <CardHeader>
                      <CardTitle className="text-orange-200">Tu calificación</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-slate-200">
                      <div>
                        <p className="text-xs text-slate-400">Puntuación</p>
                        <p className="text-lg">⭐ {selectedServiceDetails.review.rating} / 5</p>
                      </div>
                      {selectedServiceDetails.review.comment && (
                        <div>
                          <p className="text-xs text-slate-400">Comentario</p>
                          <p>{selectedServiceDetails.review.comment}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Timeline de estados */}
                {selectedServiceDetails?.statusHistory && selectedServiceDetails.statusHistory.length > 0 && (
                  <Card className="border-white/10 bg-white/5">
                    <CardHeader>
                      <CardTitle className="text-white">Historial de estados</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {selectedServiceDetails.statusHistory?.map((entry: any, idx: number) => (
                        <div key={idx} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="h-3 w-3 rounded-full bg-orange-400" />
                            {idx < (selectedServiceDetails.statusHistory?.length ?? 0) - 1 && (
                              <div className="h-12 w-0.5 bg-orange-400/30" />
                            )}
                          </div>
                          <div className="flex-1 pb-4 pt-1">
                            <p className="text-xs font-semibold text-orange-300">{formatStatus(entry.newStatus)}</p>
                            <p className="text-xs text-slate-400">
                              {new Date(entry.changedAt).toLocaleString("es-ES")}
                            </p>
                          </div>
                        </div>
                      )) || <p className="text-xs text-slate-400">Sin historial</p>}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>  );
}