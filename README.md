# Backend del Proyecto con TypeScript, Prisma y PostgreSQL

Este proyecto es el frontend de una aplicación fullstack. El frontend se puede encontrar en
<https://github.com/ncorrea-13/sistInventario-front>

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

- `typescript`: Lenguaje de programación utilizado para la web.
- `node`: Entorno para poder ejecutar apps utilizando JavaScript y TypeScript.
- `express`: Framework para crear APIs utilizando Node, JavaScript y TypeScript.
- `pg`: Cliente de PostgreSQL.
- `prisma`: ORM para interactuar con la base de datos.
- `cors`: Middleware para habilitar CORS.
- `node-cron`: Cron para el manejo de la ejecución respecto del tiempo.

## Pasos para levantar el proyecto

Para su correcta implementación, recomendamos levantar luego la interfaz de usuario (el frontend) para su óptima interacción.

### 1. Clonar el repositorio

```bash
git clone https://github.com/ncorrea-13/sistInventario-back
cd sistInventario-back
```

### 2. Instala las dependencias

   ```bash
   npm install
   ```

### 3. Configura las variables de entorno

- Crea un archivo `.env` en el directorio
- Añade la URL de conexión a tu base de datos PostgreSQL:

     ```env
     DATABASE_URL=postgresql://<usuario>:<contraseña>@<host>:<puerto>/<nombre_base_datos>
     ```

### 4. Ejecuta las migraciones para sincronizar el esquema con la base de datos

   ```bash
   npx prisma migrate dev --name init
   ```

### 5. Genere las estructuras necesarias para la base de datos

   ```bash
   npx prisma generate 
   ```

### 6. Ejecutar el proyecto localmente

   ```bash
   npm run dev
   ```

Una vez ejecutado, puede utilizar PostMan apuntando hacia `http://localhost:3000` para interactuar con el servidor backend.

Alternativamente, puede levantar el frontend así posee una interacción por medio de una interfaz gráfica más óptima.

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
