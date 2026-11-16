import type { Categoria } from "../../categorias/types";

export interface Producto {
  id: number;
  categoria_id: number;
  nombre: string;
  descripcion: string | null;
  precio_base: number;
  imagen_url: string | null;
  stock: number;
  disponible: boolean;
  activo: boolean;
  categoria: Categoria | null;
}

export interface ProductosPaginados {
  total: number;
  items: Producto[];
  page: number;
  size: number;
  pages: number;
}

export interface FiltrosProductos {
  search?: string;
  categoria_id?: number;
  disponible?: boolean;
  skip: number;
  limit: number;
}

export interface ProductoCreate {
  nombre: string;
  descripcion: string | null;
  precio_base: number;
  imagen_url: string | null;
  stock: number;
  disponible: boolean;
  categoria_id: number;
}

export type ProductoUpdate = Partial<ProductoCreate>;

export interface ProductoStockUpdate {
  stock: number;
  disponible?: boolean;
}
