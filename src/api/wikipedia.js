const SUMMARY_URL = "https://es.wikipedia.org/api/rest_v1/page/summary/Joan_Sebastián";
const CACHE_KEY = "wikipedia:joan-sebastian";

export async function obtenerBiografia() {
  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) return JSON.parse(cached);
  } catch (error) {
    console.warn("No fue posible leer la caché de Wikipedia.", error);
  }

  let response;
  try {
    response = await fetch(SUMMARY_URL, { headers: { Accept: "application/json" } });
  } catch {
    throw new Error("No hay conexión para consultar la biografía.");
  }
  if (!response.ok) throw new Error(`Wikipedia respondió ${response.status}.`);

  const data = await response.json();
  const summary = {
    extract: typeof data.extract === "string" ? data.extract : "",
    page: typeof data.content_urls?.desktop?.page === "string" ? data.content_urls.desktop.page : "",
  };
  if (!summary.extract || !summary.page) throw new Error("Wikipedia no devolvió el resumen esperado.");

  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(summary));
  } catch (error) {
    console.warn("No fue posible guardar la caché de Wikipedia.", error);
  }
  return summary;
}
