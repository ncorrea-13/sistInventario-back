# Proyecto Fullstack con React, TypeScript, Prisma y PostgreSQL

Este proyecto es una aplicación fullstack que utiliza **React** con **TypeScript** en el frontend, **Prisma ORM** y **PostgreSQL** en el backend. Está diseñado para ser desplegado fácilmente en **Vercel**.

## Requisitos previos

Asegúrate de tener instalados los siguientes programas en tu máquina:

- **Node.js** (versión 16 o superior)
- **PostgreSQL** (versión 12 o superior)
- **npm** o **yarn**

## Configuración del proyecto

### Scripts disponibles

#### Backend

- `dev`: Ejecuta el servidor en modo desarrollo con `ts-node-dev`.
- `build`: Compila el código TypeScript a JavaScript.
- `start`: Inicia el servidor desde el código compilado.

#### Frontend

- `dev`: Inicia el servidor de desarrollo de Next.js.
- `build`: Compila la aplicación para producción.
- `start`: Inicia la aplicación en modo producción.

### Dependencias principales

#### Backend

- `express`: Framework para el backend.
- `pg`: Cliente de PostgreSQL.
- `cors`: Middleware para habilitar CORS.
- `@prisma/client`: Cliente de Prisma para interactuar con la base de datos.

#### Frontend

- `next`: Framework para el frontend.
- `react` y `react-dom`: Librerías para construir interfaces de usuario.

### Dependencias de desarrollo

#### Backend

- `typescript`, `ts-node-dev`, `prisma`, entre otros.

#### Frontend

- Tipos para React y TypeScript.

### 1. Clonar el repositorio

```bash
git clone https://github.com/ncorrea-13/sistInventario
cd sistInventario
```

### 2. Configurar el backend

1. Ve al directorio `backend`:

   ```bash
   cd backend
   ```

2. Instala las dependencias:

   ```bash
   npm install
   ```

3. Configura las variables de entorno:
   - Crea un archivo `.env` en el directorio `backend` (si no existe ya).
   - Añade la URL de conexión a tu base de datos PostgreSQL:

     ```env
     DATABASE_URL=postgresql://<usuario>:<contraseña>@<host>:<puerto>/<nombre_base_datos>
     ```

4. Ejecuta las migraciones para sincronizar el esquema con la base de datos:

   ```bash
   npx prisma migrate dev --name init
   ```

5. Genere las estructuras necesarias para la base de datos

   ```bash
   npx prisma generate 
   ```

### 3. Configurar el frontend

1. Ve al directorio `frontend`:

   ```bash
   cd ../frontend
   ```

2. Instala las dependencias:

   ```bash
   npm install
   ```

3. Configura las variables de entorno:
   - Crea un archivo `.env.local` en el directorio `frontend` (si no existe ya).
   - Añade la URL de la API del backend:

     ```env
     NEXT_PUBLIC_API_URL=/api
     ```

### 4. Ejecutar el proyecto localmente

1. Inicia el backend:

   ```bash
   cd backend
   npm run dev
   ```

2. Inicia el frontend:

   ```bash
   cd ../frontend
   npm run dev
   ```

3. Abre tu navegador y ve a `http://localhost:3000` para ver la aplicación.

## Despliegue en Vercel

Este proyecto está configurado para ser desplegado en **Vercel**. Asegúrate de:

1. Subir el proyecto a un repositorio en GitHub, GitLab o Bitbucket.
2. Conectar el repositorio a Vercel.
3. Configurar las variables de entorno en Vercel para el backend y el frontend.

## Estructura del proyecto

```
<raíz_del_proyecto>/
├── backend/       # Código del backend con Prisma y PostgreSQL
├── frontend/      # Código del frontend con React y Next.js
└── vercel.json    # Configuración para el despliegue en Vercel
```

## Tecnologías utilizadas

- **React**
- **TypeScript**
- **Next.js**
- **Prisma ORM**
- **PostgreSQL**
- **TailWindCss**
- **Vercel**

## Contribuciones

¡Las contribuciones son bienvenidas! Si encuentras algún problema o tienes una idea para mejorar el proyecto, no dudes en abrir un issue o enviar un pull request.

---

¡Gracias por usar este proyecto! 😊
