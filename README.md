# Caballos Rancheros

Sitio web escolar sobre el caballo en la cultura ranchera mexicana. Incluye navegación responsive, registro con validación en el navegador, información de razas, tradiciones ecuestres y clima actual consultado mediante APIs públicas.

## Capturas

Pendientes.

El flujo Git Flow organiza el trabajo en `main`, `dev` y ramas `feature/*`; los cambios se integran primero en `dev`.

## Requisitos e instalación

Se requiere Node.js y npm.

```sh
npm install
```

## Configurar OpenWeatherMap

1. Crea una cuenta y genera una clave en [OpenWeatherMap](https://openweathermap.org/api).
2. Abre el archivo `.env` de la raíz y reemplaza `tu_clave_aqui` por tu propia clave:

```env
VITE_WEATHER_API_KEY=tu_clave_aqui
```

La clave puede tardar en activarse. No publiques ni compartas tu archivo `.env`. La clave que comienza por `VITE_` se entrega al navegador, por lo que este ejemplo es una práctica didáctica; una aplicación de producción debería consultar el servicio desde un backend.

## Ejecutar

```sh
npm run dev
```

Para generar y revisar la versión de producción:

```sh
npm run build
npm run preview
```

## APIs utilizadas

- **Wikidata Query Service**: búsqueda de nombre, país de origen y descripción de las razas. La app recurre a los datos locales si la consulta no está disponible.
- **OpenWeatherMap Current Weather**: condiciones actuales de Hermosillo, San Luis Río Colorado, Aguascalientes, Tepatitlán y Jerez. Requiere la variable `VITE_WEATHER_API_KEY`.
- **Wikimedia Commons**: fotografías consultadas bajo demanda; se muestran autor y licencia cuando Commons los proporciona y se usa una tarjeta de respaldo si no hay imagen.

Los datos aproximados de peso, altura y velocidad se mantienen en `src/data/razas.json`. El registro guarda en `localStorage` únicamente el nombre y el correo; no conserva la contraseña.
