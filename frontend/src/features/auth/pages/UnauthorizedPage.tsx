import { Link } from "react-router-dom";
import { EstadoVacio } from "../../../shared/components/EstadoVacio";

export function UnauthorizedPage({ noEncontrada = false }: { noEncontrada?: boolean }) {
  return (
    <EstadoVacio
      titulo={noEncontrada ? "Esta página no existe" : "No tenés permiso para entrar acá"}
      descripcion={
        noEncontrada
          ? "Revisá la dirección o volvé al catálogo."
          : "Tu cuenta no tiene el rol necesario para ver esta sección."
      }
      accion={
        <Link
          to="/"
          className="rounded-md bg-ink px-4 py-2.5 font-semibold text-chalk hover:bg-black"
        >
          Volver al inicio
        </Link>
      }
    />
  );
}
