const reglas = {
  name(value) {
    const nombre = value.trim();
    if (!nombre) return "Escribe tu nombre.";
    if (nombre.length < 3) return "El nombre debe tener al menos 3 caracteres.";
    if (!/^[\p{L}\s]+$/u.test(nombre)) return "Usa solo letras y espacios.";
    return "";
  },
  email(value) {
    const correo = value.trim();
    if (!correo) return "Escribe tu correo electrónico.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo)) return "Escribe un correo con formato válido.";
    return "";
  },
  phone(value) {
    const telefono = value.trim();
    if (!/^\d{10}$/.test(telefono)) return "El teléfono debe tener exactamente 10 dígitos.";
    return "";
  },
  password(value) {
    if (value.length < 8) return "Usa al menos 8 caracteres.";
    if (!/[A-ZÁÉÍÓÚÜÑ]/.test(value)) return "Agrega al menos una mayúscula.";
    if (!/[a-záéíóúüñ]/.test(value)) return "Agrega al menos una minúscula.";
    if (!/\d/.test(value)) return "Agrega al menos un número.";
    if (!/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9]/.test(value)) return "Agrega al menos un símbolo.";
    return "";
  },
  confirmPassword(value, form) {
    if (!value) return "Confirma tu contraseña.";
    if (value !== form.elements.password.value) return "Las contraseñas no coinciden.";
    return "";
  },
  terms(_value, form) {
    return form.elements.terms.checked ? "" : "Debes aceptar los términos para continuar.";
  },
};

export function validarCampo(campo, form) {
  const error = reglas[campo.name]?.(campo.value, form) ?? "";
  campo.setAttribute("aria-invalid", String(Boolean(error)));
  const mensaje = document.getElementById(`${campo.name === "confirmPassword" ? "confirm-password" : campo.name}-error`);
  if (mensaje) mensaje.textContent = error;
  return !error;
}

export function nivelFortaleza(password) {
  if (!password) return { nivel: 0, texto: "sin evaluar" };
  const criterios = [
    password.length >= 8,
    /[A-ZÁÉÍÓÚÜÑ]/.test(password),
    /[a-záéíóúüñ]/.test(password),
    /\d/.test(password),
    /[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9]/.test(password),
  ].filter(Boolean).length;
  const niveles = ["muy débil", "débil", "regular", "buena", "fuerte", "fuerte"];
  return { nivel: criterios, texto: niveles[criterios] };
}
