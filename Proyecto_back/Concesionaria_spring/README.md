# AutoNova Motors — Backend

API REST para la gestión de una concesionaria de vehículos, desarrollada con **Java 21, Spring Boot 3.4, JPA/Hibernate y H2**.

Permite gestionar vehículos, inventario, clientes, reservas, ventas y usuarios con control de acceso por roles.

## Tecnologías

- Java 21
- Spring Boot 3.4
- Spring Data JPA / Hibernate
- H2 Database
- Maven
- BCrypt
- Angular (frontend)

## Requisitos

- JDK 21
- Maven 3.9+

No es necesario instalar una base de datos externa. H2 almacena la información en:

```text
data/concesionaria.mv.db
```

## Ejecución

```powershell
cd Proyecto_back\Concesionaria_spring
mvn spring-boot:run
```

API disponible en:

```text
http://127.0.0.1:8081/api
```

Documentación interactiva Swagger UI:

```text
http://127.0.0.1:8081/swagger-ui/index.html
```

Especificación OpenAPI en JSON:

```text
http://127.0.0.1:8081/v3/api-docs
```

Para ejecutar las pruebas:

```powershell
mvn test
```

## Base de datos

Con el backend iniciado, la consola H2 está disponible en:

```text
http://127.0.0.1:8081/h2-console
```

**JDBC URL:**

```text
jdbc:h2:file:./data/concesionaria
```

**Usuario:** `sa`  
**Contraseña:** vacía

## Funcionalidades

-  Autenticación y control de acceso por roles.
-  Gestión de vehículos e inventario.
-  Registro y consulta de clientes.
-  Gestión de reservas.
-  Registro de ventas.
-  Administración de usuarios.
-  Contraseñas protegidas mediante BCrypt.

Al concretar una reserva, el inventario libera la unidad; las reservas pendientes mantienen el vehículo bloqueado. El backend reconcilia al iniciar las unidades que quedaron como reservadas o vendidas por reservas ya concretadas.

## Roles

| Rol | Acceso |
|---|---|
| Administrador | Todas las funcionalidades |
| Asesor de Ventas | Clientes, reservas y ventas |
| Jefe de Almacén | Vehículos e inventario |

## Frontend

El backend es consumido por el proyecto Angular:

```text
Proyecto_front/Concesionaria_Angular
```

## Desarrolladores

- **Irineo Huallpa Atoccsa**
- **Luis Alberto Cornejo Arcaya**
- **Renzo Lauriano Vasquez Vasquez**
- **Ricardo Fabian Gonzales Aguirre**