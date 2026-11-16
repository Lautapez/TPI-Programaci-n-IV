import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Navbar } from "./Navbar";

const seccionesAdmin = [
  { to: "/admin/resumen", texto: "Resumen" },
  { to: "/admin/pedidos", texto: "Pedidos" },
  { to: "/admin/productos", texto: "Productos" },
  { to: "/admin/categorias", texto: "Categorías" },
  { to: "/admin/usuarios", texto: "Usuarios" },
];

export function MainLayout() {
  const { pathname } = useLocation();
  const enAdmin = pathname.startsWith("/admin");

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      {enAdmin && (
        <nav aria-label="Administración" className="border-b border-line bg-white">
          <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4">
            {seccionesAdmin.map((s) => (
              <NavLink
                key={s.to}
                to={s.to}
                className={({ isActive }) =>
                  `whitespace-nowrap border-b-2 px-3 py-3 font-medium ${
                    isActive
                      ? "border-pimiento text-ink"
                      : "border-transparent text-muted hover:text-ink"
                  }`
                }
              >
                {s.texto}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
