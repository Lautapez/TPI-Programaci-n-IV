import { Card } from "../../../shared/ui/Card";

interface ResumenCardProps {
  titulo: string;
  valor: string;
  /** Color de la franja lateral que identifica el indicador. */
  franja: string;
}

export function ResumenCard({ titulo, valor, franja }: ResumenCardProps) {
  return (
    <Card className="flex overflow-hidden">
      <div aria-hidden="true" className={`w-2 ${franja}`} />
      <div className="p-5">
        <p className="text-muted">{titulo}</p>
        <p className="mt-1 font-display text-4xl font-extrabold">{valor}</p>
      </div>
    </Card>
  );
}
