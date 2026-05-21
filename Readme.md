# 🐾 Street Paws
### Proyecto elaborado por aprendices del CBA MOSQUERA

---

## 📖 Descripción

Street Paws es una plataforma web y móvil enfocada en ayudar a animales en situación de calle a encontrar un hogar responsable.

El sistema permite:
- Publicar mascotas en adopción.
- Gestionar solicitudes de adopción.
- Interactuar mediante publicaciones tipo red social.
- Dar likes y comentar publicaciones.
- Guardar mascotas en favoritos.
- Explorar usuarios y mascotas destacadas.
- Gestionar perfiles de usuario.
- Obtener orientación básica sobre salud animal mediante IA.

El objetivo principal del proyecto es conectar personas interesadas en adoptar con animales que necesitan un hogar, creando una comunidad digital enfocada en el bienestar animal.

---

## 👨‍💻 Integrantes

- Cristian Alarcón
- Juan Marin
- Jhoyner Soa

---

## 🛠 Tecnologías utilizadas

### Frontend Web
- React
- CSS3
- JavaScript (ES6)

### Backend
- Node.js
- Express.js
- Railway

### Base de Datos
- PostgreSQL
- Prisma ORM
- Railway

### Librerías principales
- JWT
- Multer
- bcrypt
- cors
- dotenv
- Prisma Client

---

## ⚙️ Requisitos previos

Antes de ejecutar el proyecto debes tener instalado:

| Herramienta | Versión requerida | Descarga |
|-------------|-------------------|----------|
| Node.js | **v22.22.3** | https://nodejs.org |
| npm | Incluido con Node.js | — |
| PostgreSQL | v15 o superior | https://www.postgresql.org/download |
| Git | Última versión estable | https://git-scm.com |

### Verificar instalaciones

```bash
node -v
# Debe mostrar: v22.22.3

npm -v
# Debe mostrar la versión de npm instalada

psql --version
# Debe mostrar la versión de PostgreSQL instalada
```

---

## 📥 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/Alarcon576/ProyectoSena.git
```

### 2. Instalar dependencias

#### Backend

```bash
cd backend
cd street-paws
npm install
```

#### Frontend

```bash
cd ../..
cd front-end
cd StreetPawsFrontend
npm install
```

---

## 🖥️ Configuración y ejecución del Backend (Local)

### 1. Entrar a la carpeta del backend

```bash
cd backend
cd street-paws
```

### 2. Instalar dependencias del proyecto

```bash
npm install
```

### 3. Instalar Prisma (versión específica)

```bash
npm install prisma@5.22.0 --save-dev
```

>Usa exactamente la versión `5.22.0` para garantizar compatibilidad con el proyecto.

### 4. Instalar nodemon globalmente

```bash
npm install -g nodemon
```

Verificar instalación:

```bash
nodemon -v
```

### 5. Configurar variables de entorno

Crea un archivo `.env` dentro de la carpeta `backend/`:

```bash
# En Mac/Linux
touch .env

# En Windows (PowerShell)
New-Item .env
```

Agrega el siguiente contenido al archivo `.env`:

```env
DATABASE_URL="postgresql://usuario:password@localhost:5432/street_paws"
JWT_SECRET="streetpaws_secret"
PORT=3000
CLOUDINARY_CLOUD_NAME=tu_cloud
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | Conexión a PostgreSQL |
| `JWT_SECRET` | Clave para autenticación JWT |
| `PORT` | Puerto del servidor |
| `CLOUDINARY_*` | Configuración de almacenamiento de imágenes |

> 🔑 Reemplaza `usuario` y `password` con las credenciales de tu PostgreSQL local.

### 6. Configurar la base de datos

#### Crear la base de datos en PostgreSQL

```bash
psql -U postgres
```

```sql
CREATE DATABASE street_paws;
```

#### Generar el cliente de Prisma

```bash
npx prisma generate
```

#### Ejecutar las migraciones

```bash
npx prisma migrate dev
```

### 7. Iniciar el servidor

```bash
npm run dev
```

Si el servidor inicia correctamente verás:

```
🚀 Servidor corriendo en http://localhost:3000
```

---

## ▶️ Ejecución local (todos los servicios)

### Backend

```bash
cd backend
cd street-paws
npm run dev
```

Servidor: http://localhost:3000

### Frontend React

```bash
cd front-end
cd StreetPawsFrontend
npm run dev
```

Servidor: http://localhost:5173

---


## 👤 Usuario de prueba

| Campo | Valor |
|-------|-------|
| **Email** | `admin@streetpaws.com` |
| **Contraseña** | `123456` |

---

## 🚀 Despliegue

**Backend:** Railway

Pasos generales:
1. Conectar repositorio GitHub.
2. Configurar variables de entorno.
3. Agregar PostgreSQL.
4. Ejecutar migraciones Prisma.
5. Publicar servicio.

---

## ❓ Errores comunes

| Error | Causa probable | Solución |
|-------|----------------|----------|
| `Cannot find module 'prisma'` | Prisma no instalado | Ejecutar `npm install prisma@5.22.0 --save-dev` |
| `P1001: Can't reach database server` | PostgreSQL no está corriendo | Iniciar el servicio de PostgreSQL |
| `Invalid DATABASE_URL` | Variable de entorno mal configurada | Revisar el archivo `.env` |
| `nodemon: command not found` | nodemon no instalado globalmente | Ejecutar `npm install -g nodemon` |

---

## 📌 Estado del proyecto

🚧 Proyecto en desarrollo activo.

**Próximas funcionalidades:**
- Notificaciones.
- Sistema de reportes.
- Gamificación y logros.
- Recomendaciones inteligentes de adopción.

---

## ❤️ Street Paws

> "Cada mascota merece un hogar."