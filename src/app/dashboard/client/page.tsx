"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { signOut } from "next-auth/react";
import { fetcher } from "@/lib/fetcher";
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
  rating?: { id: string; rating: number; comment: string } | null;
};

type ServiceRequestDetail = ServiceRequest & {
  mechanic?: { id: string; name: string; phone?: string } | null;
  notes?: string | null;
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

    await fetch("/api/service-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ serviceTypeId, description, address, scheduledAt }),
    });

    setServiceTypeId("");
    setDescription("");
    setAddress("");
    setScheduledAt("");
    setLoading(false);
    setSelectedAddressId("");
    mutate();
  }

  async function handleSaveProfile(event: React.FormEvent) {
    event.preventDefault();
    setSavingProfile(true);

    await fetch("/api/profile/client", {
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

    setSavingProfile(false);
    refreshProfile();
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
    await fetch(`/api/service-requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "CANCELADO" }),
    });
    mutate();
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
              <p className="text-sm text-slate-300">Abre el formulario y completa los datos del servicio.</p>
            </div>
            <Button
              type="button"
              className="bg-orange-500 text-slate-950 hover:bg-orange-400"
              onClick={() => setIsRequestOpen(true)}
            >
              Nueva solicitud
            </Button>
          </CardContent>
        </Card>

        <section className="grid gap-4">
          <h2 className="text-xl font-semibold text-white">Historial reciente</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {data?.map((item) => (
              <Card key={item.id} className="border-white/10 bg-white/5 text-white">
                <CardHeader>
                  <CardTitle className="text-white">{item.serviceType?.name ?? "Servicio"}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-slate-200">
                  <p>{item.description}</p>
                  <p>Dirección: {item.address}</p>
                  
                  {/* Estado y calificación */}
                  <div className="flex items-center justify-between gap-2">
                    <span className={statusBadge(item.status)}>{item.status}</span>
                    {item.rating && (
                      <span className="text-xs bg-orange-500/20 text-orange-300 px-2 py-1 rounded">
                        ⭐ {item.rating.rating}
                      </span>
                    )}
                  </div>

                  {/* Acciones */}
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

                  {/* Componente de calificación */}
                  {item.status === "FINALIZADO" && !item.rating && (
                    <div className="border-t border-white/10 pt-4 mt-4">
                      <p className="mb-3 text-xs text-slate-400">Califica este servicio:</p>
                      <RatingComponent
                        serviceId={item.id}
                        onSubmit={async (rating, comment) => {
                          const res = await fetch("/api/reviews", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ serviceId: item.id, rating, comment })
                          });
                          if (res.ok) {
                            mutate();
                            setSelectedServiceIdForRating(null);
                          }
                        }}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            {!data?.length && <p className="text-slate-400">Sin solicitudes todavía.</p>}
          </div>
        </section>
      </div>

      {isProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border border-white/10 bg-slate-950 text-white shadow-2xl shadow-black/40">
            <div className="max-h-[90vh] overflow-y-auto p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Editar perfil</h2>
                <p className="text-sm text-slate-400">Actualiza tus datos y direcciones.</p>
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
                  <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSaveProfile}>
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
                    <Button
                      type="submit"
                      disabled={savingProfile}
                      className="bg-orange-500 text-slate-950 hover:bg-orange-400 md:col-span-2"
                    >
                      {savingProfile ? "Guardando..." : "Guardar datos"}
                    </Button>
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
                      <p className={statusBadge(selectedServiceDetails?.status || "PENDIENTE")}>{selectedServiceDetails?.status}</p>
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
                {selectedServiceDetails?.rating && (
                  <Card className="border-orange-400/30 bg-orange-500/10">
                    <CardHeader>
                      <CardTitle className="text-orange-200">Tu calificación</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-slate-200">
                      <div>
                        <p className="text-xs text-slate-400">Puntuación</p>
                        <p className="text-lg">⭐ {selectedServiceDetails.rating.rating} / 5</p>
                      </div>
                      {selectedServiceDetails.rating.comment && (
                        <div>
                          <p className="text-xs text-slate-400">Comentario</p>
                          <p>{selectedServiceDetails.rating.comment}</p>
                        </div>
                      )}
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