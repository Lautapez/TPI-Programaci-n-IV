import math
from datetime import datetime


def now() -> datetime:
    """Fecha y hora actual (naive, hora del servidor)."""
    return datetime.now()


def resolve_paging(
    skip: int, limit: int, page: int | None, size: int | None
) -> tuple[int, int]:
    """Si llegan page/size, tienen prioridad sobre skip/limit."""
    if page is not None:
        size_final = size if size is not None else limit
        return (page - 1) * size_final, size_final
    return skip, limit


def paging_meta(total: int, skip: int, limit: int) -> dict[str, int]:
    return {
        "page": skip // limit + 1,
        "size": limit,
        "pages": math.ceil(total / limit) if total else 0,
    }
