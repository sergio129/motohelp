"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"clientes" | "mecanicos" | "admin">("clientes");

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
            ⚡ MVP MotoHelp - Mecánica a Domicilio
          </span>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white leading-tight">
            Conecta con{" "}
            <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              mecánicos verificados
            </span>
            {" "}en minutos.
          </h1>
          <p className="max-w-3xl text-xl text-slate-200 leading-relaxed">
            Olvídate de las gasolineras. Solicita mantenimiento, reparaciones y servicios de emergencia 
            sin moverte de casa. Profesionales verificados, transparencia total y servicio con alma motera.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button asChild size="lg" className="bg-orange-500 text-slate-950 hover:bg-orange-400 font-semibold px-8 py-6 text-lg">
              <Link href="/auth/sign-up">Crear cuenta gratis</Link>
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
              { icon: "✓", text: "Mecánicos verificados" },
              { icon: "🗺️", text: "Servicio a domicilio" },
              { icon: "💳", text: "Pago seguro" },
            ].map((item) => (
              <span key={item.text} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 hover:bg-white/10 transition-colors">
                {item.icon} {item.text}
              </span>
            ))}
          </div>
        </header>

        {/* SERVICIOS & REPUESTOS GALLERY */}
        <section className="max-w-6xl mx-auto w-full">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Servicios principales</h2>
            <p className="text-slate-300 text-lg">Desde cambios de aceite hasta revisiones completas</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: "Cambio de aceite", emoji: "🛢️", desc: "Mantenimiento básico" },
              { name: "Reparación de frenos", emoji: "🛑", desc: "Seguridad garantizada" },
              { name: "Alineación", emoji: "⚙️", desc: "Precisión técnica" },
              { name: "Revisión preventiva", emoji: "🔍", desc: "Diagnóstico completo" },
              { name: "Cambios de batería", emoji: "🔋", desc: "Potencia renovada" },
              { name: "Reparación de suspensión", emoji: "🏎️", desc: "Comodidad en ruta" },
              { name: "Mecánica general", emoji: "🔧", desc: "Especialistas variados" },
              { name: "Emergencias", emoji: "🚨", desc: "24/7 disponible" },
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
            <p className="text-slate-300 text-lg">3 pasos simples para conectar con un mecánico</p>
          </div>

          <div className="flex gap-4 mb-8 justify-center flex-wrap">
            {[
              { id: "clientes", label: "👤 Para Clientes", icon: "📲" },
              { id: "mecanicos", label: "🔧 Para Mecánicos", icon: "✅" },
              { id: "admin", label: "⚙️ Para Admin", icon: "📊" },
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
                    <CardTitle>Crea tu solicitud</CardTitle>
                  </CardHeader>
                  <CardContent className="text-slate-200">
                    Describe tu problema, elige el tipo de servicio y selecciona tu ubicación. Toma menos de 2 minutos.
                  </CardContent>
                </Card>
                <Card className="border-orange-500/30 bg-gradient-to-br from-orange-500/20 to-orange-500/5 text-white">
                  <CardHeader>
                    <div className="text-5xl mb-4">2️⃣</div>
                    <CardTitle>Recibe propuestas</CardTitle>
                  </CardHeader>
                  <CardContent className="text-slate-200">
                    Mecánicos verificados cercanos verán tu solicitud y podrán aceptarla en tiempo real.
                  </CardContent>
                </Card>
                <Card className="border-orange-500/30 bg-gradient-to-br from-orange-500/20 to-orange-500/5 text-white">
                  <CardHeader>
                    <div className="text-5xl mb-4">3️⃣</div>
                    <CardTitle>Servicio completado</CardTitle>
                  </CardHeader>
                  <CardContent className="text-slate-200">
                    Monitorea en tiempo real, paga de forma segura y califica al mecánico.
                  </CardContent>
                </Card>
              </>
            )}

            {activeTab === "mecanicos" && (
              <>
                <Card className="border-red-500/30 bg-gradient-to-br from-red-500/20 to-red-500/5 text-white">
                  <CardHeader>
                    <div className="text-5xl mb-4">1️⃣</div>
                    <CardTitle>Regístrate verificado</CardTitle>
                  </CardHeader>
                  <CardContent className="text-slate-200">
                    Completa tu perfil, sube documentación y espera aprobación del admin.
                  </CardContent>
                </Card>
                <Card className="border-red-500/30 bg-gradient-to-br from-red-500/20 to-red-500/5 text-white">
                  <CardHeader>
                    <div className="text-5xl mb-4">2️⃣</div>
                    <CardTitle>Acepta trabajos</CardTitle>
                  </CardHeader>
                  <CardContent className="text-slate-200">
                    Recibe notificaciones de nuevas solicitudes cercanas a tu zona y elige cuáles aceptar.
                  </CardContent>
                </Card>
                <Card className="border-red-500/30 bg-gradient-to-br from-red-500/20 to-red-500/5 text-white">
                  <CardHeader>
                    <div className="text-5xl mb-4">3️⃣</div>
                    <CardTitle>Cobra y crece</CardTitle>
                  </CardHeader>
                  <CardContent className="text-slate-200">
                    Actualiza estado, recibe pagos seguros y construye tu reputación.
                  </CardContent>
                </Card>
              </>
            )}

            {activeTab === "admin" && (
              <>
                <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/20 to-amber-500/5 text-white">
                  <CardHeader>
                    <div className="text-5xl mb-4">1️⃣</div>
                    <CardTitle>Verifica mecánicos</CardTitle>
                  </CardHeader>
                  <CardContent className="text-slate-200">
                    Revisa perfiles, documentos y aprueba mecánicos confiables para la plataforma.
                  </CardContent>
                </Card>
                <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/20 to-amber-500/5 text-white">
                  <CardHeader>
                    <div className="text-5xl mb-4">2️⃣</div>
                    <CardTitle>Supervisa servicios</CardTitle>
                  </CardHeader>
                  <CardContent className="text-slate-200">
                    Monitorea solicitudes activas, resuelve conflictos y asegura la calidad.
                  </CardContent>
                </Card>
                <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/20 to-amber-500/5 text-white">
                  <CardHeader>
                    <div className="text-5xl mb-4">3️⃣</div>
                    <CardTitle>Analiza métricas</CardTitle>
                  </CardHeader>
                  <CardContent className="text-slate-200">
                    Accede a dashboards, reportes y datos para optimizar la plataforma.
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </section>

        {/* TESTIMONIOS */}
        <section className="max-w-6xl mx-auto w-full">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Lo que dicen nuestros usuarios</h2>
            <p className="text-slate-300 text-lg">Experiencias reales de clientes y mecánicos</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Sergio Luis",
                role: "Cliente",
                comment: "Solicité cambio de aceite a domicilio y en 30 min estaba listo. Excelente servicio.",
                rating: "⭐⭐⭐⭐⭐",
              },
              {
                name: "Juan Romero",
                role: "Mecánico",
                comment: "Plataforma muy intuitiva. Recibo solicitudes cercanas y realizo más trabajos.",
                rating: "⭐⭐⭐⭐⭐",
              },
              {
                name: "Carlos Admin",
                role: "Administrador",
                comment: "Dashboard completo. Fácil verificar mecánicos y supervisar servicios.",
                rating: "⭐⭐⭐⭐⭐",
              },
            ].map((testimonial) => (
              <Card key={testimonial.name} className="border-white/10 bg-white/5 text-white">
                <CardContent className="p-6">
                  <div className="mb-4">{testimonial.rating}</div>
                  <p className="text-slate-200 mb-4 italic">"{testimonial.comment}"</p>
                  <div>
                    <p className="font-semibold text-white">{testimonial.name}</p>
                    <p className="text-sm text-orange-300">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* STATS */}
        <section className="max-w-6xl mx-auto w-full bg-gradient-to-r from-orange-500/10 via-red-500/10 to-amber-500/10 rounded-3xl border border-white/10 p-12">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { number: "500+", label: "Solicitudes completadas" },
              { number: "150+", label: "Mecánicos verificados" },
              { number: "4.8★", label: "Calificación promedio" },
              { number: "24/7", label: "Soporte disponible" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-4xl font-bold text-orange-400 mb-2">{stat.number}</div>
                <p className="text-slate-300">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="max-w-6xl mx-auto w-full rounded-3xl border border-white/10 bg-gradient-to-r from-white/5 via-orange-500/20 to-white/5 p-12 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">¿Listo para conectar con el mecánico perfecto?</h2>
          <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
            Únete a cientos de usuarios que ya experimentan servicio mecánico a domicilio rápido, confiable y con profesionales verificados.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild size="lg" className="bg-orange-500 text-slate-950 hover:bg-orange-400 font-semibold px-8">
              <Link href="/auth/sign-up">Crear cuenta ahora</Link>
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
