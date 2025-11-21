const express = require("express")
const db = require("../config/database")
const { authenticateToken, optionalAuth } = require("../middleware/auth")
const aiTranslation = require("../services/aiTranslation")

// Update menu item
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() }); // Guarda el archivo en memoria para luego insertarlo en BD


const router = express.Router()

// Get menu by QR code (public route)
router.get("/public/:qrCode", async (req, res) => {
  try {
    const { qrCode } = req.params
    const language = req.query.lang || "es"

    console.log(`🔍 Buscando menú para QR: ${qrCode}, idioma: ${language}`)

    // Find table and restaurant
    const [tables] = await db.execute(
      "SELECT t.*, r.name as restaurant_name FROM tables t JOIN restaurants r ON t.restaurant_id = r.id WHERE t.table_number = ?",
      [qrCode],
    )

    if (tables.length === 0) {
      console.log(`❌ Mesa no encontrada para QR: ${qrCode}`)
      return res.status(404).json({ error: "Mesa no encontrada" })
    }

    const table = tables[0]
    console.log(`✅ Mesa encontrada: ${table.table_number}, Restaurante: ${table.restaurant_name}`)

    // Get menu categories
    const [categories] = await db.execute(
      "SELECT DISTINCT mc.* FROM menu_items mi JOIN menu_categories mc ON mi.category_id = mc.id WHERE mi.restaurant_id = ? AND is_available = 1 ORDER BY mc.id",
      [table.restaurant_id],
    )

    // Get menu items for each category with ingredients
    const [menuItems] = await db.execute(
      `
      SELECT 
        mi.*,
        GROUP_CONCAT(
          JSON_OBJECT(
            'id', mii.id,
            'ingredient_name', mii.ingredient_name,
            'is_allergen', mii.is_allergen,
            'is_removable', mii.is_removable
          )
        ) as ingredients_json
      FROM menu_items mi
      LEFT JOIN menu_item_ingredients mii ON mi.id = mii.menu_item_id
      WHERE mi.restaurant_id = ? AND mi.is_available = 1
      GROUP BY mi.id
      ORDER BY mi.category_id, mi.name
    `,
      [table.restaurant_id],
    )
    console.log(menuItems);
    // Process ingredients
    const processedMenuItems = menuItems.map((item) => ({
      ...item,
      ingredients: item.ingredients_json ? JSON.parse(`[${item.ingredients_json}]`) : [],
    }))

    console.log(`📋 Elementos del menú encontrados: ${processedMenuItems.length}`)

    // Translate if necessary
    let translatedMenuItems = processedMenuItems
    if (language !== "es") {
      console.log(`🌍 Traduciendo menú al idioma: ${language}`)
      translatedMenuItems = await aiTranslation.translateMenuItems(processedMenuItems, language)
    }

    // Group by categories
    const menuByCategory = {}
    translatedMenuItems.forEach((item) => {
      if (!menuByCategory[item.name]) {
        menuByCategory[item.name] = []
      }
      menuByCategory[item.name].push(item)
    })
    const response = {
      restaurant: {
        name: table.restaurant_name,
        id: table.restaurant_id,
      },
      table: {
        number: table.table_number,
        id: table.id,
      },
      categories: categories.map((cat) => cat.name),
      menu: menuByCategory,
      language: language,
    }

    console.log(`✅ Menú enviado exitosamente`)
    res.json(response)
  } catch (error) {
    console.error("❌ Error obteniendo menú público:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
})

// Get restaurant menu (authenticated)
router.get("/", authenticateToken, async (req, res) => {
  try {
    const restaurantId = req.restaurant.id;

    console.log(`🔐 Obteniendo menú de gestión para restaurante ${restaurantId}`);

    // Obtener categorías
    const [categories] = await db.execute(
      "SELECT * FROM menu_categories WHERE restaurant_id = ? ORDER BY id",
      [restaurantId],
    );

    // Obtener elementos del menú
    const [menuItems] = await db.execute(
      `
      SELECT 
        mi.*,
        mc.name as category_name,
        CASE WHEN mi.image_url IS NOT NULL THEN 1 ELSE 0 END as has_image
      FROM menu_items mi 
      LEFT JOIN menu_categories mc ON mi.category_id = mc.id
      WHERE mi.restaurant_id = ? 
      ORDER BY mi.category_id, mi.name
      `,
      [restaurantId],
    );

    // Obtener ingredientes e imágenes para cada elemento
    for (const item of menuItems) {
      // Ingredientes
      const [ingredients] = await db.execute(
        "SELECT * FROM menu_item_ingredients WHERE menu_item_id = ? ORDER BY id",
        [item.id],
      );
      item.ingredients = ingredients;

      // Imágenes
      const [images] = await db.execute(
        "SELECT id, filename, original_name, mime_type, file_data, file_size, created_at FROM menu_item_images WHERE menu_item_id = ? ORDER BY created_at",
        [item.id],
      );
      // Aquí asigna las imágenes a la propiedad 'images'
      item.images = images.map(img => ({
        ...img,
        file_data: img.file_data ? img.file_data.toString("base64") : null
      }));
    }
    res.json({
      categories,
      menuItems,
    });
  } catch (error) {
    console.error("❌ Error obteniendo menú de gestión:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});


// Create menu category with AI translation
router.post("/categories", authenticateToken, async (req, res) => {
  try {
    const restaurantId = req.restaurant.id
    const input = req.body

    // Detectar el idioma base
    const baseLang =  req.body.language_created || "es"

    if (!baseLang || !input[`name`]) {
      return res.status(400).json({ error: "Falta el nombre de la categoría en un idioma válido" })
    }

    const name = input[`name`]

    console.log(`🆕 Creando categoría en ${baseLang}: "${name}"`)
    const [id_lang] = await db.execute(
      "SELECT id FROM languages WHERE code = ?", 
      [baseLang]
    )

    // Insertar en la base de datos
    const sql =
      "INSERT INTO menu_categories (restaurant_id, name, language_created) VALUES (?, ?, ?)"

    await db.execute(sql, [
      restaurantId,
      name,
      id_lang[0].id,
    ])


    res.status(201).json({ message: "Categoría creada exitosamente", data: name })
  } catch (error) {
    console.error("❌ Error creando categoría con traducción:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
})


// Create menu item
router.post("/items", authenticateToken, upload.single("image"), async (req, res) => {
  try {
    console.log(req.body)
    const { category_id, name, description, price, is_available, language_created} = req.body
    const restaurantId = req.restaurant.id
    const imageFile = req.file;
    const ingredients = req.body.ingredients
    ? JSON.parse(req.body.ingredients)
    : [];
    console.log(`➕ Creando nuevo elemento del menú: ${name}`)

        const [id_lang] = await db.execute(
      "SELECT id FROM languages WHERE code = ?", 
      [language_created || "es"] // Usa el idioma proporcionado o "es" por defecto
    )
    // Insertar elemento del menú
    const [result] = await db.execute(
      "INSERT INTO menu_items (restaurant_id, category_id, name, description, price, language_created) VALUES (?, ?, ?, ?, ?, ?)",
      [restaurantId, category_id, name, description, price, id_lang[0].id],
    )

    const menuItemId = result.insertId

    // Insertar ingredientes si se proporcionaron
    if (ingredients.length > 0) {
      // ingredientValues: array de arrays [[menuItemId, ing1.name, ing1.is_allergen, ing1.is_removable], [...], ...]
      const ingredientValues = ingredients.map((ing) => [
        menuItemId,
        ing.name,
        ing.is_allergen || false,
        ing.is_removable !== false,
        id_lang[0].id, // Usar el mismo idioma que el del elemento del menú
      ])

      // Crea tantos placeholders "(?, ?, ?, ?, ?)" separados por coma como ingredientes
      const placeholders = ingredientValues.map(() => "(?, ?, ?, ?, ?)").join(", ")

      // Aplana el array para que queden todos los valores en una sola lista
      const flattenedValues = ingredientValues.flat()

      // Construye la consulta completa
      const sql = `INSERT INTO menu_item_ingredients (menu_item_id, ingredient_name, is_allergen, is_removable, language_created) VALUES ${placeholders}`

      // Ejecuta la consulta con los valores planos
      await db.execute(sql, flattenedValues)
}
 if (imageFile) {
        // Insertar la nueva imagen con metadatos y file_data
        const filename = imageFile.originalname; // o genera un nombre único aquí si quieres
        const original_name = imageFile.originalname;
        const mime_type = imageFile.mimetype;
        const file_size = imageFile.size;
        const file_data = imageFile.buffer; // Buffer con datos binarios

        const sqlImg = `
          INSERT INTO menu_item_images 
          (menu_item_id, filename, original_name, mime_type, file_size, file_data, created_at)
          VALUES (?, ?, ?, ?, ?, ?, NOW())
        `;

        await db.execute(sqlImg, [
          menuItemId,
          filename,
          original_name,
          mime_type,
          file_size,
          file_data,
        ]);
      }

    console.log(`✅ Elemento del menú creado con ID: ${menuItemId}`)

    res.status(201).json({
      id: menuItemId,
      message: "Elemento del menú creado exitosamente",
    })
  } catch (error) {
    console.error("❌ Error creando elemento del menú:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
})


router.put(
  "/items/:id",
  authenticateToken,
  upload.single("image"), // Espera el campo 'image' con el archivo
  async (req, res) => {
    try {
      const { id } = req.params;
      const {
        name,
        description,
        price,
        category_id,
        is_available,
        language_created,
      } = req.body;
      const restaurantId = req.restaurant.id;
      const imageFile = req.file; // Obtiene el archivo subido
      console.log(req.params);
      console.log(`✏️ Actualizando elemento del menú: ${id}`);

      // Verificar que el elemento pertenece al restaurante
      const [existing] = await db.execute(
        "SELECT id FROM menu_items WHERE id = ? AND restaurant_id = ?",
        [id, restaurantId]
      );

      if (existing.length === 0) {
        return res.status(404).json({ error: "Elemento del menú no encontrado" });
      }

      // Actualizar elemento del menú
      await db.execute(
        "UPDATE menu_items SET name = ?, description = ?, price = ?, category_id = ?, is_available = ?, language_created = ? WHERE id = ?",
        [name, description, price, category_id, is_available, language_created, id]
      );

      // Actualizar ingredientes: elimina y re-inserta
      await db.execute("DELETE FROM menu_item_ingredients WHERE menu_item_id = ?", [
        id,
      ]);

      if (ingredients.length > 0) {
        const ingredientValues = ingredients.map((ing) => [
          id,
          ing.name,
          ing.is_allergen || false,
          ing.is_removable !== false,
        ]);
        const placeholdersIng = ingredientValues.map(() => "(?, ?, ?, ?)").join(", ");
        const valuesIng = ingredientValues.flat();
        const sqlIng = `INSERT INTO menu_item_ingredients (menu_item_id, name, is_allergen, is_removable) VALUES ${placeholdersIng}`;
        await db.execute(sqlIng, valuesIng);
      }

      // Actualizar imagen:
      // Si hay archivo nuevo, elimina la imagen anterior y guarda la nueva en BD
      if (imageFile) {
        await db.execute("DELETE FROM menu_item_images WHERE menu_item_id = ?", [id]);
        // Insertar la nueva imagen con metadatos y file_data
        const filename = imageFile.originalname; // o genera un nombre único aquí si quieres
        const original_name = imageFile.originalname;
        const mime_type = imageFile.mimetype;
        const file_size = imageFile.size;
        const file_data = imageFile.buffer; // Buffer con datos binarios

        const sqlImg = `
          INSERT INTO menu_item_images 
          (menu_item_id, filename, original_name, mime_type, file_size, file_data, created_at)
          VALUES (?, ?, ?, ?, ?, ?, NOW())
        `;

        await db.execute(sqlImg, [
          id,
          filename,
          original_name,
          mime_type,
          file_size,
          file_data,
        ]);
      }

      console.log(`✅ Elemento del menú actualizado: ${id}`);

      res.json({ message: "Elemento del menú actualizado exitosamente" });
    } catch (error) {
      console.error("❌ Error actualizando elemento del menú:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }
);


// Delete menu item
router.delete("/items/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const restaurantId = req.restaurant.id

    console.log(`🗑️ Eliminando elemento del menú: ${id}`)

    // Verificar que el elemento pertenece al restaurante
    const [existing] = await db.execute("SELECT id FROM menu_items WHERE id = ? AND restaurant_id = ?", [
      id,
      restaurantId,
    ])

    if (existing.length === 0) {
      return res.status(404).json({ error: "Elemento del menú no encontrado" })
    }

    // Eliminar elemento (los ingredientes se eliminan por CASCADE)
    await db.execute("DELETE FROM menu_items WHERE id = ?", [id])

    console.log(`✅ Elemento del menú eliminado: ${id}`)

    res.json({ message: "Elemento del menú eliminado exitosamente" })
  } catch (error) {
    console.error("❌ Error eliminando elemento del menú:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
})

router.delete("/categories/:id", authenticateToken, async (req, res) => {
  try {
    const categoryId = req.params.id;
    const restaurantId = req.restaurant.id; // obtenemos el id del restaurante del token

    // Verificar que la categoría pertenece al restaurante
    const [rows] = await db.execute(
      "SELECT id FROM menu_categories WHERE id = ? AND restaurant_id = ?",
      [categoryId, restaurantId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Categoría no encontrada o no pertenece a tu restaurante" });
    }

    // Eliminar la categoría
    await db.execute("DELETE FROM menu_categories WHERE id = ?", [categoryId]);

    // Opcional: si tienes restricciones cascada, los elementos relacionados se eliminarán
    // Sino, considera eliminar los elementos del menú asociados explícitamente si así lo deseas

    res.json({ message: "Categoría eliminada correctamente" });
  } catch (error) {
    console.error("Error eliminando categoría:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});


module.exports = router
