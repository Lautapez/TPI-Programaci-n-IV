from typing import Annotated, Callable

from fastapi import Cookie, Depends, HTTPException, status

from app.core.database import session_factory
from app.core.security import decode_access_token
from app.modules.usuarios.models import Usuario


def get_current_user(
    access_token: Annotated[str | None, Cookie()] = None,
) -> Usuario:
    """Lee el JWT de la cookie HttpOnly y carga el usuario. 401 si no hay sesión válida."""
    no_autenticado = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No autenticado: inicie sesión nuevamente",
    )
    if not access_token:
        raise no_autenticado
    payload = decode_access_token(access_token)
    if payload is None or "sub" not in payload:
        raise no_autenticado
    try:
        user_id = int(payload["sub"])
    except (TypeError, ValueError):
        raise no_autenticado
    with session_factory() as session:
        usuario = session.get(Usuario, user_id)
    if usuario is None:
        raise no_autenticado
    return usuario


def get_current_active_user(
    usuario: Annotated[Usuario, Depends(get_current_user)],
) -> Usuario:
    if usuario.disabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cuenta de usuario desactivada",
        )
    return usuario


def require_role(roles: list[str]) -> Callable[..., Usuario]:
    def checker(
        usuario: Annotated[Usuario, Depends(get_current_active_user)],
    ) -> Usuario:
        if usuario.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tiene permisos para realizar esta acción",
            )
        return usuario

    return checker
