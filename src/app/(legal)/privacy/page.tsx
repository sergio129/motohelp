import Link from 'next/link';

export const metadata = {
  title: 'Política de Privacidad | MotoHelp',
  description: 'Política de privacidad de MotoHelp - cómo protegemos tus datos personales',
};

export default function PrivacyPage() {
  const lastUpdated = new Date('2026-02-18').toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <article className="prose prose-sm max-w-none">
      <h1 className="text-4xl font-bold text-slate-900 mb-2">Política de Privacidad</h1>
      <p className="text-slate-600 mb-8">Última actualización: {lastUpdated}</p>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">1. Introducción</h2>
        <p>
          En MotoHelp, protegemos su privacidad. Esta Política de Privacidad explica cómo 
          recopilamos, usamos, divulgamos y salvaguardamos su información cuando utiliza nuestra plataforma.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">2. Información que Recopilamos</h2>
        <p>
          Recopilamos la siguiente información:
        </p>
        <h3 className="text-xl font-semibold text-slate-800 mt-4 mb-2">2.1 Información de Registro</h3>
        <ul className="list-disc pl-6 my-2">
          <li>Nombre completo</li>
          <li>Correo electrónico</li>
          <li>Número de teléfono</li>
          <li>Contraseña (encriptada)</li>
          <li>Tipo de usuario (Cliente, Mecánico, Admin)</li>
        </ul>

        <h3 className="text-xl font-semibold text-slate-800 mt-4 mb-2">2.2 Información de Perfil</h3>
        <ul className="list-disc pl-6 my-2">
          <li>Dirección(es) de ubicación</li>
          <li>Número de identificación (para mecánicos)</li>
          <li>Especialidades (para mecánicos)</li>
          <li>Datos de motocicletas (para clientes)</li>
          <li>Fotografía de perfil</li>
        </ul>

        <h3 className="text-xl font-semibold text-slate-800 mt-4 mb-2">2.3 Información de Uso</h3>
        <ul className="list-disc pl-6 my-2">
          <li>Solicitudes de servicio creadas</li>
          <li>Interacciones con otros usuarios</li>
          <li>Reseñas y calificaciones</li>
          <li>Historial de navegación</li>
          <li>Datos de IP y dispositivo</li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">3. Cómo Usamos su Información</h2>
        <p>
          Utilizamos su información para:
        </p>
        <ul className="list-disc pl-6 my-4">
          <li>Facilitar la conexión entre clientes y mecánicos</li>
          <li>Verificar identidades (especialmente para mecánicos)</li>
          <li>Procesar solicitudes de servicio</li>
          <li>Comunicación relacionada con la plataforma</li>
          <li>Mejorar nuestros servicios</li>
          <li>Cumplir con requisitos legales</li>
          <li>Prevenir fraude y abuso</li>
          <li>Análisis y estadísticas anónimas</li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">4. Compartición de Información</h2>
        <p>
          Compartimos información en los siguientes casos:
        </p>
        <ul className="list-disc pl-6 my-4">
          <li><strong>Entre usuarios:</strong> El nombre y información de contacto se comparte entre cliente y mecánico cuando aceptan una solicitud</li>
          <li><strong>Proveedores de servicios:</strong> Compartimos información con proveedores que nos ayudan a operar (email, hosting, pagos)</li>
          <li><strong>Requisito legal:</strong> Cuando lo exige la ley o para proteger derechos legales</li>
          <li><strong>No vendemos datos:</strong> No vendemos su información personal a terceros</li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">5. Seguridad de Datos</h2>
        <p>
          Implementamos medidas técnicas y organizacionales para proteger sus datos:
        </p>
        <ul className="list-disc pl-6 my-4">
          <li>Encriptación de contraseñas con bcrypt</li>
          <li>HTTPS para todas las comunicaciones</li>
          <li>Validación y sanitización de entrada</li>
          <li>Rate limiting para prevenir ataques</li>
          <li>Autenticación segura con NextAuth</li>
          <li>Acceso restringido a datos confidenciales</li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">6. Retención de Datos</h2>
        <p>
          Retenemos su información mientras mantenga su cuenta activa y según sea necesario para:
        </p>
        <ul className="list-disc pl-6 my-4">
          <li>Cumplir con obligaciones legales</li>
          <li>Resolver disputas</li>
          <li>Mantener historial de transacciones (7 años)</li>
          <li>Análisis de fraude</li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">7. Sus Derechos</h2>
        <p>
          Usted tiene derecho a:
        </p>
        <ul className="list-disc pl-6 my-4">
          <li>Acceder a sus datos personales</li>
          <li>Corregir información inexacta</li>
          <li>Solicitar la eliminación de sus datos</li>
          <li>Portabilidad de datos</li>
          <li>Revocar consentimiento para tratamiento de datos</li>
          <li>Presentar quejas ante autoridades regulatorias</li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">8. Cookies y Tecnologías Similares</h2>
        <p>
          Utilizamos cookies para recordar preferencias y mejorar experiencia. Vea nuestra 
          <Link href="/cookies" className="text-orange-600 hover:text-orange-700 ml-1">
            Política de Cookies
          </Link>
          .
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">9. Enlaces a Sitios Externos</h2>
        <p>
          MotoHelp puede contener enlaces a sitios externos. No somos responsables de sus 
          políticas de privacidad. Le recomendamos revisar sus políticas de privacidad.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">10. Cambios a Esta Política</h2>
        <p>
          Podemos actualizar esta Política de Privacidad ocasionalmente. Le notificaremos 
          de cambios significativos enviándole un email o mostrando un aviso prominente en la plataforma.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">11. Contacto</h2>
        <p>
          Para consultas sobre esta Política de Privacidad:
        </p>
        <ul className="list-disc pl-6 my-4">
          <li>Email: privacy@motohelp.com</li>
          <li>Formulario de contacto en el sitio web</li>
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
          href="/cookies"
          className="inline-flex items-center text-orange-600 hover:text-orange-700 font-medium ml-auto"
        >
          Política de Cookies →
        </Link>
      </nav>
    </article>
  );
}
