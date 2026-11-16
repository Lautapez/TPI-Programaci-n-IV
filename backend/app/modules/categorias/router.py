from fastapi import APIRouter, Depends, HTTPException

from app.core.deps import require_role
from app.modules.categorias.schemas import (
    CategoriaCreate,
    CategoriaRead,
    CategoriaUpdate,
)
from app.modules.categorias.service import (
    CategoriaNoEncontrada,
    CategoriaService,
    NombreDuplicado,
)
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork
from app.modules.usuarios.models import Usuario

router = APIRouter(prefix="/categorias", tags=["Categorías"])


def get_categoria_service() -> CategoriaService:
    return CategoriaService(CategoriaUnitOfWork())


@router.get("", response_model=list[CategoriaRead])
def listar_categorias(
    service: CategoriaService = Depends(get_categoria_service),
) -> list[CategoriaRead]:
    return service.listar()


@router.get("/{categoria_id}", response_model=CategoriaRead)
def obtener_categoria(
    categoria_id: int, service: CategoriaService = Depends(get_categoria_service)
) -> CategoriaRead:
    try:
        return service.obtener(categoria_id)
    except CategoriaNoEncontrada as exc:
        raise HTTPException(status_code=404, detail=str(exc))


@router.post("", response_model=CategoriaRead, status_code=201)
def crear_categoria(
    data: CategoriaCreate,
    service: CategoriaService = Depends(get_categoria_service),
    _admin: Usuario = Depends(require_role(["admin"])),
) -> CategoriaRead:
    try:
        return service.crear(data)
    except NombreDuplicado as exc:
        raise HTTPException(status_code=409, detail=str(exc))


@router.put("/{categoria_id}", response_model=CategoriaRead)
def actualizar_categoria(
    categoria_id: int,
    data: CategoriaUpdate,
    service: CategoriaService = Depends(get_categoria_service),
    _admin: Usuario = Depends(require_role(["admin"])),
) -> CategoriaRead:
    try:
        return service.actualizar(categoria_id, data)
    except CategoriaNoEncontrada as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except NombreDuplicado as exc:
        raise HTTPException(status_code=409, detail=str(exc))


@router.delete("/{categoria_id}", status_code=204)
def eliminar_categoria(
    categoria_id: int,
    service: CategoriaService = Depends(get_categoria_service),
    _admin: Usuario = Depends(require_role(["admin"])),
) -> None:
    try:
        service.eliminar(categoria_id)
    except CategoriaNoEncontrada as exc:
        raise HTTPException(status_code=404, detail=str(exc))
