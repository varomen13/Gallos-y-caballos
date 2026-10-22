const ENDPOINT = "https://query.wikidata.org/sparql";

async function buscarRaza(termino) {
  const query = `
    SELECT ?item ?itemLabel ?countryLabel ?description WHERE {
      SERVICE wikibase:mwapi {
        bd:serviceParam wikibase:api "EntitySearch";
          wikibase:endpoint "www.wikidata.org";
          mwapi:language "en";
          mwapi:search "${termino}";
          wikibase:limit "5".
        ?item wikibase:apiOutputItem mwapi:item.
      }
      OPTIONAL { ?item wdt:P495|wdt:P17 ?country. }
      OPTIONAL {
        ?item schema:description ?description.
        FILTER(LANG(?description) = "es")
      }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "es". }
    }
    LIMIT 5
  `;
  const params = new URLSearchParams({ query, format: "json" });
  const response = await fetch(`${ENDPOINT}?${params}`, {
    headers: { Accept: "application/sparql-results+json" },
  });
  if (!response.ok) throw new Error(`Wikidata respondió ${response.status}.`);
  const data = await response.json();
  const result = data.results?.bindings?.[0];
  if (!result) return null;

  return {
    nombre: result.itemLabel?.value ?? "",
    origen: result.countryLabel?.value ?? "",
    descripcion: result.description?.value ?? "",
  };
}

export async function obtenerDatosRazas(razas) {
  const resultados = await Promise.allSettled(
    razas.map(async (raza) => ({ id: raza.id, datos: await buscarRaza(raza.busquedaWikidata) })),
  );
  const datos = new Map();
  let huboError = false;

  resultados.forEach((resultado, index) => {
    if (resultado.status === "fulfilled" && resultado.value.datos) {
      datos.set(resultado.value.id, resultado.value.datos);
    } else {
      huboError = true;
      if (resultado.status === "rejected") {
        console.warn(`No se pudieron consultar datos Wikidata para ${razas[index].nombre}.`, resultado.reason);
      }
    }
  });

  return { datos, huboError };
}
