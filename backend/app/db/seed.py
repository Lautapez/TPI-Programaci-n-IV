"""Seed idempotente: admin, categorías y productos. Ejecutar: python -m app.db.seed"""

from sqlmodel import select

from app.core.database import create_all_tables
from app.core.security import hash_password
from app.core.unit_of_work import UnitOfWork
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.usuarios.models import Usuario

ADMIN = {
    "username": "admin",
    "full_name": "Administrador",
    "email": "admin@foodstore.com",
    "password": "Admin1234!",
}

CATALOGO: dict[str, tuple[str, list[tuple[str, str, float, int]]]] = {
    "Hamburguesas": (
        "Carne smasheada, pan de papa y salsas de la casa",
        [
            ("Clásica", "Carne, cheddar, lechuga, tomate y salsa de la casa", 8500, 30),
            ("Doble bacon", "Doble carne, cheddar, panceta crocante y barbacoa", 10900, 25),
            ("Veggie", "Medallón de lentejas, rúcula, tomate y mayonesa de ajo", 8900, 20),
        ],
    ),
    "Pizzas": (
        "Masa de 48 horas, horno de piedra",
        [
            ("Muzzarella", "Salsa de tomate, muzzarella y aceitunas", 9500, 20),
            ("Fugazzeta", "Cebolla caramelizada y doble queso", 10500, 18),
            ("Napolitana", "Muzzarella, tomate fresco, ajo y albahaca", 10200, 15),
        ],
    ),
    "Bebidas": (
        "Frías y sin apuro",
        [
            ("Limonada con menta", "Jarra de 500 ml, jengibre opcional", 3200, 40),
            ("Gaseosa 500 ml", "Cola, lima-limón o naranja", 2400, 60),
        ],
    ),
    "Postres": (
        "Para cerrar bien",
        [
            ("Flan casero", "Con dulce de leche y crema", 4200, 15),
            ("Brownie con helado", "Chocolate semiamargo y helado de crema", 5400, 12),
        ],
    ),
}


def run() -> None:
    create_all_tables()
    with UnitOfWork() as uow:
        session = uow.session

        if session.exec(select(Usuario).where(Usuario.username == ADMIN["username"])).first() is None:
            session.add(
                Usuario(
                    username=ADMIN["username"],
                    full_name=ADMIN["full_name"],
                    email=ADMIN["email"],
                    hashed_password=hash_password(ADMIN["password"]),
                    role="admin",
                )
            )

        for nombre_cat, (descripcion, productos) in CATALOGO.items():
            categoria = session.exec(
                select(Categoria).where(Categoria.nombre == nombre_cat)
            ).first()
            if categoria is None:
                categoria = Categoria(nombre=nombre_cat, descripcion=descripcion)
                session.add(categoria)
                session.flush()
            for nombre, desc, precio, stock in productos:
                existe = session.exec(
                    select(Producto).where(
                        Producto.nombre == nombre, Producto.categoria_id == categoria.id
                    )
                ).first()
                if existe is None:
                    session.add(
                        Producto(
                            categoria_id=categoria.id,  # type: ignore[arg-type]
                            nombre=nombre,
                            descripcion=desc,
                            precio_base=float(precio),
                            stock=stock,
                        )
                    )
    print("Seed completado: admin / Admin1234! · 4 categorías · 10 productos")


if __name__ == "__main__":
    run()
