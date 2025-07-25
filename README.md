# Vive Villavo - PWA

Una aplicación web progresiva (PWA) para conectar a residentes y visitantes de Villavicencio con eventos culturales, comunidades locales y lugares de interés.

## 🚀 Características

- **Autenticación completa** con Supabase Auth (registro, login, recuperación de contraseña)
- **Sistema de roles** (usuario, business, admin) con permisos específicos
- **Onboarding interactivo** con quiz de intereses personalizado
- **Dashboard de usuario** con gestión de perfil y rewards
- **Sistema de rewards** (1 punto por cada 1000 COP gastados)
- **Moderación de contenido** con sistema de aprobación/rechazo
- **Integración con Google Maps** para visualización georreferenciada
- **Calendario dinámico** de eventos del mes actual
- **Selector de mood** para personalizar la experiencia
- **PWA completa** con manifest y service worker

## 🛠️ Tecnologías

- **Frontend**: React 18, Vite, Tailwind CSS
- **Estado**: Zustand para manejo de estado global
- **Routing**: React Router v7 con HashRouter
- **Autenticación**: Supabase Auth con RLS
- **Base de datos**: PostgreSQL (Supabase)
- **Almacenamiento**: Supabase Storage
- **Mapas**: Google Maps API
- **Animaciones**: Framer Motion
- **Forms**: React Hook Form
- **Notificaciones**: React Hot Toast
- **PWA**: Vite PWA Plugin

## 📦 Instalación

1. **Clona el repositorio**
```bash
git clone <repository-url>
cd vive-villavo
```

2. **Instala dependencias**
```bash
npm install
```

3. **Configura variables de entorno**
```bash
cp .env.example .env
```

Edita `.env` con tus credenciales:
```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
VITE_GOOGLE_MAPS_API_KEY=tu_clave_de_google_maps
```

4. **Configura Supabase**

Ejecuta las siguientes consultas SQL en tu proyecto de Supabase:

```sql
-- Crear tablas principales
CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  foto_url TEXT,
  intereses TEXT[] DEFAULT '{}',
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  rol TEXT NOT NULL DEFAULT 'user' CHECK (rol IN ('user', 'business', 'admin')),
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  fecha DATE NOT NULL,
  hora TIME,
  ubicacion TEXT NOT NULL,
  geolocalizacion TEXT,
  precio INTEGER DEFAULT 0,
  categoria TEXT,
  imagen_url TEXT,
  comunidad_id UUID,
  creado_por UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobado', 'rechazado')),
  comentario_admin TEXT,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE comunidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  intereses TEXT[] DEFAULT '{}',
  imagen_url TEXT,
  geolocalizacion TEXT,
  creado_por UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobado', 'rechazado')),
  comentario_admin TEXT,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE lugares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  tipo TEXT,
  direccion TEXT NOT NULL,
  geolocalizacion TEXT,
  imagen_url TEXT,
  creado_por UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobado', 'rechazado')),
  comentario_admin TEXT,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  evento_id UUID REFERENCES eventos(id) ON DELETE CASCADE,
  monto_cop INTEGER NOT NULL,
  puntos_obtenidos INTEGER NOT NULL,
  fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE historial (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  evento_id UUID REFERENCES eventos(id) ON DELETE CASCADE,
  asistio BOOLEAN DEFAULT FALSE,
  fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  comentario TEXT
);

CREATE TABLE moods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  mood_actual TEXT NOT NULL CHECK (mood_actual IN ('feliz', 'emocionado', 'relajado', 'aventurero', 'social', 'cultural')),
  fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear buckets de Storage
INSERT INTO storage.buckets (id, name, public) VALUES 
('usuarios', 'usuarios', true),
('eventos', 'eventos', true),
('comunidades', 'comunidades', true),
('lugares', 'lugares', true);

-- Habilitar RLS
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE comunidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE lugares ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial ENABLE ROW LEVEL SECURITY;
ALTER TABLE moods ENABLE ROW LEVEL SECURITY;

-- Políticas RLS básicas (ajustar según necesidades)
CREATE POLICY "Usuarios pueden ver su propio perfil" ON usuarios FOR ALL TO authenticated USING (auth.uid() = id);
CREATE POLICY "Todos pueden ver contenido aprobado" ON eventos FOR SELECT TO authenticated USING (estado = 'aprobado');
CREATE POLICY "Todos pueden ver contenido aprobado" ON comunidades FOR SELECT TO authenticated USING (estado = 'aprobado');
CREATE POLICY "Todos pueden ver contenido aprobado" ON lugares FOR SELECT TO authenticated USING (estado = 'aprobado');
```

5. **Inicia el servidor de desarrollo**
```bash
npm run dev
```

## 🏗️ Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── Auth/           # Componentes de autenticación
│   ├── Layout/         # Layout y navegación
│   └── UI/             # Componentes de interfaz
├── lib/                # Configuración y utilidades
│   └── supabase.js     # Cliente de Supabase
├── pages/              # Páginas de la aplicación
│   ├── Auth/           # Páginas de autenticación
│   └── Admin/          # Panel de administración
├── store/              # Stores de Zustand
│   ├── authStore.js    # Estado de autenticación
│   └── appStore.js     # Estado de la aplicación
└── common/             # Componentes comunes
    └── SafeIcon.jsx    # Wrapper seguro para iconos
```

## 🔐 Roles y Permisos

### Usuario (user)
- Explorar eventos, comunidades y lugares
- Crear contenido (pendiente de aprobación)
- Participar en eventos y ganar rewards
- Gestionar perfil personal

### Business (business)
- Todas las funciones de usuario
- Gestión especial de eventos de negocio
- Perfil destacado de empresa

### Admin (admin)
- Todas las funciones anteriores
- Moderar contenido pendiente
- Aprobar/rechazar eventos, comunidades y lugares
- Acceso al panel de administración
- Gestión de usuarios y estadísticas

## 🎯 Funcionalidades Principales

### Sistema de Rewards
- 1 punto por cada 1000 COP gastados en eventos
- Acumulación automática de puntos
- Visualización en tiempo real en el dashboard

### Moderación de Contenido
- Todo contenido inicia como 'pendiente'
- Revisión por administradores
- Estados: pendiente → aprobado/rechazado
- Comentarios de justificación

### Geolocalización
- Integración con Google Maps
- Pines diferenciados por categoría
- Información rápida en tarjetas emergentes
- Direcciones y navegación

### Personalización
- Quiz de intereses obligatorio
- Selector de mood diario
- Recomendaciones basadas en preferencias
- Dashboard personalizado

## 🚀 Despliegue

1. **Build de producción**
```bash
npm run build
```

2. **Preview local**
```bash
npm run preview
```

3. **Despliegue**
- El proyecto está configurado para desplegarse en cualquier hosting estático
- Recomendado: Vercel, Netlify, o Supabase Hosting

## 🔧 Configuración Adicional

### Google Maps
1. Crear proyecto en Google Cloud Console
2. Habilitar Maps JavaScript API
3. Crear clave API con restricciones apropiadas
4. Agregar dominios autorizados

### Supabase
1. Crear proyecto en Supabase
2. Configurar autenticación por email
3. Ejecutar migraciones SQL
4. Configurar políticas RLS según necesidades
5. Crear buckets de Storage

## 📱 PWA Features

- **Manifest.json** configurado
- **Service Worker** para caché offline
- **Instalable** en dispositivos móviles
- **Responsive** para todas las pantallas
- **Optimizado** para rendimiento móvil

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🆘 Soporte

Para soporte técnico o preguntas sobre el proyecto:

- 📧 Email: soporte@vivevillavo.com
- 📱 WhatsApp: +57 XXX XXX XXXX
- 🌐 Website: https://vivevillavo.com

---

**Vive Villavo** - Conectando a Villavicencio, un evento a la vez 🌟