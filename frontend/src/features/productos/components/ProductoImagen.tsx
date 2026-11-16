import { useState } from "react";

// Una baldosa de color por categoría cuando el producto no tiene imagen (o falla al cargar).
const tonos = [
  "bg-pimiento text-white",
  "bg-leaf text-white",
  "bg-mostaza text-ink",
  "bg-ink text-chalk",
  "bg-sky-700 text-white",
];

interface ProductoImagenProps {
  nombre: string;
  imagenUrl: string | null;
  categoriaId: number;
  className?: string;
}

export function ProductoImagen({ nombre, imagenUrl, categoriaId, className = "" }: ProductoImagenProps) {
  const [fallo, setFallo] = useState(false);

  if (imagenUrl && !fallo) {
    return (
      <img
        src={imagenUrl}
        alt={nombre}
        loading="lazy"
        onError={() => setFallo(true)}
        className={`object-cover ${className}`}
      />
    );
  }
  return (
    <div
      role="img"
      aria-label={nombre}
      className={`grid place-items-center font-display font-extrabold ${tonos[categoriaId % tonos.length]} ${className}`}
    >
      <span className="text-6xl opacity-90">{nombre.trim().charAt(0).toUpperCase()}</span>
    </div>
  );
}
