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
  description: string;
  address: string;
  status: string;
  createdAt: string;
  serviceType?: { id: string; name: string } | null;
};

type ServiceType = {
  id: string;
  name: string;
  description?: string | null;
};

export default function ClientDashboard() {
  const { data, mutate } = useSWR<ServiceRequest[]>("/api/service-requests", fetcher);
  const { data: serviceTypes } = useSWR<ServiceType[]>("/api/service-types", fetcher);
  const [serviceTypeId, setServiceTypeId] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [loading, setLoading] = useState(false);

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
    mutate();
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
        <header>
          <h1 className="text-3xl font-semibold text-white">Panel de cliente</h1>
          <p className="text-slate-300">Crea solicitudes y revisa el historial.</p>
        </header>

        <Card className="border-white/10 bg-white/5 text-white">
        <CardHeader>
          <CardTitle className="text-white">Nueva solicitud</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
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
            <div className="space-y-2 md:col-span-2">
              <Label className="text-slate-200" htmlFor="address">Dirección</Label>
              <Input
                id="address"
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                className="border-white/10 bg-slate-900/60 text-white"
                required
              />
            </div>
            <Button type="submit" disabled={loading} className="bg-orange-500 text-slate-950 hover:bg-orange-400 md:col-span-2">
              {loading ? "Enviando..." : "Crear solicitud"}
            </Button>
          </form>
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
                <CardContent className="space-y-2 text-sm text-slate-200">
                  <p>{item.description}</p>
                  <p>Dirección: {item.address}</p>
                  <div className="flex items-center justify-between">
                    <span className={statusBadge(item.status)}>{item.status}</span>
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
                  </div>
                </CardContent>
              </Card>
            ))}
            {!data?.length && <p className="text-slate-400">Sin solicitudes todavía.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
