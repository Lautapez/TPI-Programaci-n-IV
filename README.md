# Food Store

Aplicación web de pedidos de comida · TPI Programación 4 · UTN (Tecnicatura Universitaria en Programación a Distancia).

- **Backend:** FastAPI + SQLModel, arquitectura en capas con Unit of Work, JWT en cookie HttpOnly y roles (`user` / `admin`).
- **Frontend:** React 19 + TypeScript (strict) + Vite + Tailwind CSS, TanStack Query / Form / Table, Zustand y Axios.

| | |
|---|---|
| **Repositorio** | `https://github.com/Lautapez/TPI-Programaci-n-IV` |
| **Video de demostración** | `https://youtu.be/HCL7DeEmEZ4` |
| **Autor** | `Lautaro Pez Argonz, Legajo 611616` |

---

## 1. Requisitos

| Herramienta | Versión | Cómo verificar |
|---|---|---|
| Python | **3.11 a 3.13** (con 3.14 SQLModel no funciona) | `python --version` |
| Node.js | 20.19 o superior | `node --version` |
| pnpm | 9 o superior | `pnpm --version` (si falta: `npm install -g pnpm`) |
| Base de datos | SQLite (incluida con Python) **o** PostgreSQL 15+ | — |

> En Windows, si `python` no responde, probá `py -3.12` en su lugar.

> **Windows:** clonar o descomprimir el proyecto en una ruta **corta** (por ejemplo `C:\proyectos\food-store`), fuera de OneDrive y de carpetas anidadas. Con rutas de más de ~260 caracteres, `pnpm build` y `pnpm dev` fallan con `ERR_PACKAGE_IMPORT_NOT_DEFINED: #module-sync-enabled`.

Son **dos proyectos independientes**: el backend corre en el puerto **8000** y el frontend en el **5173**.
Hay que dejar **dos terminales abiertas** (una por proyecto).

---

## 2. Backend (terminal 1)

### 2.1 Entorno virtual e instalación

Desde la raíz del repositorio:

```bash
cd backend
python -m venv venv
```

Activar el entorno (según tu terminal):

| Terminal | Comando |
|---|---|
| Linux / macOS | `source venv/bin/activate` |
| Windows · Git Bash | `source venv/Scripts/activate` |
| Windows · PowerShell | `venv\Scripts\Activate.ps1` |
| Windows · CMD | `venv\Scripts\activate.bat` |

> PowerShell: si bloquea el script, ejecutar una vez `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`.

Instalar dependencias (versiones fijadas en `requirements.txt`):

```bash
python -m pip install -r requirements.txt
```

### 2.2 Variables de entorno

Copiar el ejemplo a `.env`:

| Terminal | Comando |
|---|---|
| Linux / macOS / Git Bash | `cp .env.example .env` |
| Windows · PowerShell / CMD | `copy .env.example .env` |

`backend/.env.example` ya viene listo para **SQLite**, así que **no hace falta editar nada** para probar.

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `DATABASE_URL` | Conexión a la base | `sqlite:///./foodstore.db` |
| `SECRET_KEY` | Firma del JWT (mín. 32 caracteres) | `cambiar-esta-clave-de-al-menos-32-caracteres` |
| `ALGORITHM` | Algoritmo del JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Expiración de cookie y token | `30` |
| `FRONTEND_ORIGIN` | Origen permitido en CORS | `http://localhost:5173` |
| `COOKIE_SECURE` | `true` solo en producción con HTTPS | `false` |

**Usar PostgreSQL (opcional):** crear la base y cambiar `DATABASE_URL` en `.env`.

```sql
CREATE DATABASE foodstore_db;
```
```
DATABASE_URL=postgresql://postgres:TU_PASSWORD@localhost:5432/foodstore_db
```

Si la contraseña tiene caracteres especiales hay que codificarlos en la URL (por ejemplo `@` → `%40`).

### 2.3 Cargar datos iniciales (seed)

```bash
python -m app.db.seed
```

Es **idempotente** (se puede ejecutar varias veces sin duplicar datos). Crea las tablas, el usuario admin, 4 categorías y 10 productos con stock. Debe terminar con:

```
Seed completado: admin / Admin1234! · 4 categorías · 10 productos
```

### 2.4 Levantar el servidor

```bash
python -m uvicorn app.main:app --reload
```

Verificación: abrir <http://localhost:8000/docs> (Swagger) o <http://localhost:8000/redoc>. Deben verse todos los endpoints bajo `/api/v1`.

---

## 3. Frontend (terminal 2)

```bash
cd frontend
```

Copiar el ejemplo de variables:

| Terminal | Comando |
|---|---|
| Linux / macOS / Git Bash | `cp .env.example .env` |
| Windows · PowerShell / CMD | `copy .env.example .env` |

`frontend/.env` contiene una única variable:

```
VITE_API_URL=http://localhost:8000/api/v1
```

Instalar, verificar tipos y ejecutar:

```bash
pnpm install
pnpm build      # verifica los tipos (TypeScript strict) y compila
pnpm dev        # http://localhost:5173
```

Abrir <http://localhost:5173>.

> **Importante:** entrar por `http://localhost:5173` (no `127.0.0.1`). El backend solo acepta ese origen en CORS y la cookie de sesión es de `localhost`.

---

## 4. Usuarios de prueba

| Usuario | Contraseña | Rol | Origen |
|---|---|---|---|
| `admin` | `Admin1234!` | `admin` | Creado por el seed |
| *(el que se registre)* | mín. 8 caracteres | `user` | Pantalla **Crear cuenta** (`/register`) |

---

## 5. Recorrido rápido para probar todo

1. **Cliente:** `/register` → crear cuenta (entra automáticamente) → en el catálogo buscar, filtrar por categoría y **Agregar al carrito** → **Carrito** → **Continuar al checkout** → dirección + forma de pago → **Confirmar pedido** → **Mis pedidos**.
2. **Admin:** cerrar sesión → ingresar con `admin` / `Admin1234!` → **Panel de administración**:
   - **Resumen:** indicadores del negocio.
   - **Pedidos:** avanzar Pendiente → En preparación → Entregado, o cancelar.
   - **Productos / Categorías:** alta, edición, baja y cambio de stock y disponibilidad.
   - **Usuarios:** activar y desactivar (el admin no puede desactivarse a sí mismo).
3. **Stock:** al confirmar un pedido el stock del producto baja; al cancelarlo (cliente en Pendiente o admin) **vuelve a subir**.

---

## 6. Estructura del proyecto

```
food-store/
├── README.md
├── backend/
│   ├── requirements.txt          # versiones fijadas (passlib 1.7.4 + bcrypt 4.0.1)
│   ├── .env.example
│   └── app/
│       ├── main.py               # FastAPI, CORS con credenciales, prefijo /api/v1
│       ├── core/                 # config, database, security, deps, unit_of_work, base_repository
│       ├── modules/
│       │   ├── auth/             # router, service, schemas (usa el modelo Usuario)
│       │   ├── usuarios/         # models, schemas, repository, unit_of_work, service, router
│       │   ├── categorias/       # misma cadena de archivos
│       │   ├── productos/        # misma cadena de archivos
│       │   └── pedidos/          # misma cadena + máquina de estados y reglas RN-01..RN-06
│       └── db/seed.py            # seed idempotente
└── frontend/
    ├── package.json              # versiones fijadas + pnpm-lock.yaml
    ├── .env.example
    └── src/
        ├── shared/               # api (axios, handleApiError, queryClient), ui, components, layout
        ├── features/             # auth, categorias, productos, usuarios, pedidos
        │                         #   cada una: pages / components / hooks / api / types
        ├── store/                # authStore y cartStore (Zustand + persist)
        └── routes/               # AppRouter y ProtectedRoute
```

### Arquitectura del backend

`Router → Service → Unit of Work → Repository → Model`. El Router solo habla HTTP y traduce excepciones de dominio a `HTTPException`; el Service aplica las reglas de negocio dentro de `with self.uow as uow:` y devuelve el schema de salida dentro del bloque; **el commit/rollback ocurre únicamente en `UnitOfWork.__exit__`** (ningún Service ni Router llama a `session.commit()`).

### Decisiones de diseño

- **Sesión:** el JWT viaja solo en la cookie `access_token` (HttpOnly). El frontend nunca lo lee ni lo guarda; `authStore` persiste únicamente el usuario.
- **Pedidos transaccionales:** el pedido se crea completo o no se crea. El stock se descuenta al crear y se restituye al cancelar, en la misma transacción. En PostgreSQL las filas de producto se bloquean (`SELECT … FOR UPDATE`) para evitar sobreventa concurrente.
- **Inmutabilidad:** `DetallePedido` copia `nombre_producto` y `precio_unitario`; no existen endpoints para editar ni borrar pedidos.
- **Baja lógica:** categorías y productos usan `activo`; usuarios usan `disabled`.
- **Estado del frontend:** TanStack Query para datos del servidor; Zustand para sesión y carrito. La protección real de los permisos está en el backend (`require_role`).
- **Fechas:** se guardan con la hora local del servidor; "pedidos de hoy" usa el día local del servidor.

---

## 7. Problemas frecuentes

| Síntoma | Causa y solución |
|---|---|
| `ModuleNotFoundError: No module named 'sqlmodel'` | El entorno virtual no está activo o no se instalaron las dependencias. Activar el `venv` y ejecutar `python -m pip install -r requirements.txt`. |
| `ValidationError ... SECRET_KEY` | Falta `backend/.env` o se ejecutó fuera de la carpeta `backend/`. |
| `No module named 'app'` | Hay que estar parado dentro de `backend/` (donde está la carpeta `app/`). |
| `UnicodeDecodeError` al conectar | Con PostgreSQL: usuario, contraseña o base de `DATABASE_URL` incorrectos (el error real queda enmascarado por la codificación de Windows). Revisar los datos o usar SQLite. |
| `uvicorn` no se reconoce como comando | Usar `python -m uvicorn app.main:app --reload`. |
| El front carga pero no hay datos / error de red | El backend no está corriendo, o `VITE_API_URL` es incorrecta, o se abrió el front con `127.0.0.1` en lugar de `localhost`. |
| Después de cambiar `.env` del front no hay efecto | Reiniciar `pnpm dev` (Vite lee las variables al arrancar). |
| Seed ya ejecutado y quiero empezar de cero | Con SQLite: borrar `backend/foodstore.db` y volver a ejecutar el seed. |
| `ERR_PACKAGE_IMPORT_NOT_DEFINED ... #module-sync-enabled` al correr `pnpm build` o `pnpm dev` | La ruta del proyecto es demasiado larga para Windows. Mover el proyecto a una ruta corta (`C:\proyectos\food-store`), borrar `frontend/node_modules` y volver a ejecutar `pnpm install`. |
