import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-16">
        <header className="flex flex-col gap-6">
          <span className="w-fit rounded-full bg-slate-900 px-4 py-1 text-sm font-semibold text-white">
            MVP MotoHelp
          </span>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
            Conecta clientes con mecánicos a domicilio en minutos.
          </h1>
          <p className="max-w-2xl text-lg text-slate-600">
            Solicita ayuda mecánica, asigna profesionales verificados y gestiona el estado del servicio
            desde un solo panel.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button asChild size="lg">
              <Link href="/auth/sign-up">Crear cuenta</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/auth/sign-in">Ingresar</Link>
            </Button>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Clientes",
              text: "Crea solicitudes, visualiza el historial y califica el servicio.",
            },
            {
              title: "Mecánicos",
              text: "Acepta trabajos disponibles y actualiza el estado en tiempo real.",
            },
            {
              title: "Administración",
              text: "Controla usuarios, verifica mecánicos y supervisa métricas clave.",
            },
          ].map((item) => (
            <Card key={item.title}>
              <CardHeader>
                <CardTitle>{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-600">{item.text}</CardContent>
            </Card>
          ))}
        </section>
      </main>
    </div>
  );
}
