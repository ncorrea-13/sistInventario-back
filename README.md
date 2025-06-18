# Backend del Proyecto con TypeScript, Prisma y PostgreSQL

Este proyecto es una aplicación backend que utiliza **TypeScript**, **Prisma ORM** y **PostgreSQL**. Está diseñado para ser sencillo en configuración y ejecución.

## Requisitos previos

Asegúrate de tener instalados los siguientes programas en tu máquina:

- **Node.js** (versión 16 o superior)
- **PostgreSQL** (versión 12 o superior)
- **npm** o **yarn**

## Configuración del proyecto

### Scripts disponibles

- `dev`: Ejecuta el servidor en modo desarrollo con `ts-node-dev`.
- `build`: Compila el código TypeScript a JavaScript.
- `start`: Inicia el servidor desde el código compilado.

### Dependencias principales

- `express`: Framework para el backend.
- `pg`: Cliente de PostgreSQL.
- `cors`: Middleware para habilitar CORS.
- `@prisma/client`: Cliente de Prisma para interactuar con la base de datos.

## Pasos para levantar el proyecto

### 1. Clonar el repositorio

```bash
git clone https://github.com/ncorrea-13/sistInventario-back
```
cd sistInventario-back
```

### 2. Instala las dependencias:

   ```bash
   npm install
   ```

### 3. Configura las variables de entorno:
   - Crea un archivo `.env` en el directorio
   - Añade la URL de conexión a tu base de datos PostgreSQL:

     ```env
     DATABASE_URL=postgresql://<usuario>:<contraseña>@<host>:<puerto>/<nombre_base_datos>
     ```

### 4. Ejecuta las migraciones para sincronizar el esquema con la base de datos:

   ```bash
   npx prisma migrate dev --name init
   ```

### 5. Genere las estructuras necesarias para la base de datos

   ```bash
   npx prisma generate 
   ```

### 6. Ejecutar el proyecto localmente

1. Inicia la API:

   ```bash
   npm run dev
   ```

2. Abre tu navegador y ve a `http://localhost:3000` para interactuar con el servidor backend.


## Estructura del proyecto

```
<raíz_del_proyecto>/
├── prisma/       # Configuración y esquema de la base de datos
├── src/          # Código fuente del backend
├── tsconfig.json # Configuración de TypeScript
├── package.json  # Dependencias y scripts
```

## Tecnologías utilizadas

- **TypeScript**
- **Prisma ORM**
- **PostgreSQL**
- **Express**
- **Node-cron**

## Contribuciones

¡Las contribuciones son bienvenidas! Si encuentras algún problema o tienes una idea para mejorar el proyecto, no dudes en abrir un issue o enviar un pull request.

---

¡Gracias por usar este proyecto! 😊
