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
  "name": "Club Deportivo Central",
  "description": "Club de tenis con instalaciones de primer nivel",
  "address": "Av. Principal 123, Ciudad",
  "lat": 19.4326,
  "lng": -99.1332,
  "type": "PRIVATE"
}
```

**Tipos de venue:**
- `PUBLIC`: Solo puede ser creado por usuarios ADMIN
- `PRIVATE`: Puede ser creado por usuarios CLUB_OWNER o ADMIN

**Respuesta exitosa:**
```json
{
  "id": "uuid",
  "name": "Club Deportivo Central",
  "description": "Club de tenis con instalaciones de primer nivel",
  "address": "Av. Principal 123, Ciudad",
  "lat": 19.4326,
  "lng": -99.1332,
  "type": "PRIVATE",
  "ownerUserId": "uuid",
  "createdByAdmin": false,
  "status": "active",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### Obtener venue por ID
```http
GET /venues/:id
Authorization: Bearer <token>
```

**Respuesta exitosa:**
```json
{
  "id": "uuid",
  "name": "Club Deportivo Central",
  "address": "Av. Principal 123, Ciudad",
  "type": "PRIVATE",
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
3. **Sports Domain**: Partidos, estadísticas, prácticas (futuro)
4. **Social Domain**: Amigos, invitaciones, posts (futuro)
5. **Coaching Domain**: Coaches, clases, cursos (futuro)

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
