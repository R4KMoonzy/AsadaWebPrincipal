# Seguridad — ASADA Bijagua

## Qué se corrigió en el código

- **Se eliminó el PIN `admin123`** de `app.js`. Ya no existe ninguna contraseña escrita en el frontend.
- El acceso administrativo ahora usa **Firebase Authentication** (`signInWithEmailAndPassword`). Firebase valida el correo y la contraseña en sus servidores; el navegador solo recibe un token temporal firmado.
- `isAdmin()` ya no se basa en `sessionStorage` (falsificable), sino en la sesión real que Firebase mantiene.
- Se agregó `firestore.rules`: lectura pública del contenido, escritura solo para el UID de administrador autorizado (`fwKIC4mAZCbRoBAKZJoggW95Len1`), y reportes públicos validados campo por campo.

## Lo que DEBES hacer en la consola de Firebase (paso obligatorio)

Mientras no apliques esto, el panel seguirá funcionando con la configuración antigua. Sigue estos pasos:

### 1. Activar Firebase Authentication

1. Entra a <https://console.firebase.google.com/> y abre el proyecto **asadawebprincipal**.
2. Menú **Authentication** → pestaña **Sign-in method**.
3. Activa **Correo electrónico / Contraseña** y guarda.
4. En la pestaña **Users** debe existir la cuenta del administrador (`asadabijagua@gmail.com`). Si la recreas, copia su **UID** y actualízalo en la función `esAdmin()` de `firestore.rules`.
5. El acceso se hace con ese correo y su contraseña. **No los compartas ni los dejes en el código.**
6. No intentes ocultar el botón de registro desactivando todo el proveedor: eso también impediría iniciar sesión. La protección real está en las reglas: aunque cualquier persona cree una cuenta, no podrá escribir porque su UID no está autorizado.

### 2. Publicar las reglas de Firestore

1. En la consola, ve a **Firestore Database** → pestaña **Rules**.
2. Reemplaza todo el contenido por el archivo `firestore.rules` de este proyecto y da clic en **Publish**.
3. Verifica que la regla de escritura exija `request.auth.uid == "fwKIC4mAZCbRoBAKZJoggW95Len1"` y que estén incluidas `sitio_historia`, `sitio_tecnologia` y `sitio_cobertura`.

### 3. Restringir la API key al dominio oficial

1. Abre <https://console.cloud.google.com/apis/credentials> con el mismo proyecto.
2. Busca la API key que aparece en `FIREBASE_CONFIG.apiKey`.
3. En **Application restrictions**, elige **HTTP referrers (web sites)** y agrega:
   - `asadabijagua.com/*`
   - `www.asadabijagua.com/*`
   - `localhost:5500/*` (solo para pruebas locales; quítalo al publicar).
4. En **API restrictions**, limita la llave a **Firebase Firestore API**, **Firebase Auth API** y **Identity Toolkit API**.
5. Guarda.

> Nota: el `apiKey`, `projectId`, `endpoint` de Appwrite y el `bucketId` son identificadores públicos necesarios para que el frontend se conecte. Verlos en DevTools **no es una filtración**: son públicos por diseño. La seguridad depende de las reglas, del UID autorizado y de restringir la llave por dominio.

## Lo que DEBES hacer en la consola de Appwrite

1. Entra a <https://cloud.appwrite.io/> y abre el proyecto `6af477840009bd198145`.
2. Ve a **Storage** → bucket `6af477980014e69c5286` → pestaña **Permissions**.
3. En **Settings → Platforms** deja registrados `https://www.asadabijagua.com` y, solo para pruebas, `http://localhost:5500`. El dominio sin `www` no está registrado y hace que las subidas fallen con «Failed to fetch»; `vercel.json` redirige ese dominio al `www`.
4. Configura:
   - **Read**: `Any` (para que las imágenes se vean en el sitio público).
   - **Create / Update / Delete**: actualmente deben permitir la subida desde el navegador o el panel dará 403. Para restringirlos de verdad, mueve la subida a una **Appwrite Function** que valide la sesión y use una API key de servidor; ahí sí puedes quitar `Create` al público.
5. No dejes `Create` cerrado mientras el panel siga subiendo las fotos directamente: ese es el error 403 que apareció antes.
6. Revisa **Settings → API keys** y elimina cualquier llave que no uses o que esté expuesta en el código.

## Verificación

Después de aplicar los pasos anteriores:

- Un visitante nuevo debe entrar en modo claro y ver el sitio normalmente.
- «Acceso Administrativo» debe pedir correo y contraseña.
- Con credenciales incorrectas debe mostrar «Correo o contraseña incorrectos…».
- Sin sesión, cualquier intento de escribir en Firestore desde la consola del navegador debe ser rechazado por las reglas.
- El formulario de reportes debe seguir funcionando (crea en `contactos` sin sesión, pero no permite leer reportes).
