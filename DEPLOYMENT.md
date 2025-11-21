# Guía de Despliegue Local

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** (versión 18 o superior)
- **Bun** (recomendado) o **npm**
- **Git**
- Una cuenta de **Supabase** (gratuita)
- Una cuenta de **Stripe** (opcional, para pagos)

## Paso 1: Clonar el Repositorio

\`\`\`bash
git clone <tu-repositorio>
cd <nombre-del-proyecto>
\`\`\`

## Paso 2: Instalar Dependencias

Con Bun (recomendado):
\`\`\`bash
bun install
\`\`\`

O con npm:
\`\`\`bash
npm install
\`\`\`

## Paso 3: Configurar Supabase

### 3.1 Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Crea una cuenta o inicia sesión
3. Crea un nuevo proyecto
4. Guarda las credenciales que te proporciona

### 3.2 Ejecutar Scripts SQL

En el panel de Supabase, ve a **SQL Editor** y ejecuta los siguientes scripts en orden:

1. `scripts/01-create-tables.sql` - Crea todas las tablas
2. `scripts/02-create-rls-policies.sql` - Configura las políticas de seguridad
3. `scripts/03-create-restaurant-trigger.sql` - Crea el trigger automático

## Paso 4: Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto copiando el archivo `.env.local.example`:

\`\`\`bash
cp .env.local.example .env.local
\`\`\`

Edita `.env.local` y completa las variables:

\`\`\`env
# Supabase (OBLIGATORIO)
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key

# Stripe (OPCIONAL - solo si usarás pagos)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=tu_stripe_publishable_key
STRIPE_SECRET_KEY=tu_stripe_secret_key
STRIPE_WEBHOOK_SECRET=tu_stripe_webhook_secret

# Desarrollo (OPCIONAL)
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/admin
\`\`\`

### Dónde encontrar las credenciales de Supabase:

1. **URL y Anon Key**: En tu proyecto de Supabase → Settings → API
2. **Service Role Key**: En la misma página, en la sección "Project API keys"

### Dónde encontrar las credenciales de Stripe (opcional):

1. Ve a [dashboard.stripe.com](https://dashboard.stripe.com)
2. **Publishable Key y Secret Key**: Developers → API keys
3. **Webhook Secret**: Developers → Webhooks → Add endpoint

## Paso 5: Ejecutar en Desarrollo

Con Bun:
\`\`\`bash
bun dev
\`\`\`

O con npm:
\`\`\`bash
npm run dev
\`\`\`

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

## Paso 6: Crear tu Primera Cuenta

1. Ve a [http://localhost:3000](http://localhost:3000)
2. Haz clic en "Comenzar Gratis"
3. Completa el formulario de registro
4. Verifica tu email (revisa la bandeja de spam)
5. Inicia sesión y comienza a configurar tu restaurante

## Solución de Problemas Comunes

### Error: "Supabase configuration is missing"

- Verifica que las variables `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` estén correctamente configuradas en `.env.local`
- Asegúrate de que el archivo `.env.local` esté en la raíz del proyecto
- Reinicia el servidor de desarrollo después de cambiar las variables

### Error: "No se pueden crear tablas/mesas/categorías"

- Verifica que hayas ejecutado todos los scripts SQL en Supabase
- Comprueba que las políticas RLS estén activas
- Revisa la consola del navegador para ver errores específicos

### Error de autenticación

- Verifica que hayas confirmado tu email
- Comprueba que la URL de redirección esté configurada correctamente
- En Supabase → Authentication → URL Configuration, añade `http://localhost:3000` a las URLs permitidas

### La base de datos está vacía

- Ejecuta los scripts SQL en el orden correcto
- Verifica que el trigger de creación automática de restaurante esté activo
- Comprueba los logs de Supabase para ver si hay errores

## Despliegue en Producción

### Opción 1: Vercel (Recomendado)

1. Sube tu código a GitHub
2. Ve a [vercel.com](https://vercel.com)
3. Importa tu repositorio
4. Configura las variables de entorno en Vercel
5. Despliega

### Opción 2: Otros Proveedores

El proyecto es compatible con cualquier proveedor que soporte Next.js:
- Netlify
- Railway
- Render
- AWS Amplify

## Comandos Útiles

\`\`\`bash
# Desarrollo
bun dev

# Build de producción
bun run build

# Ejecutar build de producción localmente
bun start

# Linter
bun run lint

# Formatear código
bun run format
\`\`\`

## Soporte

Si encuentras problemas:

1. Revisa los logs de la consola del navegador
2. Revisa los logs del servidor (terminal)
3. Verifica los logs de Supabase
4. Consulta la documentación de Next.js y Supabase

## Recursos Adicionales

- [Documentación de Next.js](https://nextjs.org/docs)
- [Documentación de Supabase](https://supabase.com/docs)
- [Documentación de Stripe](https://stripe.com/docs)
- [Documentación de shadcn/ui](https://ui.shadcn.com)
