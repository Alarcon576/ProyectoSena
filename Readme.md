
# 🐾 Street Paws

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

# 👨‍💻 Integrantes
- Cristian Alarcón
- Juan Marin
- Jhoyner Soa

---

# 🛠 Tecnologías utilizadas

## Frontend Web
- React
- CSS3
- JavaScript (ES6)

## Backend
- Node.js
- Express.js
- Railway

## Base de Datos
- PostgreSQL
- Prisma ORM
- Railway

## Librerías principales
- JWT
- Multer
- bcrypt
- cors
- dotenv
- Prisma Client

---

# ⚙️ Requisitos previos

Antes de ejecutar el proyecto debes tener instalado:

- Node.js v18 o superior
- npm
- PostgreSQL
- Git


---

# 📥 Instalación

## 1. Clonar repositorio

```bash
git clone https://github.com/TU-USUARIO/street-paws.git
```

# 📥 Instalación

## 1. Entrar al proyecto

```bash
cd street-paws
```

¡Perfecto! Aquí tienes tu contenido listo para **pegar directamente en un archivo `.md`** sin etiquetas extra ni bloques de código innecesarios:  

```markdown
# Street Paws

## Entrar al proyecto
```bash
cd street-paws
```

## Instalar dependencias

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
cd ../frontend
npm install
```

---

## ▶️ Ejecución local

### Backend
```bash
cd backend
npm run dev
```
Servidor: [http://localhost:3000](http://localhost:3000)

### Frontend React
```bash
cd frontend
npm run dev
```
Servidor: [http://localhost:5173](http://localhost:5173)

### Flutter
```bash
flutter pub get
flutter run
```

---

## 🗄 Base de datos

### Crear base de datos PostgreSQL
```sql
CREATE DATABASE street_paws;
```

### Ejecutar migraciones Prisma
```bash
npx prisma migrate dev
```

### Generar cliente Prisma
```bash
npx prisma generate
```

---

## 🔐 Variables de entorno

Crear un archivo `.env` dentro del backend.  

**Ejemplo:**
```env
DATABASE_URL="postgresql://usuario:password@localhost:5432/street_paws"
JWT_SECRET="streetpaws_secret"
PORT=3000
CLOUDINARY_CLOUD_NAME=tu_cloud
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

**Explicación:**

| Variable         | Descripción                           |
|-----------------|---------------------------------------|
| DATABASE_URL     | Conexión a PostgreSQL                 |
| JWT_SECRET       | Clave para autenticación JWT          |
| PORT             | Puerto del servidor                   |
| CLOUDINARY_*     | Configuración de almacenamiento de imágenes |

---

## 👤 Usuario de prueba

**Usuario:** `admin@streetpaws.com`  
**Contraseña:** `123456`

---

## 🚀 Despliegue

**Backend:** Railway  

**Pasos generales:**
1. Conectar repositorio GitHub.
2. Configurar variables de entorno.
3. Agregar PostgreSQL.
4. Ejecutar migraciones Prisma.
5. Publicar servicio.

---

## 📸 Evidencias

### Sistema Web
- Feed social funcionando.
- Publicaciones con imágenes.
- Likes y comentarios.
- Sistema de adopciones.
- Explorador de usuarios y mascotas.
- Perfil editable.
- Configuración de usuario.
- IA de orientación animal.

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

“Cada mascota merece un hogar.”
```

