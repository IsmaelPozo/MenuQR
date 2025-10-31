const LibreTranslate = require("libretranslatejs");

// Puedes poner la URL de tu instancia aquí; o dejar vacío para usar la pública
const lt = new LibreTranslate({
  // url: "https://tulibretranslate.com", // OPCIONAL: tu instancia
  fetch: global.fetch // Si usas Node 18+, si no omite esta línea
});

async function translateText(text, fromLang, toLang) {
  if (!text || fromLang === toLang) return text;

  try {
    const res = await lt.translate(text, fromLang, toLang);
    return res;
  } catch (err) {
    console.error("❌ Error en traducción LibreTranslateJS:", err.message || err);
    throw new Error("Error traduciendo con LibreTranslate");
  }
}

module.exports = {
  translateText,
};
