import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="pointer-events-none absolute -left-32 top-[-120px] h-72 w-72 rounded-full bg-orange-500/20 blur-[120px]" />
      <div className="pointer-events-none absolute right-[-120px] top-20 h-72 w-72 rounded-full bg-red-500/20 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-[-140px] left-20 h-80 w-80 rounded-full bg-amber-400/20 blur-[160px]" />

      <main className="relative mx-auto flex w-full max-w-6xl flex-col gap-14 px-6 py-16 text-white">
        <header className="flex flex-col gap-6">
          <span className="w-fit rounded-full border border-white/10 bg-white/10 px-4 py-1 text-sm font-semibold uppercase tracking-[0.2em] text-orange-200">
            MVP MotoHelp
          </span>
          <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
            Conecta clientes con mecánicos a domicilio en minutos.
            <span className="mt-3 block text-2xl font-semibold text-orange-200 md:text-3xl">
              Rapidez, confianza y servicio con alma motera.
            </span>
          </h1>
          <p className="max-w-2xl text-lg text-slate-200">
            Solicita ayuda mecánica, asigna profesionales verificados y gestiona el estado del servicio
            desde un solo panel.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button asChild size="lg" className="bg-orange-500 text-slate-950 hover:bg-orange-400">
              <Link href="/auth/sign-up">Crear cuenta</Link>
            </Button>
            <Button
              asChild
              variant="default"
              size="lg"
              className="bg-white/10 text-white hover:bg-white/20"
            >
              <Link href="/auth/sign-in">Ingresar</Link>
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
              ⚡ Respuesta rápida
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
              🛠️ Mecánicos verificados
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
              🗺️ Servicio a domicilio
            </span>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Clientes",
              text: "Crea solicitudes, visualiza el historial y califica el servicio.",
              accent: "from-orange-500/20 to-orange-500/5",
            },
            {
              title: "Mecánicos",
              text: "Acepta trabajos disponibles y actualiza el estado en tiempo real.",
              accent: "from-red-500/20 to-red-500/5",
            },
            {
              title: "Administración",
              text: "Controla usuarios, verifica mecánicos y supervisa métricas clave.",
              accent: "from-amber-500/20 to-amber-500/5",
            },
          ].map((item) => (
            <Card key={item.title} className="border-white/10 bg-white/5 text-white">
              <CardHeader>
                <CardTitle className="text-white">{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-200">
                <div className={`mb-4 h-1 w-12 rounded-full bg-gradient-to-r ${item.accent}`} />
                {item.text}
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="rounded-3xl border border-white/10 bg-gradient-to-r from-white/5 via-white/10 to-white/5 p-8 text-slate-100">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white">¿Listo para rodar con MotoHelp?</h2>
              <p className="text-slate-300">
                Activa tu cuenta y prueba el flujo completo del MVP en minutos.
              </p>
            </div>
            <Button asChild size="lg" className="bg-orange-500 text-slate-950 hover:bg-orange-400">
              <Link href="/auth/sign-up">Comenzar ahora</Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
