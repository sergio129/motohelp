// Componente reutilizable para calificar un servicio
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface RatingComponentProps {
  serviceId: string;
  onSubmit: (rating: number, comment: string) => Promise<void>;
  isLoading?: boolean;
  existingRating?: { id: string; rating: number; comment: string } | null;
}

export function RatingComponent({ serviceId, onSubmit, isLoading, existingRating }: RatingComponentProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(existingRating ? true : false);
  const [submittedRating, setSubmittedRating] = useState(existingRating?.rating || 0);
  const [submittedComment, setSubmittedComment] = useState(existingRating?.comment || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(rating, comment);
      // Solo marcar como submitted si no hubo error
      setSubmittedRating(rating);
      setSubmittedComment(comment);
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Vista después de enviar - modo solo lectura
  if (isSubmitted) {
    return (
      <Card className="border-green-500/30 bg-green-500/10 text-white">
        <CardHeader>
          <CardTitle className="text-green-400">✓ Calificación enviada</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Tu calificación</Label>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={`text-xl ${i < submittedRating ? "text-yellow-400" : "text-slate-600"}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-lg font-semibold text-green-400">{submittedRating}/5</span>
              </div>
            </div>

            {submittedComment && (
              <div className="space-y-2">
                <Label className="text-slate-300">Tu comentario</Label>
                <p className="rounded-md border border-white/10 bg-slate-900/40 px-3 py-2 text-slate-200">
                  {submittedComment}
                </p>
              </div>
            )}

            <p className="text-xs text-green-300">
              Gracias por tu calificación. Esta información ayuda a mejorar el servicio.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-white/10 bg-white/5 text-white">
      <CardHeader>
        <CardTitle className="text-white">Calificar servicio</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label className="text-slate-200">Calificación (1-5 estrellas)</Label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="h-2 flex-1 rounded-lg bg-slate-700 appearance-none"
              />
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-orange-400/60 bg-orange-500/20 text-sm font-bold text-orange-200">
                {rating}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-200" htmlFor="comment">
              Comentario (opcional)
            </Label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Cuéntanos tu experiencia..."
              className="min-h-24 w-full rounded-md border border-white/10 bg-slate-900/60 px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="bg-orange-500 text-slate-950 hover:bg-orange-400"
          >
            {isSubmitting ? "Enviando..." : "Enviar calificación"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
