import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-r from-slate-900 to-slate-800 text-slate-300 py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">MotoHelp</h3>
            <p className="text-sm">
              La plataforma que conecta mecánicos profesionales con clientes que necesitan servicios de calidad.
            </p>
          </div>

          {/* Servicios */}
          <div>
            <h4 className="text-white font-semibold mb-4">Servicios</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/dashboard" className="hover:text-orange-500 transition">
                  Panel de Control
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-orange-500 transition">
                  Inicio
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/terms" className="hover:text-orange-500 transition">
                  Términos de Servicio
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-orange-500 transition">
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:text-orange-500 transition">
                  Política de Cookies
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contacto</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="mailto:info@motohelp.com" className="hover:text-orange-500 transition">
                  info@motohelp.com
                </a>
              </li>
              <li>
                <a href="tel:+573103904286" className="hover:text-orange-500 transition">
                  +57 310 3904286
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p>
              &copy; {currentYear} MotoHelp. Todos los derechos reservados.
            </p>
            <div className="flex gap-6">
              <Link href="/terms" className="hover:text-orange-500 transition">
                Términos
              </Link>
              <Link href="/privacy" className="hover:text-orange-500 transition">
                Privacidad
              </Link>
              <Link href="/cookies" className="hover:text-orange-500 transition">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
