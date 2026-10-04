# AutoNova Motors — Frontend

Interfaz web de **AutoNova Motors**, desarrollada con **Angular 22, Bootstrap 5.3 y Bootstrap Icons**.

Consume la API REST desarrollada con Spring Boot ubicada en `Proyecto_back/Concesionaria_spring`.

## Tecnologías

- Angular 22
- TypeScript
- Bootstrap 5.3
- Bootstrap Icons
- Angular Signals
- Standalone Components
- Lazy Loading
- Vitest

## Requisitos

- Node.js 22.22.3 o superior
- npm

Verifica la versión de Node.js:

```powershell
node -v
```

## Ejecución

Primero inicia el backend y verifica que esté disponible en:

```text
http://127.0.0.1:8081
```

Luego ejecuta:

```powershell
cd Proyecto_front\Concesionaria_Angular
npm install
npm start
```

La aplicación estará disponible en:

```text
http://localhost:4200
```

El proyecto utiliza `proxy.conf.json` para redirigir las solicitudes `/api` hacia el backend.

## Funcionalidades

-  Catálogo público de vehículos.
-  Inicio de sesión y control de acceso.
-  Dashboard de indicadores.
-  Gestión de vehículos e inventario.
-  Gestión de clientes.
-  Gestión de reservas.
-  Registro e historial de ventas.
-  Administración de usuarios.

## Roles

| Rol | Acceso principal |
|---|---|
| Administrador | Todas las funcionalidades |
| Asesor de Ventas | Clientes, reservas y ventas |
| Jefe de Almacén | Vehículos e inventario |

## Comandos

```powershell
npm start       # Iniciar aplicación
npm run build   # Generar compilación
npm test        # Ejecutar pruebas
```

## Estructura

```text
src/app
├── components
├── guards
├── models
├── modules
└── services
```

## Desarrolladores

- **Irineo Huallpa Atoccsa**
- **Luis Alberto Cornejo Arcaya**
- **Renzo Lauriano Vasquez Vasquez**
- **Ricardo Fabian Gonzales Aguirre**