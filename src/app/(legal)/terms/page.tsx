import Link from 'next/link';

export const metadata = {
  title: 'Términos de Servicio | MotoHelp',
  description: 'Términos y condiciones de uso de MotoHelp - plataforma de servicios para motos',
};

export default function TermsPage() {
  const lastUpdated = new Date('2026-02-18').toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <article className="prose prose-sm max-w-none">
      <h1 className="text-4xl font-bold text-slate-900 mb-2">Términos de Servicio</h1>
      <p className="text-slate-600 mb-8">Última actualización: {lastUpdated}</p>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">1. Aceptación de Términos</h2>
        <p>
          Al acceder y utilizar MotoHelp, usted acepta estar vinculado por estos Términos de Servicio y todas las políticas 
          incorporadas por referencia. Si no está de acuerdo con alguna parte de estos términos, no puede utilizar nuestro servicio.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">2. Descripción del Servicio</h2>
        <p>
          MotoHelp es una plataforma digital que conecta propietarios de motocicletas con mecánicos certificados. Proporcionamos:
        </p>
        <ul className="list-disc pl-6 my-4">
          <li>Publicación de solicitudes de servicio para motocicletas</li>
          <li>Conexión con mecánicos registrados y verificados</li>
          <li>Sistema de reseñas y calificaciones</li>
          <li>Comunicación entre clientes y mecánicos</li>
          <li>Gestión de solicitudes de servicio</li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">3. Registro de Usuarios</h2>
        <p>
          Para utilizar MotoHelp, debe:
        </p>
        <ul className="list-disc pl-6 my-4">
          <li>Ser mayor de 18 años</li>
          <li>Proporcionar información verdadera, exacta y completa</li>
          <li>Mantener la confidencialidad de su contraseña</li>
          <li>Ser responsable de todas las actividades en su cuenta</li>
          <li>Notificarnos inmediatamente de cualquier acceso no autorizado</li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">4. Responsabilidades del Usuario</h2>
        <p>
          Usted se compromete a:
        </p>
        <ul className="list-disc pl-6 my-4">
          <li>Utilizar la plataforma solo para propósitos legales</li>
          <li>No transmitir contenido ilegal, ofensivo o difamatorio</li>
          <li>No interferir con la seguridad o funcionalidad de la plataforma</li>
          <li>No suplantarse como otra persona o entidad</li>
          <li>Cumplir con todas las leyes y regulaciones aplicables</li>
          <li>Respetar los derechos de otros usuarios</li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">5. Limitación de Responsabilidad</h2>
        <p>
          MotoHelp actúa como intermediario de conectividad. No somos responsables de:
        </p>
        <ul className="list-disc pl-6 my-4">
          <li>La calidad del trabajo realizado por mecánicos</li>
          <li>Disputas entre clientes y mecánicos</li>
          <li>Daños, pérdidas o lesiones resultantes del servicio</li>
          <li>Disponibilidad o integridad de la plataforma</li>
          <li>Pérdida de datos o interrupciones del servicio</li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">6. Reseñas y Calificaciones</h2>
        <p>
          Los usuarios pueden dejar reseñas y calificaciones. Se compromete a:
        </p>
        <ul className="list-disc pl-6 my-4">
          <li>Proporcionar información verdadera y verificable</li>
          <li>No publicar contenido falso, difamatorio o malicioso</li>
          <li>Respetar la privacidad de otros usuarios</li>
          <li>Aceptar que sus reseñas serán públicas</li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">7. Terminación de Cuenta</h2>
        <p>
          Podemos suspender o cancelar su cuenta si:
        </p>
        <ul className="list-disc pl-6 my-4">
          <li>Viola estos Términos de Servicio</li>
          <li>Incurre en actividad ilegal</li>
          <li>Acosa o daña a otros usuarios</li>
          <li>Proporciona información falsa</li>
          <li>Realiza actividades fraudulentas</li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">8. Modificación de Términos</h2>
        <p>
          Nos reservamos el derecho de modificar estos Términos de Servicio en cualquier momento. 
          Los cambios entrarán en vigencia cuando se publiquen en el sitio. Su uso continuado de la 
          plataforma constituye aceptación de los términos modificados.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">9. Ley Aplicable</h2>
        <p>
          Estos Términos de Servicio se rigen por las leyes de Colombia, sin considerar 
          sus disposiciones sobre conflicto de leyes.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">10. Contacto</h2>
        <p>
          Si tiene preguntas sobre estos Términos de Servicio, contáctenos a través de:
        </p>
        <ul className="list-disc pl-6 my-4">
          <li>Email: legal@motohelp.com</li>
          <li>Formulario de contacto en el sitio web</li>
        </ul>
      </section>

      <nav className="mt-12 pt-8 border-t border-slate-200 flex gap-4">
        <Link
          href="/privacy"
          className="inline-flex items-center text-orange-600 hover:text-orange-700 font-medium"
        >
          ← Política de Privacidad
        </Link>
        <Link
          href="/cookies"
          className="inline-flex items-center text-orange-600 hover:text-orange-700 font-medium ml-auto"
        >
          Política de Cookies →
        </Link>
      </nav>
    </article>
  );
}
