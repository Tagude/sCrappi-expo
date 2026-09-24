# sCrappi

**Sistema de Control Remoto de Acceso y Permanencia de Personal in situ.**

sCrappi es una aplicación web para registrar la entrada y la salida del personal validando, con el GPS del dispositivo, que la persona esté realmente en su puesto de trabajo. Cada puesto tiene una **geovalla**, un círculo con centro y radio en metros: el marcaje solo se acepta dentro de ella.

## Funcionalidades

- **Inicio de sesión** con número de documento o nombre de usuario. Las contraseñas se guardan cifradas con BCrypt.
- **Marcaje con geovalla.** El trabajador ve su puesto en un mapa (Leaflet + OpenStreetMap) y registra su entrada o su salida. Si está fuera del radio, la app lo rechaza y le dice a qué distancia está.
- **Panel de inicio:** último evento, si la persona está dentro o fuera de su jornada y un gráfico semanal (Chart.js).
- **Administración de usuarios:** crear, editar, activar y desactivar empleados, con los roles `ADMIN`, `SUPERVISOR` y `EMPLOYED`.
- **Reportes de asistencia** filtrados por fechas y por empleado, exportables a **Excel**.
- **Hora de Colombia** en toda la app, sin importar la zona horaria del navegador.

### Roles

| Rol | Marcaje | Administración | Reportes |
|---|:---:|:---:|:---:|
| `EMPLOYED` (empleado) | ✔ | — | — |
| `SUPERVISOR` | ✔ | ✔ (sin cambiar roles) | ✔ |
| `ADMIN` | ✔ | ✔ | ✔ |

## Tecnologías

| Capa | Tecnología |
|---|---|
| Frontend | Angular 21 (standalone, sin zone.js), Bootstrap 5, ng-bootstrap, Leaflet, Chart.js, SheetJS (xlsx) |
| Backend | Java 17, Spring Boot 3.5 (Web, Data JPA, Security), Lombok |
| Base de datos | PostgreSQL |
| Pruebas | JUnit 5, Mockito, MockMvc y H2 (backend); Vitest (frontend) |

## Arquitectura

```
┌──────────────────────┐   HTTP/JSON    ┌───────────────────────────────┐   JPA    ┌────────────┐
│ Frontend Angular     │ ─────────────▶ │ Backend Spring Boot           │ ───────▶ │ PostgreSQL │
│ localhost:4200       │ ◀───────────── │ localhost:8080/api            │ ◀─────── │ db_scrappi │
│ componentes/servicios│                │ controller → service → repo   │          └────────────┘
└──────────────────────┘                └───────────────────────────────┘
         │ GPS del navegador (Geolocation API) + mapa OpenStreetMap
```

El backend sigue una arquitectura en capas:

- `controller` expone la API REST.
- `service` contiene las reglas de negocio, por ejemplo que no se puedan abrir dos jornadas a la vez.
- `repository` accede a los datos con Spring Data JPA.
- `model` contiene las entidades: `User`, `WorkStation`, `WorkLog`, `Session`, `Alert` y `Assignment`.

## Instalación

### Requisitos

- Java 17 o superior
- Node.js 20.19 o superior y npm
- PostgreSQL 14 o superior

### 1. Base de datos

Crea la base de datos vacía; las tablas se generan solas al arrancar el backend.

```sql
CREATE DATABASE db_scrappi;
```

### 2. Backend

```bash
cd backend/scrappi
cp src/main/resources/application-local.example.yml src/main/resources/application-local.yml
# edita application-local.yml con tu usuario y contraseña de PostgreSQL
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

La API queda en `http://localhost:8080/api`.

### 3. Frontend

```bash
cd frontend
npm install
npm start
```

La aplicación queda en `http://localhost:4200`.

### 4. Datos iniciales

Con el backend en marcha, crea el puesto de trabajo (estación 1) y un administrador:

```bash
curl -X POST http://localhost:8080/api/workstation -H "Content-Type: application/json" -d '{
  "name": "Puerta del Norte", "latitude": 6.351, "longitude": -75.556,
  "radio_meter": 100, "description": "CC Puerta del Norte", "status": true }'

curl -X POST http://localhost:8080/api/users -H "Content-Type: application/json" -d '{
  "document": 1000000001, "userName": "admin", "name": "Admin", "lastName": "sCrappi",
  "email": "admin@scrappi.co", "phone": 3000000000, "role": "ADMIN",
  "password": "admin123", "status": true }'
```

Después inicia sesión con el documento `1000000001` o el usuario `admin` y la contraseña `admin123`. Los demás empleados se crean desde **Administración**.

> **Probar la geovalla sin ir al puesto:** en Chrome abre DevTools → ⋮ → *More tools* → *Sensors* y en *Location* escribe las coordenadas del puesto (6.351, -75.556). Con una ubicación lejana verás el rechazo por distancia.

## Pruebas

```bash
# Backend: 17 pruebas, con H2 en memoria (no necesita PostgreSQL)
cd backend/scrappi && ./mvnw test

# Frontend: 24 pruebas
cd frontend && npx ng test --watch=false
```

| Archivo | Qué comprueba |
|---|---|
| `UserServiceTest` | Cifrado de contraseñas, edición sin perder la contraseña, login por documento o usuario, clave incorrecta (401) y usuario desactivado (403) |
| `WorkLogServiceTest` | Entrada con hora de Bogotá, jornada duplicada rechazada y salida |
| `ApiIntegrationTest` | Recorre la API real de principio a fin: alta de usuario, login, edición, entrada, salida y los errores 409 |
| `geo.spec.ts` | Distancia en metros (Haversine) y casos dentro, fuera y en el borde de la geovalla |
| `auth-guard.spec.ts` | Rutas protegidas por sesión y por rol |
| `*.service.spec.ts` | Sesión y peticiones HTTP de los servicios |

## API REST

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/users/login` | Inicia sesión con `{ identifier, password }` |
| GET · POST | `/api/users` | Lista usuarios · crea un usuario |
| GET · PUT · DELETE | `/api/users/{id}` | Consulta · edita · activa o desactiva (borrado lógico) |
| GET · POST | `/api/workstation` | Lista puestos · crea un puesto con su geovalla |
| GET | `/api/workstation/{id}` | Consulta un puesto |
| POST | `/api/worklogs` | Registra una entrada (409 si ya hay una jornada abierta) |
| PUT | `/api/worklogs/{id}/checkout` | Registra la salida (409 si ya estaba cerrada) |
| GET | `/api/worklogs` · `/user/{id}` · `/workstation/{id}` | Marcajes: todos, por usuario o por puesto |
| GET | `/api/worklogs/summary/{userId}` | Resumen para el panel de inicio |
| GET · PUT | `/api/sessions/...` | Sesiones de inicio y cierre |
| GET · POST · PUT | `/api/alerts/...` · `/api/assignments/...` | Alertas y asignaciones de puesto |

Las horas viajan en hora de Colombia con su desfase (`2026-09-23T07:13:00.000-05:00`). La contraseña nunca aparece en las respuestas.

## Estructura

```
sCrappi-expo/
├── backend/scrappi/          API Spring Boot
│   └── src/main/java/com/talentotech/scrappi/
│       ├── config/           seguridad y CORS
│       ├── controller/       endpoints REST
│       ├── service/          reglas de negocio
│       ├── repository/       acceso a datos (JPA)
│       ├── model/            entidades
│       ├── dto/              objetos de entrada y salida
│       └── exception/        manejo global de errores
└── frontend/src/app/
    ├── components/           login, dashboard, marcaje, administración y reportes
    ├── services/             llamadas a la API
    ├── guards/               protección de rutas por sesión y por rol
    └── utils/geo.ts          cálculo de distancia de la geovalla
```

## Autora

**Tania Agudelo** · [GitHub @Tagude](https://github.com/Tagude)

Proyecto productivo de la Tecnología en Desarrollo de Software.
