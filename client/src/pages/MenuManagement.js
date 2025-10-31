"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import axios from "axios"
import toast from "react-hot-toast"
import { Plus, Edit, Trash2, Save, X } from "lucide-react"

const MenuManagement = () => {
  const { i18n, t } = useTranslation()
  const [menu, setMenu] = useState({ categories: [], menuItems: [] })
  const [loading, setLoading] = useState(true)
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [showAddItem, setShowAddItem] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const currentLang = i18n.language || "es"

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    language_created: currentLang
  })

  const [itemForm, setItemForm] = useState({
    category_id: "",
    name: "",
    description: "",
    price: "",
    imageFile: null,
    is_available: true,
    language_created: currentLang,
  })

  useEffect(() => {
    fetchMenu()
  }, [])

  // Bloquea scroll fondo al abrir modales
  useEffect(() => {
    if (showAddCategory || showAddItem) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }
  }, [showAddCategory, showAddItem])

  const fetchMenu = async () => {
    try {
      const response = await axios.get("/api/menu")
      setMenu(response.data)
    } catch (error) {
      console.error("Error fetching menu:", error)
      toast.error("Error al cargar el menú")
    } finally {
      setLoading(false)
    }
  }

  // Funciones para borrar y editar (a implementar llamadas reales a backend)
  const eliminarCategoria = async (categoryId) => {
    if (window.confirm('¿Seguro que quieres eliminar la categoría?')) {
      try {
        await axios.delete(`/api/menu/categories/${categoryId}`)
        toast.success(t("menu.categoryDeleted"))
        fetchMenu()
      } catch (error) {
        console.error(error)
        toast.error("Error al eliminar la categoría")
      }
    }
  }

  const editarItem = (item) => {
    setItemForm({
      category_id: item.category_id,
      name: item.name || "",
      description: item.description || "",
      price: item.price,
      imageFile: item.imageFile || null,
      is_available: item.is_available,
      language_created: currentLang
    })
    setEditingItem(item)
    setShowAddItem(true)
  }

  const eliminarItem = async (itemId) => {
    if (window.confirm('¿Seguro que quieres eliminar este elemento?')) {
      try {
        await axios.delete(`/api/menu/items/${itemId}`)
        toast.success(t("menu.itemDeleted"))
        fetchMenu()
      } catch (error) {
        console.error(error)
        toast.error("Error al eliminar el elemento")
      }
    }
  }

  // Formularios submit handlers
  const handleCategorySubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post("/api/menu/categories", categoryForm)
      toast.success(t("menu.categoryAdded"))
      setCategoryForm({
        name: ""
      })
      setShowAddCategory(false)
      fetchMenu()
    } catch (error) {
      console.error("Error creating category:", error)
      toast.error("Error al crear la categoría")
    }
  }

  const handleItemSubmit = async (e) => {
  e.preventDefault();

  try {
    const formData = new FormData();

    // Campos de texto y números
    formData.append("category_id", itemForm.category_id);
    formData.append("name", itemForm.name);
    formData.append("description", itemForm.description);
    formData.append("price", itemForm.price);
    formData.append("is_available", itemForm.is_available);
    formData.append("language_created", currentLang);

    // Archivo
    if (itemForm.imageFile) {
      formData.append("image", itemForm.imageFile);
    }

    // Ingredientes (si los manejas)
    if(itemForm.ingredients) {
      formData.append("ingredients", JSON.stringify(itemForm.ingredients));
    }

    let url = "/api/menu/items";
    let config = {

    };

    if (editingItem) {
      url = `/api/menu/items/${editingItem.id}`;
      await axios.put(url, formData, config);
      toast.success(t("menu.itemUpdated"));
      setEditingItem(null);
    } else {
      await axios.post(url, formData, config);
      toast.success(t("menu.itemAdded"));
    }

    setShowAddItem(false);
    fetchMenu();

    // Resetea el formulario después
    setItemForm({
      category_id: "",
      name: "",
      description: "",
      price: "",
      imageFile: null,
      is_available: true,
      ingredients: [],
      language_created: currentLang,
    });

  } catch (error) {
    console.error("Error saving item:", error);
    toast.error("Error al guardar el elemento");
  }
};


  const cancelEdit = () => {
    setEditingItem(null)
    setShowAddItem(false)
    setItemForm({
      category_id: "",
      name: "",
      description: "",
      price: "",
      imageFile: null,
      is_available: true,
      language_created: currentLang
    })
  }

  if (loading) {
    return (
      <div className="loading-wrapper" style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div className="loading">Cargando...</div>
      </div>
    )
  }

  return (
    <>
      {/* Contenido principal, se desenfoca cuando modal abierto */}
      <div className={`main-content ${showAddItem || showAddCategory ? "blurred" : ""}`}>

        <div className="container">
          {/* Header */}
          <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
            <div>
              <h1>{t("menu.management")}</h1>
              <p style={{ color: '#666' }}>Gestiona las categorías y elementos de tu menú</p>
            </div>
            <div>
              <button
                className="btn btn-secondary"
                onClick={() => setShowAddCategory(true)}
                type="button"
              >
                <Plus size={16} style={{ marginRight: 6 }} />
                {t("menu.addCategory")}
              </button>
            </div>
          </div>

          {/* Listado de Categorías e ítems */}
          {menu.categories.map(category => {
            const platos = menu.menuItems.filter(item => item.category_id === category.id) || []
            return (
              <section key={category.id} style={{ marginBottom: 48 }}>
                <div className="categoria-header">
                  <h2 className="categoria-nombre">{category.name}</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span className="categoria-badge">{platos.length} {t("menu.dishes")}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setItemForm({
                          category_id: category.id,
                          name: "",
                          description: "",
                          price: "",
                          imageFile: null,
                          is_available: true,
                          language_created: currentLang
                        });
                        setEditingItem(null)
                        setShowAddItem(true)
                      }}
                      className="btn btn-primary"
                    >
                      <Plus size={16} style={{ marginRight: 4 }} />
                      {t("menu.addItem")}
                    </button>
                    <button
                      className="btn-eliminar-categoria"
                      type="button"
                      onClick={() => eliminarCategoria(category.id)}
                    >
                      {t("menu.deleteCategory")}
                    </button>
                  </div>
                </div>

                <div className="grid-platos">
                  {platos.length > 0 ? platos.map(item => (
                    <div key={item.id} className="plato-card">
                {item.images?.[0]?.file_data ? (
                  <img
                    src={`data:${item.images[0].mime_type};base64,${item.images[0].file_data}`}
                    alt={item.name}
                    className="plato-imagen"
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '176px',
                    backgroundColor: '#f3f4f6',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: '#9ca3af'
                  }}>
                    Sin imagen
                  </div>
                )}


                      <div className="plato-info">
                        <h3 className="plato-nombre">{ item.name}</h3>
                        <p className="plato-descripcion">{ item.description}</p>
                        <span className="plato-precio">€{Number(item.price).toFixed(2)}</span>

                        <div>
                          <strong style={{ fontSize: 12 }}>Ingredientes:</strong>
                          <div style={{ marginTop: 4, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {item.ingredients?.length ? item.ingredients.map(ing => (
                              <span
                                key={ing.id}
                                className={ing.is_allergen ? "badge badge-allergen" : "badge badge-ingredient"}
                              >
                                {ing.ingredient_name}
                              </span>
                            )) : <span style={{ color: '#9ca3af', fontSize: 12 }}>Sin ingredientes</span>}
                          </div>
                        </div>

                        {item.ingredients?.some(ing => ing.is_allergen) && (
                          <div style={{ marginTop: 12 }}>
                            <span className="badge badge-allergen" style={{ fontWeight: 'bold' }}>
                              {t("menu.allergens")}:&nbsp;
                              {item.ingredients.filter(ing => ing.is_allergen).map(ing => ing.ingredient_name).join(", ")}
                            </span>
                          </div>
                        )}

                        <div style={{ marginTop: 16, display: 'flex', gap: 16 }}>
                          <button onClick={() => editarItem(item)} className="boton-accion" type="button">{t("common.edit")}</button>
                          <button onClick={() => eliminarItem(item.id)} className="boton-accion" type="button" style={{ color: 'red' }}>{t("common.delete")}</button>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <p style={{ color: '#9ca3af', textAlign: 'center', marginTop: 12 }}>
                      {t("menu.noItemsInCategory")}
                    </p>
                  )}
                </div>
              </section>
            )
          })}
        </div>
      </div>

      {/* MODAL AGREGAR / EDITAR CATEGORIA */}
      {showAddCategory && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-content">
            <button onClick={() => setShowAddCategory(false)} className="modal-close-button" aria-label="Cerrar modal">
              <X size={20} />
            </button>

            <h2>{t("menu.addCategory")}</h2>
            <form onSubmit={handleCategorySubmit} className="form">

              {['es', 'en', 'fr', 'de'].map(lang =>
                (currentLang === lang) ? (
                  <div className="form-group" key={lang}>
                    <label className="form-label">{lang === 'es' ? 'Nombre (Español) *' : `Nombre (${lang.toUpperCase()})`}</label>
                    <input
                      required={lang === 'es'}
                      type="text"
                      className="form-input"
                      value={categoryForm[`name_${lang}`]}
                      onChange={(e) => setCategoryForm({ ...categoryForm, [`name`]: e.target.value })}
                    />
                  </div>
                ) : null
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button type="button" onClick={() => setShowAddCategory(false)} className="btn btn-secondary">{t("common.cancel")}</button>
                <button type="submit" className="btn btn-primary"><Save size={16} /> {t("common.save")}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL AGREGAR / EDITAR ITEM */}
        {showAddItem && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-content">
            <button onClick={cancelEdit} className="modal-close-button" aria-label="Cerrar modal">
              <X size={20} />
            </button>

            <h2>{editingItem ? t("menu.editItem") : t("menu.addItem")}</h2>

            <form onSubmit={handleItemSubmit} className="form">
              <div className="form-group">
                <label>{t("menu.category")} *</label>
                <select
                  className="form-input"
                  value={itemForm.category_id}
                  disabled
                  required
                  onChange={(e) => setItemForm({ ...itemForm, category_id: e.target.value })}
                >
                  <option value="">{t("menu.selectCategory")}</option>
                  {menu.categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

                  <div className="form-group" key={`name`}>
                    <label>Nombre *</label>
                    <input
                      required={true}
                      type="text"
                      className="form-input"
                      value={itemForm[`name`]}
                      onChange={(e) => setItemForm({ ...itemForm, [`name`]: e.target.value })}
                    />
                  </div>

                  <div className="form-group" key={`desc`}>
                    <label>Descripción</label>
                    <textarea
                      className="form-textarea"
                      value={itemForm[`description`]}
                      onChange={(e) => setItemForm({ ...itemForm, [`description`]: e.target.value })}
                    />
                  </div>

              <div className="form-group">
                <label>{t("menu.price")} (€) *</label>
                <input
                  required
                  type="number"
                  step="0.01"
                  className="form-input"
                  value={itemForm.price}
                  onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Imagen</label>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  className="form-input"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    setItemForm({ ...itemForm, imageFile: file })
                    
                  }}
                />
              </div>

              <div className="form-group">
                <label>Estado</label>
                <select
                  className="form-input"
                  value={itemForm.is_available}
                  onChange={(e) => setItemForm({ ...itemForm, is_available: e.target.value === 'true' })}
                >
                  <option value="true">{t("menu.available")}</option>
                  <option value="false">{t("menu.unavailable")}</option>
                </select>
              </div>
<div className="form-group">
  <label>Ingredientes</label>

  {itemForm.ingredients?.map((ing, index) => (
    <div key={ing} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
      <input
        type="text"
        placeholder="Nombre del ingrediente"
        value={ing.name}
        required
        onChange={e => {
          const newIngredients = [...itemForm.ingredients]
          newIngredients[index].name = e.target.value
          setItemForm({ ...itemForm, ingredients: newIngredients })
        }}
      />
      <label style={{ display: 'flex', alignItems: 'center' }}>
        <input
          type="checkbox"
          checked={ing.is_allergen || false}
          onChange={e => {
            const newIngredients = [...itemForm.ingredients]
            newIngredients[index].is_allergen = e.target.checked
            setItemForm({ ...itemForm, ingredients: newIngredients })
          }}
        />
        &nbsp;Alérgeno
      </label>
      <label style={{ display: 'flex', alignItems: 'center' }}>
        <input
          type="checkbox"
          checked={ing.is_removable !== false}
          onChange={e => {
            const newIngredients = [...itemForm.ingredients]
            newIngredients[index].is_removable = e.target.checked
            setItemForm({ ...itemForm, ingredients: newIngredients })
          }}
        />
        &nbsp;Removible
      </label>
      <button
        type="button"
        onClick={() => {
          const newIngredients = itemForm.ingredients.filter((_, i) => i !== index)
          setItemForm({ ...itemForm, ingredients: newIngredients })
        }}
        style={{ color: 'red' }}
      >
        X
      </button>
    </div>
  ))}

  <button
    type="button"
    onClick={() => {
      const newIngredients = itemForm.ingredients ? [...itemForm.ingredients] : []
      newIngredients.push({ name: "", is_allergen: false, is_removable: true })
      setItemForm({ ...itemForm, ingredients: newIngredients })
    }}
  >
    Añadir Ingrediente
  </button>
</div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button type="button" onClick={cancelEdit} className="btn btn-secondary">{t("common.cancel")}</button>
                <button type="submit" className="btn btn-primary"><Save size={16} /> {t("common.save")}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default MenuManagement
