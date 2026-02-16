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
  createdAt: string;
};

export default function ClientDashboard() {
  const { data, mutate } = useSWR<ServiceRequest[]>("/api/service-requests", fetcher);
  const [type, setType] = useState("");
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
      body: JSON.stringify({ type, description, address, scheduledAt }),
    });

    setType("");
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
        <h1 className="text-3xl font-semibold">Panel de cliente</h1>
        <p className="text-slate-600">Crea solicitudes y revisa el historial.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Nueva solicitud</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="type">Tipo de servicio</Label>
              <Input id="type" value={type} onChange={(event) => setType(event.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="scheduledAt">Fecha y hora</Label>
              <Input
                id="scheduledAt"
                type="datetime-local"
                value={scheduledAt}
                onChange={(event) => setScheduledAt(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Descripción</Label>
              <Input
                id="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Dirección</Label>
              <Input id="address" value={address} onChange={(event) => setAddress(event.target.value)} required />
            </div>
            <Button type="submit" disabled={loading} className="md:col-span-2">
              {loading ? "Enviando..." : "Crear solicitud"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <section className="grid gap-4">
        <h2 className="text-xl font-semibold">Historial reciente</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {data?.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <CardTitle>{item.type}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-600">
                <p>{item.description}</p>
                <p>Dirección: {item.address}</p>
                <div className="flex items-center justify-between">
                  <span className={statusBadge(item.status)}>{item.status}</span>
                  {item.status === "PENDIENTE" && (
                    <Button variant="outline" size="sm" onClick={() => handleCancel(item.id)}>
                      Cancelar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {!data?.length && <p className="text-slate-500">Sin solicitudes todavía.</p>}
        </div>
      </section>
    </div>
  );
}
