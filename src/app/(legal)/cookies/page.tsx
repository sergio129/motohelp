import Link from 'next/link';

export const metadata = {
  title: 'Política de Cookies | MotoHelp',
  description: 'Política de cookies de MotoHelp - información sobre cómo usamos cookies',
};

export default function CookiesPage() {
  const lastUpdated = new Date('2026-02-18').toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <article className="prose prose-sm max-w-none">
      <h1 className="text-4xl font-bold text-slate-900 mb-2">Política de Cookies</h1>
      <p className="text-slate-600 mb-8">Última actualización: {lastUpdated}</p>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">1. ¿Qué son las Cookies?</h2>
        <p>
          Las cookies son pequeños archivos de texto que se almacenan en su dispositivo cuando 
          visita un sitio web. Nos ayudan a recordar preferencias y mejorar su experiencia de navegación.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">2. Tipos de Cookies que Utilizamos</h2>
        
        <h3 className="text-xl font-semibold text-slate-800 mt-4 mb-2">2.1 Cookies Esenciales</h3>
        <p>Necesarias para el funcionamiento básico del sitio:</p>
        <ul className="list-disc pl-6 my-2">
          <li><strong>nextauth.session-token:</strong> Mantiene su sesión iniciada</li>
          <li><strong>nextauth.csrf-token:</strong> Protección contra ataques CSRF</li>
          <li><strong>__Host-nextauth.0:</strong> Seguridad de sesión</li>
        </ul>

        <h3 className="text-xl font-semibold text-slate-800 mt-4 mb-2">2.2 Cookies de Rendimiento</h3>
        <p>Nos ayudan a mejorar el sitio analizando cómo lo usa:</p>
        <ul className="list-disc pl-6 my-2">
          <li><strong>_ga:</strong> Google Analytics - seguimiento anonimizado de uso</li>
          <li><strong>_gid:</strong> Google Analytics - identificación de sesión</li>
        </ul>

        <h3 className="text-xl font-semibold text-slate-800 mt-4 mb-2">2.3 Cookies Funcionales</h3>
        <p>Mejoran la experiencia recordando preferencias:</p>
        <ul className="list-disc pl-6 my-2">
          <li><strong>motohelp-preferences:</strong> Tema preferido (claro/oscuro)</li>
          <li><strong>motohelp-language:</strong> Idioma preferido</li>
        </ul>

        <h3 className="text-xl font-semibold text-slate-800 mt-4 mb-2">2.4 Cookies de Publicidad</h3>
        <p>Para mostrar anuncios relevantes (si está habilitado):</p>
        <ul className="list-disc pl-6 my-2">
          <li><strong>_gcl_au:</strong> Google Ads - seguimiento de conversiones</li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">3. Cómo Usamos las Cookies</h2>
        <ul className="list-disc pl-6 my-4">
          <li><strong>Autenticación:</strong> Mantener su sesión segura</li>
          <li><strong>Preferencias:</strong> Recordar configuración de usuario</li>
          <li><strong>Análisis:</strong> Entender cómo usan nuestro sitio</li>
          <li><strong>Seguridad:</strong> Prevenir acceso no autorizado y fraude</li>
          <li><strong>Rendimiento:</strong> Mejorar velocidad y disponibilidad</li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">4. Cookies de Terceros</h2>
        <p>
          Utilizamos servicios de terceros que pueden establecer cookies:
        </p>
        <ul className="list-disc pl-6 my-4">
          <li><strong>Google Analytics:</strong> Análisis de tráfico del sitio</li>
          <li><strong>NextAuth:</strong> Gestión segura de sesiones</li>
          <li><strong>Proveedores de Email:</strong> Verificación de entrega</li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">5. Control de Cookies</h2>
        <p>
          Puede controlar las cookies en su navegador:
        </p>
        <ul className="list-disc pl-6 my-4">
          <li><strong>Aceptar o rechazar:</strong> Configure su navegador para pedir permiso</li>
          <li><strong>Eliminar cookies:</strong> Borre cookies existentes desde configuración</li>
          <li><strong>Desactivar cookies:</strong> Puede desactivar parcialmente, pero afectará funcionalidad</li>
          <li><strong>Navegación privada:</strong> Use modo incógnito para no guardar cookies</li>
        </ul>
        
        <p className="mt-4 bg-blue-50 border-l-4 border-blue-500 p-4">
          <strong>Nota:</strong> Las cookies esenciales no se pueden desactivar sin comprometer 
          el funcionamiento de la plataforma. Las cookies de análisis y publicidad sí pueden deshabilitarse.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">6. Duración de las Cookies</h2>
        <ul className="list-disc pl-6 my-4">
          <li><strong>Cookies de sesión:</strong> Se eliminan cuando cierra el navegador</li>
          <li><strong>Cookies persistentes:</strong> Permanecen en su dispositivo hasta su fecha de expiración</li>
          <li><strong>Autenticación:</strong> Típicamente 30 días si mantiene sesión activa</li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">7. Derechos del Usuario</h2>
        <p>
          Usted tiene derecho a:
        </p>
        <ul className="list-disc pl-6 my-4">
          <li>Ser informado sobre qué cookies utilizamos</li>
          <li>Dar o negar consentimiento para cookies no esenciales</li>
          <li>Cambiar sus preferencias de cookies en cualquier momento</li>
          <li>Solicitar la eliminación de datos de cookies</li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">8. Cambios a Esta Política</h2>
        <p>
          Podemos actualizar esta Política de Cookies ocasionalmente para reflejar 
          cambios en nuestras prácticas o por requisitos legales.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">9. Referencias de Navegadores</h2>
        <p>
          Para más información sobre cómo controlar cookies en su navegador:
        </p>
        <ul className="list-disc pl-6 my-4">
          <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:text-orange-700">Google Chrome</a></li>
          <li><a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:text-orange-700">Mozilla Firefox</a></li>
          <li><a href="https://support.apple.com/en-us/HT201265" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:text-orange-700">Safari</a></li>
          <li><a href="https://support.microsoft.com/en-us/help/17442/" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:text-orange-700">Microsoft Edge</a></li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">10. Contacto</h2>
        <p>
          Para consultas sobre nuestra Política de Cookies:
        </p>
        <ul className="list-disc pl-6 my-4">
          <li>Email: privacy@motohelp.com</li>
          <li>Formulario de contacto disponible en el sitio web</li>
        </ul>
      </section>

      <nav className="mt-12 pt-8 border-t border-slate-200 flex gap-4">
        <Link
          href="/terms"
          className="inline-flex items-center text-orange-600 hover:text-orange-700 font-medium"
        >
          ← Términos de Servicio
        </Link>
        <Link
          href="/privacy"
          className="inline-flex items-center text-orange-600 hover:text-orange-700 font-medium ml-auto"
        >
          Política de Privacidad →
        </Link>
      </nav>
    </article>
  );
}
