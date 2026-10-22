const SEARCH_URL = "https://itunes.apple.com/search";
const CACHE_KEY = "itunes:joan-sebastian:MX";

export async function buscarCanciones() {
  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) return JSON.parse(cached);
  } catch (error) {
    console.warn("No fue posible leer la caché de iTunes.", error);
  }

  const params = new URLSearchParams({
    term: "Joan Sebastian",
    entity: "song",
    limit: "8",
    country: "MX",
  });
  let response;
  try {
    response = await fetch(`${SEARCH_URL}?${params}`);
  } catch {
    throw new Error("No hay conexión para consultar el catálogo musical.");
  }
  if (!response.ok) throw new Error(`iTunes Search API respondió ${response.status}.`);

  const data = await response.json();
  const canciones = (Array.isArray(data.results) ? data.results : [])
    .filter((cancion) => cancion.trackName && cancion.collectionName && cancion.artworkUrl100 && cancion.previewUrl)
    .slice(0, 8)
    .map(({ trackName, collectionName, artworkUrl100, previewUrl }) => ({
      trackName,
      collectionName,
      artworkUrl100,
      previewUrl,
    }));

  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(canciones));
  } catch (error) {
    console.warn("No fue posible guardar la caché de iTunes.", error);
  }
  return canciones;
}
