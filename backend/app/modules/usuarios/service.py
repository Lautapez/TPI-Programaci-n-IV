from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class UsuarioNoEncontrado(Exception):
    pass


class UsuarioDuplicado(Exception):
    pass


class AutodesactivacionNoPermitida(Exception):
    """Regla de negocio: un admin no puede desactivarse a sí mismo (400)."""


class UsuarioService:
    def __init__(self, uow: UsuarioUnitOfWork) -> None:
        self.uow = uow

    def listar(self) -> list[UserPublic]:
        with self.uow as uow:
            return [UserPublic.model_validate(u) for u in uow.usuarios.list_all()]

    def activar(self, usuario_id: int) -> UserPublic:
        return self._set_disabled(usuario_id, False, actor_id=None)

    def desactivar(self, usuario_id: int, actor_id: int) -> UserPublic:
        return self._set_disabled(usuario_id, True, actor_id=actor_id)

    def _set_disabled(
        self, usuario_id: int, disabled: bool, actor_id: int | None
    ) -> UserPublic:
        with self.uow as uow:
            usuario = uow.usuarios.get_by_id(usuario_id)
            if usuario is None:
                raise UsuarioNoEncontrado("Usuario no encontrado")
            if disabled and actor_id == usuario.id:
                raise AutodesactivacionNoPermitida(
                    "Un administrador no puede desactivarse a sí mismo"
                )
            usuario.disabled = disabled  # idempotente
            uow.session.add(usuario)
            uow.session.flush()
            uow.session.refresh(usuario)
            return UserPublic.model_validate(usuario)
