# Tennist Server 🎾

Backend API para **Tennist**, una aplicación móvil diseñada como un ecosistema de tenis que combina seguimiento deportivo, interacción social y gestión de infraestructura deportiva.

## 📋 Descripción

Tennist Server es el backend del proyecto Tennist, construido con **NestJS**, **TypeORM** y **MySQL**. Implementa una arquitectura modular basada en **Domain-Driven Design** (DDD) para garantizar escalabilidad y mantenibilidad a largo plazo.

### Características principales

- 🔐 **Autenticación y autorización** con JWT
- 👥 **Sistema de roles acumulativos** (Player, Coach, Club Owner, Admin)
- 🏟️ **Gestión de venues y canchas** (públicos y privados)
- 📅 **Sistema de disponibilidad y horarios** para canchas
- 💰 **Reglas de precios flexibles** (por hora, por persona)
- 📋 **Sistema de reservas** con validación de disponibilidad y cálculo automático de precios
- 🎯 **Arquitectura modular** con separación de responsabilidades

## 🛠️ Stack Tecnológico

- **Framework**: NestJS 11.x
- **ORM**: TypeORM 0.3.x
- **Base de datos**: MySQL
- **Autenticación**: JWT (@nestjs/jwt)
- **Validación**: class-validator, class-transformer
- **Encriptación**: bcrypt

## 📦 Instalación

### Prerrequisitos

- Node.js >= 18.x
- MySQL >= 8.x
- npm o yarn

### Configuración

1. Clonar el repositorio:
```bash
git clone <repository-url>
cd tennist-server
```

2. Instalar dependencias:
```bash
npm install
# o
yarn install
```

3. Configurar variables de entorno:

Crear archivo `.env` en la raíz del proyecto:

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=tennist

# JWT
JWT_SECRET=your_secret_key_here

# Server
PORT=3000
NODE_ENV=development
```

4. Ejecutar migraciones (si aplica):
```bash
npm run migration:run
```

## 🚀 Ejecución

### Modo Desarrollo

```bash
# Modo watch (recomendado para desarrollo)
npm run dev

# Modo normal
npm start

# Modo debug
npm run start:debug
```

El servidor estará disponible en `http://localhost:3000`

### Modo Producción

```bash
# Compilar el proyecto
npm run build

# Ejecutar en producción
npm run start:prod
```

## 📚 Documentación de Endpoints

### 🔐 Autenticación

#### Registro de usuario
```http
POST /auth/signup
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "password123",
  "phoneNumber": "+1234567890",
  "fullName": "Juan Pérez"
}
```

#### Inicio de sesión
```http
POST /auth/signin
Content-Type: application/json

{
  "emailPhone": "usuario@example.com",
  "password": "password123"
}
```

**Respuesta exitosa:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "usuario@example.com",
    "fullName": "Juan Pérez",
    "role": "player"
  }
}
```

---

### 🏟️ Venues (Lugares deportivos)

#### Crear venue
```http
POST /venues
Authorization: Bearer <token>
Content-Type: application/json

{
  "alias": "club_central_01",
  "name": "Club Deportivo Central",
  "description": "Club de tenis con instalaciones de primer nivel",
  "address": "Av. Principal 123, Ciudad",
  "lat": 19.4326,
  "lng": -99.1332,
  "type": "PRIVATE",
  "facebook": "https://facebook.com/clubdeportivocentral",
  "instagram": "https://instagram.com/clubdeportivocentral",
  "url": "https://clubdeportivocentral.com"
}
```

**Campos nuevos importantes:**
- `alias` (opcional): único, máximo 24 caracteres, formato permitido `[A-Za-z0-9_-]`.
  - Si no se envía, se genera automáticamente con formato tipo `v19230234238`.
- `facebook` (opcional): URL válida de Facebook.
- `instagram` (opcional): URL válida de Instagram.
- `url` (opcional): URL pública del venue.

**Tipos de venue:**
- `PUBLIC`: Solo puede ser creado por usuarios ADMIN
- `PRIVATE`: Puede ser creado por usuarios CLUB_OWNER o ADMIN

**Respuesta exitosa:**
```json
{
  "id": "uuid",
  "alias": "club_central_01",
  "name": "Club Deportivo Central",
  "description": "Club de tenis con instalaciones de primer nivel",
  "address": "Av. Principal 123, Ciudad",
  "lat": 19.4326,
  "lng": -99.1332,
  "type": "PRIVATE",
  "ownerUserId": "uuid",
  "createdByAdmin": false,
  "status": "ACTIVE",
  "facebook": "https://facebook.com/clubdeportivocentral",
  "instagram": "https://instagram.com/clubdeportivocentral",
  "url": "https://clubdeportivocentral.com",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### Actualizar venue
```http
PUT /venues/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "alias": "club_central_actualizado",
  "name": "Club Deportivo Central Renovado",
  "description": "Nuevas instalaciones y más canchas",
  "address": "Av. Principal 456, Ciudad",
  "lat": 19.4328,
  "lng": -99.1330,
  "type": "PRIVATE",
  "facebook": "https://facebook.com/clubcentralrenovado",
  "instagram": "https://instagram.com/clubcentralrenovado",
  "url": "https://clubcentralrenovado.com"
}
```

**Permisos requeridos:**
- `ADMIN` puede actualizar cualquier venue.
- `COURT_OWNER` solo puede actualizar venues de su propiedad.

**Nota:** Si se envía `type: PUBLIC`, solo un usuario `ADMIN` puede realizar esa actualización.

#### Buscar venues cercanos
```http
GET /venues/nearby?lat=19.4326&lng=-99.1332&radiusKm=5&type=PUBLIC&status=ACTIVE&page=1&limit=10
Authorization: Bearer <token>
```

**Parámetros de query:**
- `lat` (requerido cuando `all=false`): Latitud de tu ubicación actual
- `lng` (requerido cuando `all=false`): Longitud de tu ubicación actual
- `radiusKm` (opcional): Radio de búsqueda en kilómetros (por defecto: 10 km, máximo: 100 km)
- `type` (opcional): Tipo de venue (`PUBLIC` o `PRIVATE`)
- `status` (opcional): Estado del venue (`ACTIVE`, `INACTIVE`, `DELETED`). Por defecto solo muestra activos
- `all` (opcional): Si `true`, ignora coordenadas y radio y lista todos los venues
- `page` (opcional): Página a consultar (por defecto: 1)
- `limit` (opcional): Elementos por página (por defecto: 10, máximo: 50)

**Respuesta exitosa:**
```json
{
  "data": [
    {
      "id": "uuid",
      "alias": "club_central_01",
      "name": "Club Deportivo Central",
      "description": "Club de tenis con instalaciones de primer nivel",
      "address": "Av. Principal 123, Ciudad",
      "lat": 19.4326,
      "lng": -99.1332,
      "type": "PRIVATE",
      "status": "ACTIVE",
      "distance": 2.45,
      "facebook": "https://facebook.com/clubdeportivocentral",
      "instagram": "https://instagram.com/clubdeportivocentral",
      "url": "https://clubdeportivocentral.com",
      "courts": [
        {
          "id": "uuid",
          "name": "Cancha 1",
          "surface": "CLAY",
          "isIndoor": false,
          "isLighted": true
        }
      ]
    }
  ],
  "meta": {
    "totalItems": 25,
    "page": 1,
    "limit": 10,
    "hasMore": true
  }
}
```

**Nota:** Los resultados incluyen `meta` para paginación. Cuando `all=false` están ordenados por distancia; cuando `all=true` se ordenan por nombre.

#### Obtener venue por ID
```http
GET /venues/:id
Authorization: Bearer <token>
```

**Respuesta exitosa:**
```json
{
  "id": "uuid",
  "alias": "club_central_01",
  "name": "Club Deportivo Central",
  "address": "Av. Principal 123, Ciudad",
  "type": "PRIVATE",
  "facebook": "https://facebook.com/clubdeportivocentral",
  "instagram": "https://instagram.com/clubdeportivocentral",
  "url": "https://clubdeportivocentral.com",
  "courts": [
    {
      "id": "uuid",
      "name": "Cancha 1",
      "surface": "CLAY",
      "isIndoor": false,
      "isLighted": true
    }
  ]
}
```

---

### 🖼️ Imágenes de Venues

#### Subir imagen
```http
POST /venues/:venueId/images
Authorization: Bearer <token>
Content-Type: multipart/form-data

image: <archivo jpg|jpeg|png|webp> (máx. 5MB)
```

**Permisos requeridos:**
- Usuario debe ser propietario del venue o ADMIN

**Respuesta exitosa:**
```json
{
  "id": "uuid",
  "imageUrl": "http://localhost:3000/files/abc123.jpg",
  "displayOrder": 0,
  "venueId": "uuid",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

#### Listar imágenes de un venue
```http
GET /venues/:venueId/images
Authorization: Bearer <token>
```

#### Eliminar imagen
```http
DELETE /venues/images/:imageId
Authorization: Bearer <token>
```

#### Reordenar imagen
```http
PUT /venues/images/:imageId/order
Authorization: Bearer <token>
Content-Type: application/json

{
  "displayOrder": 2
}
```

**Nota:** Las imágenes se incluyen automáticamente en las respuestas de `GET /venues/:id` y `GET /venues/nearby`, ordenadas por `displayOrder`.

---

### 🎾 Canchas (Courts)

#### Crear cancha en un venue
```http
POST /venues/:venueId/courts
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Cancha Central",
  "surface": "CLAY",
  "isIndoor": false,
  "isLighted": true
}
```

**Tipos de superficie:**
- `HARD`: Cancha dura
- `CLAY`: Arcilla
- `GRASS`: Césped
- `SYNTHETIC`: Sintética

**Permisos requeridos:**
- Usuario debe ser propietario del venue o ADMIN

**Respuesta exitosa:**
```json
{
  "id": "uuid",
  "name": "Cancha Central",
  "surface": "CLAY",
  "isIndoor": false,
  "isLighted": true,
  "isActive": true,
  "venueId": "uuid",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### Listar canchas de un venue
```http
GET /venues/:venueId/courts
Authorization: Bearer <token>
```

**Respuesta exitosa:**
```json
[
  {
    "id": "uuid",
    "name": "Cancha Central",
    "surface": "CLAY",
    "isIndoor": false,
    "isLighted": true,
    "isActive": true,
    "venue": {
      "id": "uuid",
      "name": "Club Deportivo Central"
    }
  }
]
```

---

### 📅 Disponibilidad de Canchas

#### Consultar disponibilidad
```http
GET /courts/:courtId/availability?date=2024-12-25
Authorization: Bearer <token>
```

**Parámetros:**
- `date`: Fecha en formato `YYYY-MM-DD`

**Respuesta exitosa:**
```json
[
  {
    "startTime": "08:00",
    "endTime": "12:00"
  },
  {
    "startTime": "14:00",
    "endTime": "20:00"
  }
]
```

**Nota:** El sistema calcula la disponibilidad basándose en:
1. El horario base semanal (`CourtSchedule`)
2. Los bloqueos y excepciones del día (`CourtAvailability`)
3. Fusiona automáticamente slots contiguos

---

### ⏰ Gestión de Horarios (CourtSchedule)

#### Crear horario semanal
```http
POST /courts/:courtId/schedules
Authorization: Bearer <token>
Content-Type: application/json

{
  "dayOfWeek": 1,
  "startTime": "08:00",
  "endTime": "20:00"
}
```

**Parámetros:**
- `dayOfWeek`: Día de la semana (0=Domingo, 1=Lunes, ..., 6=Sábado)
- `startTime`: Hora de inicio en formato HH:MM
- `endTime`: Hora de fin en formato HH:MM

**Permisos requeridos:**
- Usuario debe ser propietario del venue o ADMIN

#### Listar horarios de una cancha
```http
GET /courts/:courtId/schedules
Authorization: Bearer <token>
```

#### Actualizar horario
```http
PUT /courts/schedules/:scheduleId
Authorization: Bearer <token>
Content-Type: application/json

{
  "startTime": "09:00",
  "endTime": "21:00"
}
```

#### Eliminar horario
```http
DELETE /courts/schedules/:scheduleId
Authorization: Bearer <token>
```

---

### 🚫 Gestión de Excepciones de Disponibilidad

#### Crear excepción (bloqueo o disponibilidad especial)
```http
POST /courts/:courtId/availability-exceptions
Authorization: Bearer <token>
Content-Type: application/json

{
  "date": "2024-12-25",
  "startTime": "10:00",
  "endTime": "14:00",
  "type": "BLOCKED",
  "reason": "Mantenimiento de cancha"
}
```

**Tipos de excepción:**
- `BLOCKED`: Bloquea el horario (ej: mantenimiento, evento privado)
- `AVAILABLE`: Agrega disponibilidad especial fuera del horario normal

**Permisos requeridos:**
- Usuario debe ser propietario del venue o ADMIN

#### Listar excepciones de una cancha
```http
GET /courts/:courtId/availability-exceptions
Authorization: Bearer <token>
```

#### Eliminar excepción
```http
DELETE /courts/availability-exceptions/:availabilityId
Authorization: Bearer <token>
```

---

### 💰 Gestión de Precios

#### Crear regla de precio
```http
POST /courts/:courtId/pricing-rules
Authorization: Bearer <token>
Content-Type: application/json

{
  "pricingType": "PER_HOUR",
  "price": 50000,
  "minDurationMinutes": 60,
  "maxDurationMinutes": 120,
  "maxPlayers": 4
}
```

**Tipos de precio:**
- `PER_HOUR`: Precio por hora de uso
- `PER_PERSON`: Precio por persona por hora

**Nota:** Los precios se manejan en **centavos** (50000 = $500.00)

**Permisos requeridos:**
- Usuario debe ser propietario del venue o ADMIN

#### Listar reglas de precio
```http
GET /courts/:courtId/pricing-rules
Authorization: Bearer <token>
```

#### Actualizar regla de precio
```http
PUT /courts/pricing-rules/:ruleId
Authorization: Bearer <token>
Content-Type: application/json

{
  "price": 60000
}
```

#### Eliminar regla de precio
```http
DELETE /courts/pricing-rules/:ruleId
Authorization: Bearer <token>
```

#### Calcular precio de reserva
```http
POST /courts/:courtId/calculate-price
Authorization: Bearer <token>
Content-Type: application/json

{
  "durationMinutes": 90,
  "playersCount": 2
}
```

**Respuesta exitosa:**
```json
{
  "totalPriceCents": 75000,
  "appliedRule": {
    "id": "uuid",
    "pricingType": "PER_HOUR",
    "price": 50000,
    "minDurationMinutes": 60
  }
}
```

---

### 📋 Reservas (Court Reservations)

#### Tipos de origen (sourceType)

Las reservas soportan distintos tipos de origen para integrarse con otros módulos:

| sourceType | sourceId | Descripción |
|------------|----------|-------------|
| `USER` | `null` | Reserva creada por un usuario desde la API |
| `CLASS` | `classSessionId` | Reserva creada por el módulo de clases |
| `TOURNAMENT` | `tournamentId` | Reserva creada por el módulo de torneos |
| `MAINTENANCE` | `null` | Bloqueo por mantenimiento |

#### Crear reserva
```http
POST /courts/:courtId/reservations
Authorization: Bearer <token>
Content-Type: application/json

{
  "date": "2024-12-25",
  "startTime": "10:00",
  "endTime": "11:30",
  "playersCount": 2
}
```

**Permisos:** Cualquier usuario autenticado (PLAYER, COACH, CLUB_OWNER, ADMIN)

**Validaciones:**
- La cancha debe existir y estar activa
- El horario debe estar dentro de la disponibilidad real
- No debe haber reservas confirmadas que se solapen
- La duración y cantidad de jugadores deben respetar las reglas de precio

**Respuesta exitosa:**
```json
{
  "id": "uuid",
  "courtId": "uuid",
  "userId": "uuid",
  "date": "2024-12-25",
  "startTime": "10:00",
  "endTime": "11:30",
  "playersCount": 2,
  "totalPrice": 75000,
  "status": "CONFIRMED",
  "sourceType": "USER",
  "sourceId": null,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "court": { ... },
  "user": { ... }
}
```

**Nota:** Las reservas creadas desde la API siempre usan `sourceType = USER`. Las reservas de tipo CLASS, TOURNAMENT y MAINTENANCE se crean internamente mediante `createSystemReservation()`.

#### Obtener mis reservas
```http
GET /users/me/reservations
Authorization: Bearer <token>
```

**Respuesta:** Lista de reservas del usuario autenticado, ordenadas por fecha descendente. Incluye información de la cancha y el venue.

#### Cancelar reserva
```http
DELETE /reservations/:id
Authorization: Bearer <token>
```

**Reglas de cancelación por sourceType:**

| sourceType | Quién puede cancelar |
|------------|---------------------|
| `USER` | Creador de la reserva, ADMIN, CLUB_OWNER del venue |
| `CLASS` | Solo el módulo de clases (vía `cancelSystemReservation`) |
| `TOURNAMENT` | Solo el módulo de torneos (vía `cancelSystemReservation`) |
| `MAINTENANCE` | ADMIN o CLUB_OWNER del venue |

**Integración con disponibilidad:** Todas las reservas CONFIRMED se descuentan automáticamente de los slots disponibles en `GET /courts/:courtId/availability`, independientemente del `sourceType`.

---

### 🏃 Prácticas de Jugador (Player Practices)

Permite que un jugador registre sesiones de práctica y consulte su progreso.

#### Crear práctica manual o de clase
```http
POST /users/me/practices
Authorization: Bearer <token>
Content-Type: application/json

{
  "practiceDate": "2026-02-16",
  "durationMinutes": 90,
  "playedFriendlyMatch": true,
  "practicedServes": true,
  "venueId": "uuid-opcional",
  "sourceType": "MANUAL",
  "notes": "Sesión de control y consistencia"
}
```

**Campos clave:**
- `practiceDate`: Fecha de práctica en formato `YYYY-MM-DD`
- `durationMinutes`: Tiempo total de práctica en minutos
- `playedFriendlyMatch`: Indica si jugó partido amistoso
- `practicedServes`: Indica si practicó saques
- `venueId` (opcional): Venue donde realizó la práctica
- `sourceType`: `MANUAL` o `CLASS`

**Para registrar una práctica de clase (`sourceType = CLASS`):**
- Debe enviar `classAttended: true`
- Debe enviar `classSessionId`
- El sistema valida que el jugador tenga asistencia `PRESENT` en esa clase

#### Listar mis prácticas
```http
GET /users/me/practices?fromDate=2026-02-01&toDate=2026-02-16&sourceType=MANUAL
Authorization: Bearer <token>
```

**Filtros opcionales:**
- `fromDate` y `toDate` en formato `YYYY-MM-DD`
- `sourceType` (`MANUAL` o `CLASS`)

#### Ver estadísticas de progreso
```http
GET /users/me/practices/stats?fromDate=2026-02-01&toDate=2026-02-16
Authorization: Bearer <token>
```

**Incluye:**
- Total de prácticas y minutos acumulados
- Promedio de duración por práctica
- Prácticas con amistosos y con saques
- Distribución por tipo (`MANUAL`/`CLASS`)
- Días únicos de práctica, racha actual, racha más larga
- Porcentaje de consistencia en el rango consultado

---

### 🎓 Cursos y Clases (Coaching Domain)

Permite que usuarios con rol `COACH`, `COURT_OWNER` o `ADMIN` creen cursos y gestionen clases.

#### Crear curso
```http
POST /courses
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Tecnificación de Saque",
  "description": "Curso grupal para mejorar consistencia y potencia",
  "groupName": "Grupo Juvenil A",
  "difficulty": "INTERMEDIATE",
  "maxCapacity": 12,
  "startDate": "2026-03-01",
  "endDate": "2026-05-30",
  "status": "DRAFT",
  "venueId": "uuid-opcional",
  "schedules": [
    { "dayOfWeek": 2, "startTime": "18:00", "endTime": "19:30" },
    { "dayOfWeek": 4, "startTime": "18:00", "endTime": "19:30" }
  ]
}
```

#### Buscar cursos
```http
GET /courses?search=saque&difficulty=INTERMEDIATE&status=ACTIVE&page=1&limit=10
Authorization: Bearer <token>
```

#### Cambiar estado del curso
```http
PATCH /courses/:courseId/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "ACTIVE"
}
```

#### Solicitar inscripción a un curso (jugador)
```http
POST /courses/:courseId/enrollments/request
Authorization: Bearer <token>
```

#### Agregar jugador directamente (dueño del curso)
```http
POST /courses/:courseId/enrollments/add-user
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "uuid-del-jugador",
  "reviewNotes": "Invitado por rendimiento en evaluación"
}
```

#### Aprobar/rechazar solicitud de inscripción
```http
PATCH /courses/:courseId/enrollments/:enrollmentId/review
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "APPROVED",
  "reviewNotes": "Cupo confirmado"
}
```

#### Listar inscripciones de un curso
```http
GET /courses/:courseId/enrollments?status=PENDING
Authorization: Bearer <token>
```

#### Registrar clase dictada con asistencia y notas
```http
POST /courses/:courseId/classes
Authorization: Bearer <token>
Content-Type: application/json

{
  "date": "2026-03-10",
  "startTime": "18:00",
  "endTime": "19:30",
  "generalNotes": "Sesión enfocada en segundo saque",
  "attendance": [
    {
      "userId": "uuid-jugador",
      "status": "PRESENT",
      "playerNotes": "Mejoró la altura del lanzamiento"
    }
  ]
}
```

**Regla de inicio de clases:** solo se permite registrar clases cuando el curso está en `ACTIVE` y, si tiene `startDate`, esa fecha ya pasó o es hoy.

#### Listar clases de un curso
```http
GET /courses/:courseId/classes
Authorization: Bearer <token>
```

#### Ver mis cursos (jugador)
```http
GET /users/me/courses
Authorization: Bearer <token>
```

Retorna cursos donde el usuario tiene inscripción `APPROVED`.

#### Ver mis clases (jugador)
```http
GET /users/me/classes?fromDate=2026-03-01&toDate=2026-03-31&attendanceStatus=PRESENT
Authorization: Bearer <token>
```

Filtros opcionales: `fromDate`, `toDate`, `courseId`, `attendanceStatus`.

**Integración automática con prácticas:** al registrar una clase, cada alumno con asistencia `PRESENT` genera automáticamente una práctica de tipo `CLASS` (sin duplicados por sesión).

---

## 🏗️ Arquitectura del Proyecto

### Estructura de Directorios

```
src/
├── auth/               # Módulo de autenticación
├── users/              # Módulo de usuarios
├── venues/             # Módulo de venues
│   ├── dto/           # Data Transfer Objects
│   ├── guards/        # Guards de autorización
│   ├── venue.entity.ts
│   ├── venues.service.ts
│   └── venues.controller.ts
├── courts/             # Módulo de canchas
│   ├── entities/      # Entidades (Court, Schedule, Availability, Pricing)
│   ├── services/      # Servicios de negocio
│   ├── controllers/   # Controladores REST
│   └── dto/
├── reservations/       # Módulo de reservas
│   ├── entities/      # CourtReservation
│   ├── dto/
│   ├── reservations.service.ts
│   └── reservations.controller.ts
├── classes/            # Módulo de cursos y clases
│   ├── entities/      # Course, Enrollment, Session, Attendance
│   ├── dto/
│   ├── classes.service.ts
│   └── classes.controller.ts
├── shared/             # Recursos compartidos
│   ├── guards/        # Guards globales
│   ├── decorators/    # Decoradores personalizados
│   ├── domain/        # Interfaces y tipos base
│   └── utils/         # Utilidades
└── config/             # Configuración de la aplicación
```

### Dominios del Sistema

1. **User Domain**: Usuarios, roles, autenticación
2. **Infrastructure Domain**: Venues, canchas, horarios, disponibilidad, precios
3. **Reservation Domain**: Reservas de canchas, cancelaciones
4. **Sports Domain**: Partidos, estadísticas y prácticas
5. **Social Domain**: Amigos, invitaciones, posts (futuro)
6. **Coaching Domain**: Coaches, cursos, clases, inscripciones y asistencia

### Sistema de Roles

Los roles son **acumulativos**, un usuario puede tener múltiples roles:

- **PLAYER** (base): Todos los usuarios
- **COACH**: Extiende Player, puede gestionar clases
- **CLUB_OWNER**: Extiende Coach, puede crear venues privados y gestionar canchas
- **ADMIN**: Rol interno, puede crear venues públicos y gestionar todo

## 🔒 Seguridad

- Autenticación mediante JWT
- Guards de roles para proteger endpoints
- Guards de ownership para validar permisos sobre recursos
- Validación de datos con class-validator
- Encriptación de contraseñas con bcrypt
- Sistema de bloqueo de cuenta por intentos fallidos

## 🎯 Convenciones del Proyecto

### Mensajes de Error
Todos los mensajes de error deben estar en **español**:
```typescript
throw new NotFoundException('Venue con ID ${id} no encontrado');
```

### Documentación de Servicios
Todos los métodos en `*.service.ts` deben incluir JSDoc:
```typescript
/**
 * @description Busca un venue por su ID
 * @param { string } id - ID del venue
 * @returns { Promise<Venue> } Venue encontrado
 */
async findById(id: string): Promise<Venue> {
  // ...
}
```

### Precios
Los precios se manejan en **centavos** (enteros) para evitar problemas de precisión.

## 📝 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Inicia en modo watch
npm start                # Inicia en modo normal
npm run start:debug      # Inicia con debugger

# Producción
npm run build            # Compila el proyecto
npm run start:prod       # Ejecuta versión compilada

# Calidad de código
npm run lint             # Ejecuta ESLint
npm run format           # Formatea código con Prettier
```

## 🤝 Contribución

1. Seguir las convenciones de código establecidas
2. Documentar todos los métodos de servicios con JSDoc
3. Mensajes de error en español
4. Mantener la arquitectura modular
5. Respetar los principios de Domain-Driven Design

## 📄 Licencia

UNLICENSED - Proyecto privado
