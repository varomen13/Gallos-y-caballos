const API_URL = "https://commons.wikimedia.org/w/api.php";

function textoPlano(value) {
  const parsed = new DOMParser().parseFromString(value ?? "", "text/html");
  return (parsed.body.textContent ?? "").replace(/\s+/g, " ").trim();
}

export async function buscarImagen(termino, ancho = 800) {
  const cacheKey = `commons:${termino}:${ancho}`;
  try {
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch (error) {
    console.warn("No fue posible leer la caché de imágenes.", error);
  }

  const params = new URLSearchParams({
    action: "query",
    generator: "search",
    gsrsearch: termino,
    gsrnamespace: "6",
    gsrlimit: "5",
    prop: "imageinfo",
    iiprop: "url|extmetadata",
    iiurlwidth: String(ancho),
    format: "json",
    origin: "*",
  });

  try {
    const response = await fetch(`${API_URL}?${params}`);
    if (!response.ok) throw new Error(`Wikimedia Commons respondió ${response.status}.`);

    const data = await response.json();
    const pages = Object.values(data.query?.pages ?? {});
    const imagePage = pages.find((page) => /\.(jpe?g)$/i.test(page.title ?? ""));
    const imageInfo = imagePage?.imageinfo?.[0];
    const result = imageInfo
      ? {
          url: imageInfo.thumburl ?? imageInfo.url,
          author: textoPlano(imageInfo.extmetadata?.Artist?.value) || "Autor no indicado",
          license: textoPlano(imageInfo.extmetadata?.LicenseShortName?.value) || "Licencia no indicada",
        }
      : null;

    try {
      sessionStorage.setItem(cacheKey, JSON.stringify(result));
    } catch (error) {
      console.warn("No fue posible guardar la caché de imágenes.", error);
    }
    return result;
  } catch (error) {
    console.warn(`No se pudo obtener una imagen para "${termino}".`, error);
    return null;
  }
}
