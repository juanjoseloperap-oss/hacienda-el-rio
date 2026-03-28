# Hacienda El Río · Sistema de gestión ganadera

Aplicación web mobile-first para centralizar control animal, sanidad, pesajes, movimientos, reproducción, inventario, usuarios y reportes semanales.

## 1. Stack propuesto
- **Frontend:** HTML + CSS + JavaScript vanilla, PWA mobile-first, sin dependencias pesadas.
- **Backend:** Node.js + Express + API REST.
- **Base de datos:** PostgreSQL.
- **Reportes:** ExcelJS para XLSX y PDFKit para PDF.
- **Offline parcial:** service worker + cola local en `localStorage` para POST/PUT/DELETE.
- **Seguridad básica:** JWT, hash de contraseñas con bcrypt, Helmet, auditoría de acciones.

## 2. Estructura de carpetas
```text
hacienda-el-rio/
├── client/
│   ├── app.js
│   ├── index.html
│   ├── manifest.json
│   ├── styles.css
│   └── sw.js
├── docs/
│   ├── README.md
│   ├── API.md
│   └── USER_GUIDE.md
├── server/
│   ├── .env.example
│   ├── package.json
│   └── src/
│       ├── config/db.js
│       ├── middleware/auth.js
│       ├── routes/*.js
│       ├── services/reportService.js
│       ├── utils/audit.js
│       └── server.js
└── sql/
    ├── schema.sql
    └── seed.sql
```

## 3. Instalación
### Requisitos
- Node.js 20+
- PostgreSQL 15+

### Pasos
1. Crear base de datos:
   ```sql
   CREATE DATABASE hacienda_el_rio;
   ```
2. Clonar/copiar el proyecto.
3. Configurar variables de entorno:
   ```bash
   cd server
   cp .env.example .env
   ```
4. Instalar dependencias:
   ```bash
   npm install
   ```
5. Cargar esquema y datos de prueba:
   ```bash
   psql "$DATABASE_URL" -f ../sql/schema.sql
   psql "$DATABASE_URL" -f ../sql/seed.sql
   ```
6. Iniciar servidor:
   ```bash
   npm run dev
   ```
7. Abrir en navegador:
   ```
   http://localhost:4000
   ```

## 4. Credenciales de prueba
- **Administrador:** admin@elrio.com / Admin123*
- **Operario:** capataz@elrio.com / Admin123*

## 5. Diseño funcional por módulo
### Control individual de animales
- Alta de animal con código único, sexo, fecha de nacimiento, categoría, raza y genealogía.
- Listado rápido con estado actual.

### Inventario real del hato
- Dashboard con conteo por categoría y por ubicación.
- Estado activo/sold/dead para inventario real.

### Identificación
- Campo `identification_type`: individual o lote.
- Tabla `lots` para agrupar animales.

### Movilización
- Tabla `animal_movements` con origen, destino, fecha y razón.
- Al guardar, actualiza ubicación actual del animal.

### Sanidad
- Registro de vacunas, tratamientos, enfermedades y procedimientos.
- Próxima fecha opcional para control sanitario.

### Transacciones
- Compras, ventas e internos.
- Si es venta con código animal, cambia estado a `sold`.

### Reproducción
- Eventos de monta, chequeo y parto.
- Relación hembra, macho y cría.

### Pesajes y desempeño
- Guarda peso por fecha.
- Calcula ganancia media diaria si existe pesaje previo.

### Inventario de insumos
- Muestra stock actual y punto de reorden.
- Dashboard alerta ítems en nivel bajo.

### Costos operacionales
- Ya soportado a nivel de base de datos y dashboard semanal.
- Siguiente iteración recomendada: formulario específico en UI.

### Usuarios y permisos
- Roles: admin, operario, técnico.
- Solo admin crea usuarios y ve listado completo.

### Reportes ejecutivos semanales
- `/api/reports/weekly`
- Descarga PDF y Excel desde el dashboard.

## 6. Consideraciones de producción
- Poner HTTPS en hosting.
- Mover JWT_SECRET a valor robusto.
- Activar backups automáticos del proveedor de PostgreSQL.
- Añadir logs externos y monitoreo si escala.

## 7. Mejoras inmediatas recomendadas
1. Agregar formulario UI para costos operacionales.
2. Agregar filtros por fecha y buscador por animal.
3. Añadir fotos del animal y lectura QR/arete.
4. Crear cron semanal para envío automático del reporte.
