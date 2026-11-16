from typing import Callable, Optional

from sqlmodel import Session

from app.core.database import session_factory


class UnitOfWork:
    """Abre la sesión en __enter__; commit, rollback y close en __exit__."""

    def __init__(self, factory: Callable[[], Session] = session_factory) -> None:
        self._factory = factory
        self.session: Session = None  # type: ignore[assignment]

    def _init_repositories(self, session: Session) -> None:
        """Las subclases crean aquí sus repositorios sobre la misma sesión."""

    def __enter__(self) -> "UnitOfWork":
        self.session = self._factory()
        self._init_repositories(self.session)
        return self

    def __exit__(self, exc_type, exc_value, traceback) -> Optional[bool]:  # type: ignore[no-untyped-def]
        try:
            if exc_type is None:
                self.session.commit()
            else:
                self.session.rollback()
        except Exception:
            self.session.rollback()
            raise
        finally:
            self.session.close()
        return False
