"use client";

import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetcher } from "@/lib/fetcher";

type LandingStats = {
  totalRequests: number;
  totalMechanics: number;
  averageRating: string;
  testimonials: Array<{
    name: string;
    role: string;
    comment: string;
    rating: number;
    service: string;
  }>;
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<"clientes" | "mecanicos" | "admin">("clientes");
  const { data: stats } = useSWR<LandingStats>("/api/landing/stats", fetcher);

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      {/* Animated background gradients */}
      <div className="pointer-events-none fixed -left-32 top-[-120px] h-72 w-72 rounded-full bg-orange-500/20 blur-[120px] animate-pulse" />
      <div className="pointer-events-none fixed right-[-120px] top-20 h-72 w-72 rounded-full bg-red-500/20 blur-[140px] animate-pulse" style={{ animationDelay: "1s" }} />
      <div className="pointer-events-none fixed bottom-[-140px] left-20 h-80 w-80 rounded-full bg-amber-400/20 blur-[160px] animate-pulse" style={{ animationDelay: "2s" }} />

      <main className="relative mx-auto w-full flex flex-col gap-24 px-6 py-16 text-white">
        {/* HERO SECTION */}
        <header className="flex flex-col gap-8 max-w-6xl mx-auto w-full">
          <span className="w-fit rounded-full border border-white/10 bg-white/10 px-4 py-1 text-sm font-semibold uppercase tracking-[0.2em] text-orange-200">
            🏍️ MotoHelp - Mecánica a Domicilio para tu Moto
          </span>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white leading-tight">
            Mantén tu{" "}
            <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              moto en perfectas condiciones
            </span>
            {" "}sin dejar tu casa.
          </h1>
          <p className="max-w-3xl text-xl text-slate-200 leading-relaxed">
            Especialistas en motos disponibles a domicilio. Mantenimiento, reparaciones y emergencias mecánicas 
            en minutos. Profesionales verificados con experiencia en todas las marcas y modelos de Latinoamérica.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button asChild size="lg" className="bg-orange-500 text-slate-950 hover:bg-orange-400 font-semibold px-8 py-6 text-lg">
              <Link href="/auth/sign-up">Solicitar servicio ahora</Link>
            </Button>
            <Button
              asChild
              variant="default"
              size="lg"
              className="bg-white/10 text-white hover:bg-white/20 font-semibold px-8 py-6 text-lg"
            >
              <Link href="/auth/sign-in">Ingresar</Link>
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
            {[
              { icon: "⚡", text: "Respuesta en <15 min" },
              { icon: "✓", text: "Especialistas verificados" },
              { icon: "🏍️", text: "Para todas las motos" },
              { icon: "💳", text: "Pago seguro" },
            ].map((item) => (
              <span key={item.text} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 hover:bg-white/10 transition-colors">
                {item.icon} {item.text}
              </span>
            ))}
          </div>
        </header>

        {/* SERVICIOS ESPECIALIZADOS EN MOTOS */}
        <section className="max-w-6xl mx-auto w-full">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Servicios para tu Moto</h2>
            <p className="text-slate-300 text-lg">Especialistas en mantenimiento y reparación de motos</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: "Cambio de aceite", emoji: "🛢️", desc: "Mantenimiento premium" },
              { name: "Revisión de frenos", emoji: "🛑", desc: "Seguridad garantizada" },
              { name: "Ajuste de cadena", emoji: "⛓️", desc: "Precisión técnica" },
              { name: "Cambio de bujías", emoji: "🔌", desc: "Mejor rendimiento" },
              { name: "Cambio de batería", emoji: "🔋", desc: "Potencia renovada" },
              { name: "Revisión de suspensión", emoji: "🏍️", desc: "Comodidad en ruta" },
              { name: "Reparación de motor", emoji: "⚙️", desc: "Especialistas expertos" },
              { name: "Emergencias 24/7", emoji: "🚨", desc: "Siempre disponible" },
            ].map((service) => (
              <Card
                key={service.name}
                className="border-white/10 bg-gradient-to-br from-white/5 to-white/10 text-white hover:from-orange-500/20 hover:to-orange-500/10 transition-all duration-300 cursor-pointer group"
              >
                <CardContent className="p-6 text-center">
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{service.emoji}</div>
                  <h3 className="font-semibold text-lg text-white mb-1">{service.name}</h3>
                  <p className="text-sm text-slate-300">{service.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CÓMO FUNCIONA - INTERACTIVE TABS */}
        <section className="max-w-6xl mx-auto w-full">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">¿Cómo funciona?</h2>
            <p className="text-slate-300 text-lg">3 pasos simples para conectar con un mecánico especialista</p>
          </div>

          <div className="flex gap-4 mb-8 justify-center flex-wrap">
            {[
              { id: "clientes", label: "👤 Motociclistas", icon: "🏍️" },
              { id: "mecanicos", label: "🔧 Mecánicos", icon: "✅" },
              { id: "admin", label: "⚙️ Administración", icon: "📊" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === tab.id
                    ? "bg-orange-500 text-slate-950 shadow-lg shadow-orange-500/50"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {activeTab === "clientes" && (
              <>
                <Card className="border-orange-500/30 bg-gradient-to-br from-orange-500/20 to-orange-500/5 text-white">
                  <CardHeader>
                    <div className="text-5xl mb-4">1️⃣</div>
                    <CardTitle>Describe el problema</CardTitle>
                  </CardHeader>
                  <CardContent className="text-slate-200">
                    Cuéntanos qué necesita tu moto, dónde estás y cuándo. Toma menos de 2 minutos con nuestra app.
                  </CardContent>
                </Card>
                <Card className="border-orange-500/30 bg-gradient-to-br from-orange-500/20 to-orange-500/5 text-white">
                  <CardHeader>
                    <div className="text-5xl mb-4">2️⃣</div>
                    <CardTitle>Conecta con especialista</CardTitle>
                  </CardHeader>
                  <CardContent className="text-slate-200">
                    Mecánicos certificados verán tu solicitud y podrán llegar a tu domicilio en minutos.
                  </CardContent>
                </Card>
                <Card className="border-orange-500/30 bg-gradient-to-br from-orange-500/20 to-orange-500/5 text-white">
                  <CardHeader>
                    <div className="text-5xl mb-4">3️⃣</div>
                    <CardTitle>Moto lista y pagada</CardTitle>
                  </CardHeader>
                  <CardContent className="text-slate-200">
                    Monitorea en tiempo real, paga de forma segura y califica al mecánico que revisó tu moto.
                  </CardContent>
                </Card>
              </>
            )}

            {activeTab === "mecanicos" && (
              <>
                <Card className="border-red-500/30 bg-gradient-to-br from-red-500/20 to-red-500/5 text-white">
                  <CardHeader>
                    <div className="text-5xl mb-4">1️⃣</div>
                    <CardTitle>Únete como especialista</CardTitle>
                  </CardHeader>
                  <CardContent className="text-slate-200">
                    Regístrate, sube tu certificación y experiencia. Espera verificación en 24-48 horas.
                  </CardContent>
                </Card>
                <Card className="border-red-500/30 bg-gradient-to-br from-red-500/20 to-red-500/5 text-white">
                  <CardHeader>
                    <div className="text-5xl mb-4">2️⃣</div>
                    <CardTitle>Acepta trabajos cercanos</CardTitle>
                  </CardHeader>
                  <CardContent className="text-slate-200">
                    Recibe notificaciones de motos que necesitan servicio en tu zona. Elige cuáles aceptar.
                  </CardContent>
                </Card>
                <Card className="border-red-500/30 bg-gradient-to-br from-red-500/20 to-red-500/5 text-white">
                  <CardHeader>
                    <div className="text-5xl mb-4">3️⃣</div>
                    <CardTitle>Cobra y crece</CardTitle>
                  </CardHeader>
                  <CardContent className="text-slate-200">
                    Cobra pagos seguros, construye reputación y gana más con buenas calificaciones.
                  </CardContent>
                </Card>
              </>
            )}

            {activeTab === "admin" && (
              <>
                <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/20 to-amber-500/5 text-white">
                  <CardHeader>
                    <div className="text-5xl mb-4">1️⃣</div>
                    <CardTitle>Verifica especialistas</CardTitle>
                  </CardHeader>
                  <CardContent className="text-slate-200">
                    Revisa credenciales, experiencia y certificaciones de mecánicos para garantizar calidad.
                  </CardContent>
                </Card>
                <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/20 to-amber-500/5 text-white">
                  <CardHeader>
                    <div className="text-5xl mb-4">2️⃣</div>
                    <CardTitle>Supervisa servicios</CardTitle>
                  </CardHeader>
                  <CardContent className="text-slate-200">
                    Monitorea solicitudes, resuelve conflictos y asegura que cada moto reciba mejor servicio.
                  </CardContent>
                </Card>
                <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/20 to-amber-500/5 text-white">
                  <CardHeader>
                    <div className="text-5xl mb-4">3️⃣</div>
                    <CardTitle>Analiza plataforma</CardTitle>
                  </CardHeader>
                  <CardContent className="text-slate-200">
                    Accede a dashboards con datos de servicios, mecánicos y motociclistas para optimizar.
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </section>

        {/* TESTIMONIOS REALES */}
        <section className="max-w-6xl mx-auto w-full">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Lo que dicen nuestros usuarios</h2>
            <p className="text-slate-300 text-lg">Experiencias reales de motociclistas y mecánicos</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {stats?.testimonials && stats.testimonials.length > 0 ? (
              stats.testimonials.map((testimonial, idx) => (
                <Card key={idx} className="border-white/10 bg-white/5 text-white">
                  <CardContent className="p-6">
                    <div className="mb-4">
                      {"⭐".repeat(testimonial.rating)}
                    </div>
                    <p className="text-slate-200 mb-4 italic">"{testimonial.comment}"</p>
                    <div>
                      <p className="font-semibold text-white">{testimonial.name}</p>
                      <p className="text-sm text-orange-300">{testimonial.service}</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <>
                <Card className="border-white/10 bg-white/5 text-white">
                  <CardContent className="p-6">
                    <div className="mb-4">⭐⭐⭐⭐⭐</div>
                    <p className="text-slate-200 mb-4 italic">"Pedí cambio de aceite a domicilio y en 30 min mi moto estaba lista. Excelente servicio del mecánico."</p>
                    <div>
                      <p className="font-semibold text-white">Sergio Luis</p>
                      <p className="text-sm text-orange-300">Cambio de aceite</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-white/10 bg-white/5 text-white">
                  <CardContent className="p-6">
                    <div className="mb-4">⭐⭐⭐⭐⭐</div>
                    <p className="text-slate-200 mb-4 italic">"Plataforma intuitiva. Recibo solicitudes cercanas de motos que necesitan servicio y realizo más trabajos."</p>
                    <div>
                      <p className="font-semibold text-white">Juan Romero</p>
                      <p className="text-sm text-orange-300">Mecánico verificado</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-white/10 bg-white/5 text-white">
                  <CardContent className="p-6">
                    <div className="mb-4">⭐⭐⭐⭐⭐</div>
                    <p className="text-slate-200 mb-4 italic">"Dashboard completo y fácil de usar para verificar mecánicos y supervisar servicios de motos."</p>
                    <div>
                      <p className="font-semibold text-white">Carlos Admin</p>
                      <p className="text-sm text-orange-300">Administrador</p>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </section>

        {/* STATS REALES */}
        <section className="max-w-6xl mx-auto w-full bg-gradient-to-r from-orange-500/10 via-red-500/10 to-amber-500/10 rounded-3xl border border-white/10 p-12">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-orange-400 mb-2">{stats?.totalRequests || "0"}+</div>
              <p className="text-slate-300">Servicios completados para motos</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-400 mb-2">{stats?.totalMechanics || "0"}+</div>
              <p className="text-slate-300">Mecánicos especialistas verificados</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-400 mb-2">{stats?.averageRating || "4.8"}★</div>
              <p className="text-slate-300">Calificación promedio</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-400 mb-2">24/7</div>
              <p className="text-slate-300">Soporte disponible</p>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="max-w-6xl mx-auto w-full rounded-3xl border border-white/10 bg-gradient-to-r from-white/5 via-orange-500/20 to-white/5 p-12 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">¿Tu moto necesita servicio? ¡Estamos aquí!</h2>
          <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
            Conecta en minutos con mecánicos especializados en motos. Servicio a domicilio, profesionales verificados 
            y completamente seguro. ¡Ahora sí, mecánica sin complicaciones!
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild size="lg" className="bg-orange-500 text-slate-950 hover:bg-orange-400 font-semibold px-8">
              <Link href="/auth/sign-up">Crear cuenta y solicitar</Link>
            </Button>
            <Button
              asChild
              variant="default"
              size="lg"
              className="bg-white/20 text-white hover:bg-white/30 font-semibold px-8"
            >
              <Link href="/auth/sign-in">Ya tengo cuenta</Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
