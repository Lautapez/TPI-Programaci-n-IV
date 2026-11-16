import { Button } from "../ui/Button";

interface EstadoErrorProps {
  mensaje: string;
  onReintentar?: () => void;
}

export function EstadoError({ mensaje, onReintentar }: EstadoErrorProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-3 rounded-lg border border-pimiento/40 bg-red-50 px-5 py-4"
    >
      <p className="font-semibold text-pimiento-dark">{mensaje}</p>
      {onReintentar && (
        <Button variant="danger" size="sm" onClick={onReintentar}>
          Reintentar
        </Button>
      )}
    </div>
  );
}
