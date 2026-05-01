<div align="center">
  <img src="public/Group 2.png" alt="KEYOUT" width="280" />
  <br /><br />
  <p><strong>Repositorio interno de diseños de impresión UV para teclados y dispositivos</strong></p>

  ![Laravel](https://img.shields.io/badge/Laravel-11-FF2D20?style=flat-square&logo=laravel&logoColor=white)
  ![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
  ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=flat-square&logo=postgresql&logoColor=white)
  ![Inertia](https://img.shields.io/badge/Inertia.js-2-9553E9?style=flat-square)
  ![Tailwind](https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
</div>

---

## ¿Qué es KEYOUT?

KEYOUT es una herramienta interna para equipos de impresión UV. Centraliza todos los diseños de layouts de teclados y frontales de dispositivos (portátiles, torres, SFF, mini PCs) en un único repositorio accesible por todo el equipo.

Antes de KEYOUT, los diseños estaban repartidos entre varios equipos y los datos de encuadre de cada impresora dependían de la memoria de una sola persona. Ahora cualquier trabajador nuevo puede encontrar un diseño, leer su configuración exacta y reproducir el trabajo correctamente sin depender de nadie.

---

## Características principales

### Repositorio de diseños
- Jerarquía navegable: **Marca → Tipo → Modelo → Diseños**
- Tipos de dispositivo: Portátil, Torre, SFF, Mini
- Vista previa de PDF e imágenes directamente en el navegador
- Descarga del archivo original
- Búsqueda por texto con lógica **AND multi-término** (`HP PT` filtra por HP y por idioma PT simultáneamente)
- Panel de filtros lateral: marca, tipo, idioma, estado de verificación y etiquetas

### Configuración por impresora
- Datos de encuadre por diseño y por impresora (offset, rotación, escala)
- Campos específicos para la **Mimaki UJF3042 MkIIe**: tipo de tinta, resolución, sobreimprimir
- Galería de imágenes del encuadre por diseño e impresora

### Verificaciones y trazabilidad
- Registro de verificaciones con fecha, usuario y observaciones
- Aviso automático cuando la configuración se modifica tras la última verificación
- Historial completo de cambios por impresora con diferencias campo a campo

### Etiquetas
- Etiquetas de color por diseño para agrupar pedidos o categorías
- Filtro multi-selección por etiquetas (lógica AND)
- Gestión de etiquetas desde el panel de administración

### Panel de administración
- Gestión de usuarios y roles (Admin / Operator)
- Catálogo de marcas y modelos con tipo de dispositivo
- Gestión de impresoras
- Gestión de etiquetas: renombrar, eliminar, limpiar sin uso

### Dashboard
- Resumen del repositorio con barras de progreso por impresora
- Alertas de diseños pendientes de re-verificar
- Últimos diseños subidos y últimas verificaciones

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Backend | Laravel 11 (PHP 8.3) |
| Frontend | React 18 + Inertia.js |
| Estilos | Tailwind CSS 3 |
| Base de datos | PostgreSQL |
| Build | Vite 6 |
| Servidor local | Laragon |

---

## Instalación

### Requisitos
- PHP 8.3+
- Composer 2+
- Node.js 20+
- PostgreSQL 14+

### 1. Clonar el repositorio

```bash
git clone https://github.com/danielgalc/keyboard-designs.git
cd keyboard-designs
```

### 2. Instalar dependencias

```bash
composer install
npm install
```

### 3. Configurar el entorno

```bash
cp .env.example .env
php artisan key:generate
```

Editar `.env` con los datos de la base de datos:

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=keyboard_designs
DB_USERNAME=postgres
DB_PASSWORD=tu_contraseña
```

### 4. Base de datos

Crear la base de datos `keyboard_designs` en PostgreSQL y ejecutar:

```bash
php artisan migrate --seed
```

El seeder crea automáticamente:
- Las dos impresoras UV (Mimaki UJF3042 MkIIe y Nocai UV6090i-II)
- 15 modelos de portátil de HP, Dell y Lenovo
- Usuario administrador inicial

### 5. Arrancar la aplicación

En dos terminales separadas:

```bash
# Terminal 1
php artisan serve

# Terminal 2
npm run dev
```

Acceder en `http://127.0.0.1:8000`

### Credenciales iniciales

| Campo | Valor |
|---|---|
| Email | `admin@keyboard-designs.local` |
| Contraseña | `password` |

> Cambiar la contraseña desde el perfil tras el primer acceso.

---

## Estructura del proyecto

```
app/
├── Http/Controllers/
├── Models/
│   ├── Design.php
│   ├── LaptopBrand.php / LaptopModel.php
│   ├── Printer.php / PrinterSetting.php
│   ├── PrinterSettingLog.php
│   ├── Verification.php
│   ├── PrinterImage.php
│   └── Tag.php
resources/js/
├── Pages/
│   ├── Designs/          # Index, Show, Create, Edit, Traceability
│   ├── Admin/            # Catalog, Printers, Users, Tags
│   ├── Auth/
│   ├── Profile/
│   └── Dashboard.jsx
├── Layouts/
├── Components/           # Combobox, TagInput
└── utils/                # tagColor.js, printerLogo.js
```

---

## Roles de usuario

| Rol | Permisos |
|---|---|
| **Admin** | Acceso completo: usuarios, catálogo, impresoras, etiquetas, eliminación de diseños |
| **Operator** | Subir y editar diseños, configurar encuadres, registrar verificaciones |

---

## Ramas

| Rama | Uso |
|---|---|
| `main` | Versión estable |
| `develop` | Desarrollo activo |
