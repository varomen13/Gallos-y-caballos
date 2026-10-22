const API_URL = "https://api.openweathermap.org/data/2.5/weather";
const CIUDADES = [
  { nombre: "Hermosillo", query: "Hermosillo,mx", estado: "Sonora" },
  { nombre: "San Luis Río Colorado", query: "San Luis Rio Colorado,mx", estado: "Sonora" },
  { nombre: "Aguascalientes", query: "Aguascalientes,mx", estado: "Aguascalientes" },
  { nombre: "Tepatitlán", query: "Tepatitlan de Morelos,mx", estado: "Jalisco" },
  { nombre: "Jerez", query: "Jerez,Zacatecas,mx", estado: "Zacatecas" },
];

export function ciudadesClima() {
  return CIUDADES;
}

export async function obtenerClima(ciudad, apiKey) {
  const params = new URLSearchParams({
    q: ciudad.query,
    appid: apiKey,
    units: "metric",
    lang: "es",
  });
  let response;
  try {
    response = await fetch(`${API_URL}?${params}`);
  } catch {
    throw new Error("No hay conexión con el servicio de clima. Revisa tu internet e inténtalo de nuevo.");
  }

  if (response.status === 401) throw new Error("La clave de clima no es válida o aún no se activa.");
  if (response.status === 429) throw new Error("Se alcanzó el límite de consultas de clima. Inténtalo más tarde.");
  if (!response.ok) throw new Error("No se pudo consultar el clima de esta ciudad.");

  const data = await response.json();
  return {
    temperatura: Math.round(data.main.temp),
    sensacion: Math.round(data.main.feels_like),
    descripcion: data.weather?.[0]?.description ?? "Condición no disponible",
    humedad: data.main.humidity,
    viento: Math.round(data.wind?.speed ?? 0),
  };
}
