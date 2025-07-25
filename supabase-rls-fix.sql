-- ====================================================================
-- CORREGIR POLÍTICAS RLS PARA PERMITIR CREACIÓN DE CONTENIDO
-- ====================================================================

-- 1. EVENTOS - Políticas para permitir INSERT y SELECT
-- ====================================================================

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Todos pueden ver contenido aprobado" ON eventos_vv23;
DROP POLICY IF EXISTS "Usuarios pueden crear eventos" ON eventos_vv23;
DROP POLICY IF EXISTS "Usuarios pueden ver sus eventos" ON eventos_vv23;

-- Política para VER eventos aprobados (todos los usuarios autenticados)
CREATE POLICY "Ver eventos aprobados" ON eventos_vv23
FOR SELECT TO authenticated
USING (estado = 'aprobado');

-- Política para CREAR eventos (usuarios autenticados)
CREATE POLICY "Crear eventos" ON eventos_vv23
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = creado_por);

-- Política para VER sus propios eventos (creador puede ver sus eventos pendientes/rechazados)
CREATE POLICY "Ver propios eventos" ON eventos_vv23
FOR SELECT TO authenticated
USING (auth.uid() = creado_por);

-- Política para ACTUALIZAR sus propios eventos (opcional)
CREATE POLICY "Actualizar propios eventos" ON eventos_vv23
FOR UPDATE TO authenticated
USING (auth.uid() = creado_por);

-- 2. COMUNIDADES - Políticas similares
-- ====================================================================

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Todos pueden ver contenido aprobado" ON comunidades_vv23;
DROP POLICY IF EXISTS "Usuarios pueden crear comunidades" ON comunidades_vv23;
DROP POLICY IF EXISTS "Usuarios pueden ver sus comunidades" ON comunidades_vv23;

-- Política para VER comunidades aprobadas
CREATE POLICY "Ver comunidades aprobadas" ON comunidades_vv23
FOR SELECT TO authenticated
USING (estado = 'aprobado');

-- Política para CREAR comunidades
CREATE POLICY "Crear comunidades" ON comunidades_vv23
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = creado_por);

-- Política para VER sus propias comunidades
CREATE POLICY "Ver propias comunidades" ON comunidades_vv23
FOR SELECT TO authenticated
USING (auth.uid() = creado_por);

-- Política para ACTUALIZAR sus propias comunidades
CREATE POLICY "Actualizar propias comunidades" ON comunidades_vv23
FOR UPDATE TO authenticated
USING (auth.uid() = creado_por);

-- 3. LUGARES - Políticas similares
-- ====================================================================

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Todos pueden ver contenido aprobado" ON lugares_vv23;
DROP POLICY IF EXISTS "Usuarios pueden crear lugares" ON lugares_vv23;
DROP POLICY IF EXISTS "Usuarios pueden ver sus lugares" ON lugares_vv23;

-- Política para VER lugares aprobados
CREATE POLICY "Ver lugares aprobados" ON lugares_vv23
FOR SELECT TO authenticated
USING (estado = 'aprobado');

-- Política para CREAR lugares
CREATE POLICY "Crear lugares" ON lugares_vv23
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = creado_por);

-- Política para VER sus propios lugares
CREATE POLICY "Ver propios lugares" ON lugares_vv23
FOR SELECT TO authenticated
USING (auth.uid() = creado_por);

-- Política para ACTUALIZAR sus propios lugares
CREATE POLICY "Actualizar propios lugares" ON lugares_vv23
FOR UPDATE TO authenticated
USING (auth.uid() = creado_por);

-- 4. USUARIOS - Políticas básicas
-- ====================================================================

-- Eliminar política existente si existe
DROP POLICY IF EXISTS "Usuarios pueden ver su propio perfil" ON usuarios;

-- Política para VER y ACTUALIZAR su propio perfil
CREATE POLICY "Gestionar propio perfil" ON usuarios
FOR ALL TO authenticated
USING (auth.uid() = id);

-- Política para CREAR perfil al registrarse
CREATE POLICY "Crear perfil" ON usuarios
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);

-- 5. USER_ROLES - Políticas para roles
-- ====================================================================

-- Política para VER su propio rol
CREATE POLICY "Ver propio rol" ON user_roles
FOR SELECT TO authenticated
USING (auth.uid() = usuario_id);

-- Política para CREAR rol inicial
CREATE POLICY "Crear rol inicial" ON user_roles
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = usuario_id);

-- 6. REWARDS - Políticas para sistema de puntos
-- ====================================================================

-- Política para VER sus propios rewards
CREATE POLICY "Ver propios rewards" ON rewards_vv23
FOR SELECT TO authenticated
USING (auth.uid() = usuario_id);

-- Política para CREAR rewards (cuando participa en eventos)
CREATE POLICY "Crear rewards" ON rewards_vv23
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = usuario_id);

-- 7. MOODS - Políticas para estados de ánimo
-- ====================================================================

-- Política para GESTIONAR su propio mood
CREATE POLICY "Gestionar propio mood" ON moods_vv23
FOR ALL TO authenticated
USING (auth.uid() = usuario_id)
WITH CHECK (auth.uid() = usuario_id);

-- 8. POLÍTICAS ESPECIALES PARA ADMINISTRADORES
-- ====================================================================

-- Los administradores pueden ver TODO el contenido (pendiente, aprobado, rechazado)
-- Estas políticas requieren una función auxiliar para verificar si el usuario es admin

-- Función para verificar si un usuario es admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE usuario_id = user_id AND rol = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas de ADMIN para eventos
CREATE POLICY "Admin puede gestionar todos los eventos" ON eventos_vv23
FOR ALL TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Políticas de ADMIN para comunidades
CREATE POLICY "Admin puede gestionar todas las comunidades" ON comunidades_vv23
FOR ALL TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Políticas de ADMIN para lugares
CREATE POLICY "Admin puede gestionar todos los lugares" ON lugares_vv23
FOR ALL TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- 9. VERIFICAR QUE RLS ESTÉ HABILITADO EN TODAS LAS TABLAS
-- ====================================================================

-- Habilitar RLS en todas las tablas (por si no estaba habilitado)
ALTER TABLE eventos_vv23 ENABLE ROW LEVEL SECURITY;
ALTER TABLE comunidades_vv23 ENABLE ROW LEVEL SECURITY;
ALTER TABLE lugares_vv23 ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards_vv23 ENABLE ROW LEVEL SECURITY;
ALTER TABLE moods_vv23 ENABLE ROW LEVEL SECURITY;

-- ====================================================================
-- INSTRUCCIONES PARA EJECUTAR ESTE SCRIPT:
-- ====================================================================
-- 1. Ve a tu proyecto de Supabase
-- 2. Navega a SQL Editor
-- 3. Pega este código completo
-- 4. Ejecuta el script
-- 5. Verifica que no haya errores
-- 6. Prueba crear contenido desde la aplicación
-- ====================================================================

-- ====================================================================
-- CONSULTAS DE VERIFICACIÓN (opcional)
-- ====================================================================
-- Para verificar que las políticas se crearon correctamente:

-- Ver todas las políticas de eventos
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
-- FROM pg_policies 
-- WHERE tablename = 'eventos_vv23';

-- Ver todas las políticas de comunidades
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
-- FROM pg_policies 
-- WHERE tablename = 'comunidades_vv23';

-- Ver todas las políticas de lugares
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
-- FROM pg_policies 
-- WHERE tablename = 'lugares_vv23';