# SubsManager — Frontend de Gestión de Suscripciones

Frontend React + TypeScript para el sistema de suscripciones, con formulario de pago, dashboard en tiempo real y notificaciones WebSocket.

---

## Setup rápido

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con las URLs de tu backend

# 3. Iniciar servidor de desarrollo
npm run dev
# → http://localhost:5173
```

El backend debe estar corriendo en `http://localhost:3000` (configurable en `.env`).

---

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo (HMR) |
| `npm run build` | Build de producción |
| `npm run preview` | Previsualizar build de producción |
| `npm test` | Tests unitarios (Vitest, single run) |
| `npm run test:watch` | Tests en modo watch |
| `npm run test:coverage` | Reporte de cobertura (≥70%) |
| `npm run test:e2e` | Tests E2E con Playwright |

---

## Estructura de carpetas

```
src/
├── __tests__/
│   ├── unit/                    # Tests unitarios (Vitest + Testing Library)
│   │   ├── validation.test.ts
│   │   ├── useNotifications.test.ts
│   │   ├── httpClient.test.ts
│   │   ├── websocketService.test.ts
│   │   ├── SubscriptionForm.test.tsx
│   │   └── Dashboard.test.tsx
│   └── e2e/                     # Tests E2E (Playwright)
│       └── subscription.spec.ts
├── components/
│   ├── ui/                      # Primitivos reutilizables (Button, Input, Card…)
│   ├── forms/
│   │   ├── SubscriptionForm.tsx  # Formulario principal con validación
│   │   └── CreditCardPreview.tsx # Vista previa animada de tarjeta
│   ├── dashboard/
│   │   ├── Dashboard.tsx         # Dashboard con filtros y estadísticas
│   │   └── SubscriptionCard.tsx  # Tarjeta individual de suscripción
│   └── notifications/
│       ├── NotificationPanel.tsx # Panel de notificaciones (dropdown)
│       └── ToastContainer.tsx    # Toasts en tiempo real
├── hooks/
│   ├── useNotifications.ts      # Estado y acciones de notificaciones
│   ├── useSubscriptions.ts      # Fetch + estado de suscripciones
│   └── useWebSocket.ts          # Conexión WebSocket reactiva
├── services/
│   ├── httpClient.ts            # Axios + reintentos automáticos
│   ├── subscriptionService.ts   # Llamadas a la API REST
│   └── websocketService.ts      # Servicio WebSocket con reconexión
├── types/
│   └── index.ts                 # Tipos TypeScript compartidos
├── utils/
│   └── validation.ts            # Esquemas Zod + helpers de formato
├── App.tsx                      # Componente raíz + layout
├── main.tsx                     # Entry point
├── index.css                    # Design tokens + reset
└── test-setup.ts                # Configuración de Vitest
```

---

## Decisiones técnicas

### Stack

- **Vite** — Build tool moderno, HMR instantáneo, code splitting automático.
- **React 18** — Concurrent features, Suspense para lazy loading de rutas.
- **TypeScript strict** — Cobertura de tipos completa, sin `any` implícitos.
- **Zod + react-hook-form** — Validación isomórfica: el mismo esquema sirve para client y server; `react-hook-form` minimiza re-renders con estado no controlado.
- **Axios** — Interceptores de respuesta para implementar retry exponencial sin boilerplate.

### Manejo de errores HTTP

El cliente HTTP (`httpClient.ts`) clasifica los errores en un ADT (`ApiError`) con variantes `timeout | network | server | validation | unknown`. Esto permite que los componentes muestren mensajes específicos sin lógica de string-matching:

```
timeout  → "La solicitud tardó demasiado…"
network  → "Sin conexión al servidor…"
server   → mensaje del backend (o genérico para 5xx)
validation → errores por campo (422)
```

**Retry automático:** 3 reintentos con backoff exponencial (1s → 2s → 4s) solo para errores de red y 5xx. No reintenta 4xx (errores del cliente).

### WebSocket + reconexión

`WebSocketService` es un singleton con:
- Reconexión automática con backoff (hasta 5 intentos).
- API de suscripción basada en callbacks (observer pattern).
- Limpieza correcta de listeners para evitar memory leaks.

### Optimización de renders

- `React.memo` en `SubscriptionCard` y `Button` — evita re-render cuando el padre actualiza estado no relacionado.
- `useMemo` en el filtrado de suscripciones.
- `useCallback` en handlers de formulario y eventos.
- **Lazy loading** de `SubscriptionForm` y `Dashboard` con `React.lazy` + `Suspense`.

### Testing

- **Unitarios (Vitest):** lógica de negocio, hooks, servicios, componentes en aislamiento con mocks.
- **E2E (Playwright):** flujo completo de usuario contra backend real; cubre validaciones, envío exitoso, doble click, filtros y notificaciones.
- **Umbral de cobertura:** 70% en branches, funciones, líneas y statements.

### Accesibilidad

- Todos los inputs tienen `label` asociado vía `htmlFor`.
- Errores de formulario usan `role="alert"` y `aria-describedby`.
- Estados de carga exponen `aria-busy`.
- Panel de notificaciones gestiona foco y cierre con `Escape`.
- Soporte para `prefers-reduced-motion`.

---

## Variables de entorno

| Variable | Por defecto | Descripción |
|---|---|---|
| `VITE_API_URL` | `http://localhost:3000` | URL base del backend REST |
| `VITE_WS_URL` | `ws://localhost:3000` | URL del endpoint WebSocket |

---

## Endpoints del backend consumidos

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/api/subscription` | Crear suscripción |
| `GET` | `/api/subscription/:id` | Obtener suscripción por ID |
| `GET` | `/api/subscriptions` | Listar todas las suscripciones |
| `WS` | `/notifications` | Notificaciones en tiempo real |

### Mensajes WebSocket soportados

```json
{ "type": "PAYMENT_SUCCESS", "id": "uuid" }
{ "type": "PAYMENT_FAILED", "id": "uuid" }
{ "type": "SUBSCRIPTION_CANCELLED", "id": "uuid" }
{ "type": "SUBSCRIPTION_EXPIRED", "id": "uuid" }
```

---

## Edge cases manejados

- **Doble click en submit:** botón deshabilitado mientras `isSubmitting === true`.
- **Sin conexión al cargar dashboard:** muestra error con botón de reintento; conserva datos anteriores si existían.
- **WebSocket caído:** indicador visual en header + panel; reconexión silenciosa en background.
- **Tarjeta con Luhn inválido:** validado client-side antes de enviar.
- **Formateo de número de tarjeta:** separación automática en grupos de 4 dígitos.
- **Vencimiento próximo:** badge de advertencia en tarjetas que expiran en menos de 7 días.
