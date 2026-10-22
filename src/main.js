import razas from "./data/razas.json";
import { buscarImagen } from "./api/imagenes.js";
import { obtenerDatosRazas } from "./api/wikidata.js";
import { ciudadesClima, obtenerClima } from "./api/clima.js";
import { obtenerBiografia } from "./api/wikipedia.js";
import { buscarCanciones } from "./api/musica.js";
import { nivelFortaleza, validarCampo } from "./validacion.js";
import { iniciarNavegacion } from "./router.js";
import "./styles/main.css";

const elemento = (etiqueta, clase, texto) => {
  const nodo = document.createElement(etiqueta);
  if (clase) nodo.className = clase;
  if (texto !== undefined) nodo.textContent = texto;
  return nodo;
};

function figuraImagen(contenedor, termino, alt, clase = "") {
  contenedor.classList.add("image-loading");
  buscarImagen(termino).then((imagen) => {
    contenedor.replaceChildren();
    contenedor.classList.remove("image-loading");
    if (!imagen?.url) {
      contenedor.classList.add("image-fallback");
      contenedor.append(elemento("span", "fallback-icon", "✦"), elemento("span", "fallback-title", alt));
      return;
    }
    const img = elemento("img", clase);
    img.src = imagen.url;
    img.alt = alt;
    img.loading = "lazy";
    img.onerror = () => {
      img.remove();
      contenedor.classList.add("image-fallback");
      contenedor.append(elemento("span", "fallback-icon", "✦"), elemento("span", "fallback-title", alt));
    };
    contenedor.append(img);
    const credit = elemento("small", "image-credit", `Foto: ${imagen.author} · ${imagen.license}`);
    contenedor.append(credit);
  });
}

function crearRazaCard(raza, datos) {
  const card = elemento("article", "breed-card");
  const foto = elemento("div", "breed-photo");
  foto.setAttribute("aria-label", `Imagen: ${raza.nombre}`);
  figuraImagen(foto, raza.imagen, `Caballo de raza ${raza.nombre}`);
  const contenido = elemento("div", "breed-content");
  contenido.append(elemento("p", "eyebrow", "Raza equina"), elemento("h2", "", raza.nombre));
  const descripcion = datos?.descripcion || raza.descripcion;
  contenido.append(elemento("p", "breed-description", descripcion));
  const origen = datos?.origen || raza.origen;
  const datosLista = elemento("dl", "breed-details");
  [
    ["Origen", origen],
    ["Peso aproximado", raza.peso],
    ["Altura", raza.altura],
    ["Velocidad máxima", raza.velocidad],
  ].forEach(([titulo, valor]) => {
    datosLista.append(elemento("dt", "", titulo), elemento("dd", "", valor));
  });
  contenido.append(datosLista);
  card.dataset.search = `${raza.nombre} ${origen}`.toLocaleLowerCase("es");
  card.append(foto, contenido);
  return card;
}

async function iniciarRazas() {
  const grid = document.getElementById("breed-grid");
  const aviso = document.getElementById("wikidata-notice");
  grid.replaceChildren(...razas.map((raza) => crearRazaCard(raza, null)));
  const { datos, huboError } = await obtenerDatosRazas(razas);
  grid.replaceChildren(...razas.map((raza) => crearRazaCard(raza, datos.get(raza.id))));
  if (huboError) {
    aviso.textContent = "Algunos datos de Wikidata no respondieron; se muestran los datos de referencia locales.";
    aviso.hidden = false;
  }

  document.getElementById("breed-search").addEventListener("input", (event) => {
    const consulta = event.target.value.trim().toLocaleLowerCase("es");
    [...grid.children].forEach((card) => {
      card.hidden = !card.dataset.search.includes(consulta);
    });
    if (![...grid.children].some((card) => !card.hidden)) {
      const sinResultados = elemento("p", "empty-state", "No encontramos razas con ese nombre.");
      sinResultados.id = "no-breeds";
      if (!document.getElementById("no-breeds")) grid.append(sinResultados);
    } else {
      document.getElementById("no-breeds")?.remove();
    }
  });
}

function iniciarGaleria() {
  const galeria = document.getElementById("gallery-grid");
  [
    ["charreria", "Charrería mexicana"],
    ["jaripeo", "Jaripeo en una fiesta regional"],
    ["Feria Nacional de San Marcos", "Feria Nacional de San Marcos"],
    ["carrera de caballos", "Carrera de caballos"],
    ["hipodromo", "Hipódromo y pista de carreras"],
  ].forEach(([termino, alt]) => {
    const figure = elemento("figure", "gallery-card");
    const foto = elemento("div", "gallery-photo");
    figuraImagen(foto, termino, alt);
    figure.append(foto, elemento("figcaption", "", alt));
    galeria.append(figure);
  });
}

async function iniciarHomenajeJoanSebastian() {
  const bioStatus = document.getElementById("joan-bio-status");
  const bioExtract = document.getElementById("joan-bio-extract");
  const bioLink = document.getElementById("joan-wikipedia-link");
  try {
    const biografia = await obtenerBiografia();
    bioExtract.textContent = biografia.extract;
    const pagina = new URL(biografia.page);
    if (pagina.protocol !== "https:" || pagina.hostname !== "es.wikipedia.org") {
      throw new Error("Wikipedia devolvió un enlace no válido.");
    }
    bioLink.href = pagina.href;
    bioLink.hidden = false;
    bioStatus.textContent = "";
  } catch (error) {
    bioStatus.textContent = "No fue posible cargar la biografía desde Wikipedia. Inténtalo más tarde.";
    console.warn("No se pudo consultar la biografía de Joan Sebastián.", error);
  }

  const galeria = document.getElementById("joan-gallery");
  [
    ["Joan Sebastián", "Retrato de Joan Sebastián"],
    ["jaripeo", "Jaripeo en una celebración ranchera"],
    ["Joan Sebastián caballo", "Joan Sebastián y la tradición ecuestre"],
  ].forEach(([termino, alt]) => {
    const figure = elemento("figure", "gallery-card joan-gallery-card");
    const foto = elemento("div", "gallery-photo");
    figuraImagen(foto, termino, alt);
    figure.append(foto, elemento("figcaption", "", alt));
    galeria.append(figure);
  });

  const musicStatus = document.getElementById("music-status");
  const musicGrid = document.getElementById("music-grid");
  try {
    const canciones = await buscarCanciones();
    musicGrid.replaceChildren();
    if (!canciones.length) throw new Error("iTunes no devolvió canciones con fragmento disponible.");
    canciones.forEach((cancion) => {
      const tarjeta = elemento("article", "music-card");
      const portada = elemento("img", "music-artwork");
      portada.src = cancion.artworkUrl100;
      portada.alt = `Portada del álbum ${cancion.collectionName}`;
      portada.loading = "lazy";
      portada.onerror = () => {
        portada.removeAttribute("src");
        portada.classList.add("artwork-fallback");
      };

      const informacion = elemento("div", "music-info");
      informacion.append(elemento("h3", "", cancion.trackName), elemento("p", "", cancion.collectionName));
      const reproductor = elemento("audio", "music-player");
      reproductor.controls = true;
      reproductor.preload = "none";
      reproductor.src = cancion.previewUrl;
      reproductor.setAttribute("aria-label", `Reproducir fragmento de ${cancion.trackName}`);
      tarjeta.append(portada, informacion, reproductor);
      musicGrid.append(tarjeta);
    });
    musicStatus.textContent = "";
  } catch (error) {
    musicStatus.textContent = "No pudimos cargar las canciones ahora. Puedes buscar su música en YouTube.";
    const youtubeLink = elemento("a", "text-link", "Buscar a Joan Sebastián en YouTube");
    youtubeLink.href = "https://www.youtube.com/results?search_query=Joan+Sebastian+jaripeo";
    youtubeLink.target = "_blank";
    youtubeLink.rel = "noopener noreferrer";
    musicStatus.append(" ", youtubeLink);
    musicGrid.replaceChildren();
    console.warn("No se pudo consultar la música de Joan Sebastián.", error);
  }
}

function pintarClimaCargando() {
  const grid = document.getElementById("weather-grid");
  grid.replaceChildren(...ciudadesClima().map((ciudad) => {
    const card = elemento("article", "weather-card weather-loading");
    card.append(elemento("p", "eyebrow", ciudad.estado), elemento("h2", "", ciudad.nombre), elemento("p", "loading-state", "Consultando condiciones..."));
    return card;
  }));
}

async function cargarClima() {
  const status = document.getElementById("weather-status");
  const grid = document.getElementById("weather-grid");
  const apiKey = import.meta.env.VITE_WEATHER_API_KEY?.trim();
  pintarClimaCargando();

  if (!apiKey || apiKey === "tu_clave_aqui") {
    status.textContent = "Configura VITE_WEATHER_API_KEY en .env para consultar el clima actual.";
    grid.replaceChildren(...ciudadesClima().map((ciudad) => {
      const card = elemento("article", "weather-card weather-unavailable");
      card.append(elemento("p", "eyebrow", ciudad.estado), elemento("h2", "", ciudad.nombre), elemento("p", "", "Clima no disponible: falta configurar la clave de OpenWeatherMap."));
      return card;
    }));
    return;
  }

  status.textContent = "Consultando el clima actual...";
  const resultados = await Promise.allSettled(ciudadesClima().map((ciudad) => obtenerClima(ciudad, apiKey)));
  grid.replaceChildren();
  let huboError = false;
  resultados.forEach((resultado, index) => {
    const ciudad = ciudadesClima()[index];
    const card = elemento("article", "weather-card");
    card.append(elemento("p", "eyebrow", ciudad.estado), elemento("h2", "", ciudad.nombre));
    if (resultado.status === "fulfilled") {
      const clima = resultado.value;
      card.append(elemento("p", "weather-temperature", `${clima.temperatura}°`), elemento("p", "weather-description", clima.descripcion));
      const detalles = elemento("div", "weather-details");
      detalles.append(elemento("span", "", `Sensación ${clima.sensacion}°`), elemento("span", "", `Humedad ${clima.humedad}%`), elemento("span", "", `Viento ${clima.viento} m/s`));
      card.append(detalles);
      card.append(elemento("p", "track-note", clima.temperatura >= 32 ? "Calor intenso: conviene evitar las horas de mayor temperatura." : "Revisa que la pista esté firme y sin zonas resbaladizas."));
    } else {
      huboError = true;
      card.append(elemento("p", "weather-error", resultado.reason.message || "No fue posible obtener el clima de esta ciudad."));
      console.warn(`Error de clima para ${ciudad.nombre}.`, resultado.reason);
    }
    grid.append(card);
  });
  if (huboError) {
    const mensajes = [...new Set(resultados
      .filter((resultado) => resultado.status === "rejected")
      .map((resultado) => resultado.reason.message))].filter(Boolean);
    status.textContent = mensajes.length
      ? mensajes.join(" ")
      : "Algunas ciudades no respondieron. Revisa tu conexión o la clave de OpenWeatherMap.";
  } else {
    status.textContent = "Condiciones actuales consultadas con OpenWeatherMap.";
  }
}

function iniciarFormulario() {
  const form = document.getElementById("register-form");
  const campos = [...form.querySelectorAll("input")];
  const password = form.elements.password;
  const confirmacion = form.elements.confirmPassword;
  const mensaje = document.getElementById("register-message");
  const fuerza = document.getElementById("password-strength");
  const barra = document.getElementById("strength-bar");

  campos.forEach((campo) => {
    campo.addEventListener("input", () => {
      validarCampo(campo, form);
      if (campo === password) {
        const resultado = nivelFortaleza(password.value);
        fuerza.textContent = `Fuerza de contraseña: ${resultado.texto}`;
        barra.style.width = `${(resultado.nivel / 5) * 100}%`;
        barra.dataset.level = String(resultado.nivel);
        if (confirmacion.value) validarCampo(confirmacion, form);
      }
      mensaje.textContent = "";
    });
    campo.addEventListener("change", () => validarCampo(campo, form));
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const valido = campos.map((campo) => validarCampo(campo, form)).every(Boolean);
    if (!valido) {
      mensaje.textContent = "Revisa los campos marcados antes de continuar.";
      mensaje.className = "form-message form-message-error";
      return;
    }

    const nombre = form.elements.name.value.trim();
    const correo = form.elements.email.value.trim();
    // En un proyecto real, el registro y cualquier manejo de credenciales se realizarían en un backend seguro.
    localStorage.setItem("caballos-rancheros-usuario", JSON.stringify({ nombre, correo }));
    mensaje.textContent = `¡Bienvenida/o, ${nombre}! Tu registro se completó correctamente.`;
    mensaje.className = "form-message form-message-success";
    form.reset();
    campos.forEach((campo) => {
      campo.setAttribute("aria-invalid", "false");
      const error = document.getElementById(`${campo.name === "confirmPassword" ? "confirm-password" : campo.name}-error`);
      if (error) error.textContent = "";
    });
    fuerza.textContent = "Fuerza de contraseña: sin evaluar";
    barra.style.width = "0";
    delete barra.dataset.level;
  });
}

iniciarNavegacion();
figuraImagen(document.getElementById("hero-image"), "caballo charro Mexico", "Caballo charro en México");
iniciarRazas();
iniciarGaleria();
iniciarHomenajeJoanSebastian();
iniciarFormulario();
document.getElementById("weather-refresh").addEventListener("click", cargarClima);
cargarClima();
