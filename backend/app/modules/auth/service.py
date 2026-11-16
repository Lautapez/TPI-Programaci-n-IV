from fastapi import HTTPException, status

from app.core.security import create_access_token, hash_password, verify_password
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.service import UsuarioDuplicado
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class AuthService:
    def __init__(self, uow: UsuarioUnitOfWork) -> None:
        self.uow = uow

    def register(self, data: UserCreate) -> UserPublic:
        username = data.username.strip()
        email = str(data.email).strip().lower()
        with self.uow as uow:
            if uow.usuarios.get_by_username(username) or uow.usuarios.get_by_email(
                email
            ):
                raise UsuarioDuplicado("El username o el email ya están registrados")
            usuario = Usuario(
                username=username,
                full_name=data.full_name.strip(),
                email=email,
                hashed_password=hash_password(data.password),
                role="user",  # el registro público siempre crea rol user
            )
            uow.usuarios.add(usuario)
            return UserPublic.model_validate(usuario)

    def login(self, username: str, password: str) -> str:
        """Devuelve el JWT. 401 si las credenciales son incorrectas; 400 si la cuenta está desactivada."""
        with self.uow as uow:
            usuario = uow.usuarios.get_by_username(username.strip())
            if usuario is None and "@" in username:
                usuario = uow.usuarios.get_by_email(username.strip().lower())
            if usuario is None or not verify_password(password, usuario.hashed_password):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Credenciales incorrectas",
                )
            if usuario.disabled:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Cuenta de usuario desactivada",
                )
            return create_access_token({"sub": str(usuario.id), "role": usuario.role})
