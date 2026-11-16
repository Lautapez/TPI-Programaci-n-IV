from fastapi import APIRouter, Depends, HTTPException

from app.core.deps import require_role
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.service import (
    AutodesactivacionNoPermitida,
    UsuarioNoEncontrado,
    UsuarioService,
)
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

router = APIRouter(prefix="/admin/usuarios", tags=["Usuarios (admin)"])


def get_usuario_service() -> UsuarioService:
    return UsuarioService(UsuarioUnitOfWork())


@router.get("", response_model=list[UserPublic])
def listar_usuarios(
    service: UsuarioService = Depends(get_usuario_service),
    _admin: Usuario = Depends(require_role(["admin"])),
) -> list[UserPublic]:
    return service.listar()


@router.post("/{usuario_id}/activar", response_model=UserPublic)
def activar_usuario(
    usuario_id: int,
    service: UsuarioService = Depends(get_usuario_service),
    _admin: Usuario = Depends(require_role(["admin"])),
) -> UserPublic:
    try:
        return service.activar(usuario_id)
    except UsuarioNoEncontrado as exc:
        raise HTTPException(status_code=404, detail=str(exc))


@router.post("/{usuario_id}/desactivar", response_model=UserPublic)
def desactivar_usuario(
    usuario_id: int,
    service: UsuarioService = Depends(get_usuario_service),
    admin: Usuario = Depends(require_role(["admin"])),
) -> UserPublic:
    try:
        return service.desactivar(usuario_id, actor_id=admin.id)  # type: ignore[arg-type]
    except UsuarioNoEncontrado as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except AutodesactivacionNoPermitida as exc:
        raise HTTPException(status_code=400, detail=str(exc))
