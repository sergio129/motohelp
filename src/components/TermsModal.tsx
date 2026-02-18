'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

export function TermsModal({ isOpen, onClose, onAccept }: TermsModalProps) {
  const { data: session } = useSession();
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [acceptCookies, setAcceptCookies] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAccept = async () => {
    if (!acceptTerms) {
      toast.error('Debe aceptar los términos de servicio');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/terms-acceptance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          acceptTerms,
          acceptPrivacy,
          acceptCookies,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al aceptar términos');
      }

      toast.success('Términos aceptados correctamente');
      onAccept();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al aceptar los términos');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 border-b">
          <h2 className="text-2xl font-bold">Términos y Condiciones</h2>
          <p className="text-orange-100 text-sm mt-1">
            Por favor, revisa y acepta nuestros términos para continuar
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Checkboxes */}
          <div className="space-y-3 mb-6 pb-6 border-b border-slate-200">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="acceptTerms"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-1 w-4 h-4 rounded"
              />
              <label htmlFor="acceptTerms" className="text-sm cursor-pointer">
                Acepto los{' '}
                <Link href="/terms" target="_blank" className="text-orange-600 hover:text-orange-700 underline">
                  Términos de Servicio
                </Link>
                {' '}*
              </label>
            </div>

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="acceptPrivacy"
                checked={acceptPrivacy}
                onChange={(e) => setAcceptPrivacy(e.target.checked)}
                className="mt-1 w-4 h-4 rounded"
              />
              <label htmlFor="acceptPrivacy" className="text-sm cursor-pointer">
                Acepto la{' '}
                <Link href="/privacy" target="_blank" className="text-orange-600 hover:text-orange-700 underline">
                  Política de Privacidad
                </Link>
              </label>
            </div>

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="acceptCookies"
                checked={acceptCookies}
                onChange={(e) => setAcceptCookies(e.target.checked)}
                className="mt-1 w-4 h-4 rounded"
              />
              <label htmlFor="acceptCookies" className="text-sm cursor-pointer">
                Acepto la{' '}
                <Link href="/cookies" target="_blank" className="text-orange-600 hover:text-orange-700 underline">
                  Política de Cookies
                </Link>
              </label>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <p className="text-sm text-slate-700">
              <strong>Nota:</strong> Es requerido aceptar los términos de servicio para usar MotoHelp. 
              Las otras políticas son opcionales pero recomendadas para tu protección.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 p-6 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleAccept}
            disabled={isLoading || !acceptTerms}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isLoading ? 'Aceptando...' : 'Aceptar y Continuar'}
          </Button>
        </div>
      </div>
    </div>
  );
}
