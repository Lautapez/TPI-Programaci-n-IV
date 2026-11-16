import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useCartStore } from "../../store/cartStore";

const enlace = ({ isActive }: { isActive: boolean }) =>
  `rounded px-3 py-1.5 text-base font-medium transition-colors ${
    isActive ? "bg-chalk text-ink" : "text-chalk/80 hover:text-white"
  }`;

export function Navbar() {
  const usuario = useAuthStore((s) => s.usuario);
  const logout = useAuthStore((s) => s.logout);
  const cantidad = useCartStore((s) => s.cantidadTotal());
  const navigate = useNavigate();

  const cerrarSesion = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="bg-ink text-chalk">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="grid size-9 place-items-center rounded-md bg-pimiento font-display text-lg font-extrabold text-white"
          >
            F
          </span>
          <span className="font-display text-xl font-extrabold tracking-tight">Food Store</span>
        </Link>

        <nav aria-label="Principal" className="flex flex-wrap items-center gap-1">
          <NavLink to="/" end className={enlace}>
            Catálogo
          </NavLink>
          <NavLink to="/carrito" className={enlace}>
            Carrito{cantidad > 0 ? ` (${cantidad})` : ""}
          </NavLink>
          {usuario && (
            <NavLink to="/mis-pedidos" className={enlace}>
              Mis pedidos
            </NavLink>
          )}
          {usuario?.role === "admin" && (
            <NavLink to="/admin/resumen" className={enlace}>
              Panel de administración
            </NavLink>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          {usuario ? (
            <>
              <p className="text-right text-sm leading-tight">
                <span className="block font-semibold">{usuario.full_name}</span>
                <span className="text-chalk/70">
                  {usuario.role === "admin" ? "Administrador" : "Cliente"}
                </span>
              </p>
              <button
                type="button"
                onClick={() => void cerrarSesion()}
                className="rounded-md border border-chalk/50 px-3 py-1.5 text-sm font-semibold text-chalk transition-colors hover:bg-white/10"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="px-3 py-1.5 font-medium text-chalk/90 hover:text-white">
                Ingresar
              </Link>
              <Link
                to="/register"
                className="rounded-md bg-pimiento px-4 py-2 font-semibold text-white hover:bg-pimiento-dark"
              >
                Crear cuenta
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
