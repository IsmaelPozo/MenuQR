/* CustomerMenu.jsx */
import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

// Debes importar './style.css' globalmente en tu proyecto.

const CustomerMenu = () => {
  const { qrCode } = useParams();
  const [searchParams] = useSearchParams();
  const { t, i18n } = useTranslation();
const [cartClosing, setCartClosing] = useState(false);

  const [menuData, setMenuData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showCustomization, setShowCustomization] = useState(false);
  const [customizations, setCustomizations] = useState({});
  const [showCart, setShowCart] = useState(false);
const [payPercentage, setPayPercentage] = useState(100); // 100% por defecto


  const currentLanguage = i18n.language || "es";
  const tableNumber = searchParams.get("table") || "1";

  useEffect(() => {
    fetchMenu();
    // eslint-disable-next-line
  }, [qrCode, currentLanguage]);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/menu/categorias`);
      if (!response.ok) throw new Error("Error al cargar el menú");
      const data = await response.json();
      console.log("Menú cargado:", data);
      setMenuData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromCart = (id, customizations = {}) => {
  setCart(prev => prev.filter(
    item => !(item.id === id && JSON.stringify(item.customizations) === JSON.stringify(customizations))
  ));
};

const closeCart = () => {
  setCartClosing(true);
  setTimeout(() => {
    setShowCart(false);
    setCartClosing(false);
  }, 300); // 300ms = duración de la animación
};


const handleChangeQuantity = (item, delta) => {
  setCart(prevCart =>
    prevCart.map(ci => {
      if (ci.id === item.id && JSON.stringify(ci.customizations) === JSON.stringify(item.customizations)) {
        let nextQty = ci.quantity + delta;
        if (nextQty <= 0) {
          // Borra si la cantidad llega a 0
          return null;
        }
        return { ...ci, quantity: nextQty };
      }
      return ci;
    }).filter(Boolean)
  );
};

// Total parcial según porcentaje
const getPartialTotal = () => (getCartTotal() * payPercentage) / 100;

  const handlePersonalize = (item) => {
    console.log("Personalizando item:", item);
    setSelectedItem(item);
    setCustomizations({});
    setShowCustomization(true);
  };

  const handleAddToCart = (item, customizations = {}) => {
    const cartItem = {
      id: item.id,
      name: item.name,
      price: item.price,
      customizations,
      quantity: 1,
    };
    setCart(prev => {
      const existingIndex = prev.findIndex(
        cartItem =>
          cartItem.id === item.id &&
          JSON.stringify(cartItem.customizations) === JSON.stringify(customizations)
      );
      if (existingIndex >= 0) {
        const newCart = [...prev];
        newCart[existingIndex].quantity += 1;
        return newCart;
      }
      return [...prev, cartItem];
    });
    setShowCustomization(false);
    setSelectedItem(null);
  };

  const btnStyle = (type) => ({
  background: type === "+" ? "var(--color-primary-light)" : "var(--color-secondary)",
  color: type === "+" ? "var(--color-primary)" : "#fff",
  border: "none",
  fontWeight: 600,
  fontSize: 20,
  width: 30,
  height: 30,
  borderRadius: 6,
  cursor: "pointer"
});


  const toggleIngredient = (ingredientName) => {
    setCustomizations(prev => ({
      ...prev,
      [ingredientName]: !prev[ingredientName],
    }));
  };

  const getCartTotal = () => cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const getCartItemCount = () => cart.reduce((total, item) => total + item.quantity, 0);

  if (loading) {
    return (
      <div className="container" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="text-center">
          <div className="loading" style={{ width: 48, height: 48, margin: "0 auto 16px auto" }}></div>
          <p className="text-secondary">Cargando menú...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="text-center">
          <p style={{ color: "var(--color-error)", marginBottom: 16 }}>Error: {error}</p>
          <button onClick={fetchMenu} className="btn btn--primary">Reintentar</button>
        </div>
      </div>
    );
  }

  if (!menuData) {
    return (
      <div className="container" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p className="text-secondary">No se pudo cargar el menú</p>
      </div>
    );
  }

  return (
    <div id="client-section" className="container" style={{marginBlock: 24}}>
      {/* Header */}
      <header style={{marginBottom: 24}}>
        <div className="flex justify-between items-center" style={{gap: 24}}>
          <div className="flex items-center" style={{gap: 16}}>
            {menuData.restaurant.logo && (
              <img src={menuData.restaurant.logo} alt="Logo" style={{width: 48, height: 48, borderRadius: 12}} />
            )}
            <div>
              <h1 style={{color: "var(--color-primary)", fontWeight: "700", fontSize: "1.5rem"}}>{menuData.restaurant.name}</h1>
              <div className="text-secondary" style={{fontSize: 14}}>Mesa {tableNumber}</div>
            </div>
          </div>
          <div className="flex items-center" style={{gap: 12}}>
            <select
              value={currentLanguage}
              onChange={e => i18n.changeLanguage(e.target.value)}
              className="form-control"
              style={{fontSize: 14, minWidth: 50}}
            >
              <option value="es">🇪🇸 ES</option>
              <option value="en">🇺🇸 EN</option>
              <option value="fr">🇫🇷 FR</option>
              <option value="de">🇩🇪 DE</option>
            </select>
            <button className="btn btn--primary" style={{display: "flex", alignItems: "center"}} onClick={() => setShowCart(true)}>
              <span style={{marginRight: 4}}>🛒</span>
              {getCartItemCount() > 0 &&
                <span className="badge badge-primary">{getCartItemCount()}</span>
              }
            </button>
          </div>
        </div>
      </header>

      {/* Menú */}
      {Object.entries(menuData.menu).map(([categoryName, items]) => (
        <section className="menu-category" key={categoryName}>
          <h3>{categoryName}</h3>
          <div className="menu-items-grid">
            {items.map(item => (
              <div className="menu-item-card" key={item.id}>
                <div className="menu-item-image">
                  {item.image
                    ? <img src={item.image} alt={item.name} />
                    : <div className="placeholder-text">Sin imagen</div>
                  }
                </div>
                <div className="menu-item-info">
                  <div className="menu-item-name">{item.name}</div>
                  <div className="menu-item-desc">{item.description}</div>
                  <div className="menu-item-price">{Number(item.price).toFixed(2)} €</div>
                  {/* Ingredientes */}
                  {item.ingredients?.length > 0 && (
                    <div className="ingredients-preview">
                      <strong>Ingredientes:</strong> {item.ingredients.map(ing => typeof ing === "string" ? ing : ing.ingredient_name).join(", ")}
                    </div>
                  )}
                  {/* Alérgenos */}
                  {item.allergens?.length > 0 && (
                    <div className="allergens-preview">
                      <strong>Alérgenos: </strong>
                      {item.allergens.map((allergen, idx) => (
                        <span className="allergen-tag" key={idx}>{allergen}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="menu-item-actions">
                  <button className="customize-btn" onClick={() => handlePersonalize(item)}>
                    🛠 Personalizar
                  </button>
                  <button className="add-to-cart-btn" onClick={() => handleAddToCart(item)}>
                    🛒 Agregar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      {/* MODAL PERSONALIZACION */}
      {showCustomization && selectedItem && (
        <div className="modal">
          <div className="modal-overlay" onClick={() => setShowCustomization(false)} />
          <div className="modal-content">
            <div className="modal-header">
              <h3>Personalizar {selectedItem.name}</h3>
              <button className="modal-close" onClick={() => setShowCustomization(false)} aria-label="Cerrar">&times;</button>
            </div>
            <div className="modal-body">
              <div className="ingredients-section">
                <div className="ingredients-list">
                  {selectedItem.ingredients?.map((ingredient) => (
                    <div
                    
                      key={typeof ingredient === "string" ? ingredient : ingredient.ingredient_name}
                      className={
                        "ingredient-item" +
                        (customizations[typeof ingredient === "string" ? ingredient : ingredient.ingredient_name] ? " excluded" : "")
                      }
                    >
                      <input
                        className="ingredient-checkbox"
                        type="checkbox"
                        checked={!customizations[typeof ingredient === "string" ? ingredient : ingredient.ingredient_name]}
                        onChange={() => toggleIngredient(typeof ingredient === "string" ? ingredient : ingredient.ingredient_name)}
                      />
                      <span className="ingredient-name">{typeof ingredient === "string" ? ingredient : ingredient.ingredient_name}</span>
                      {(typeof ingredient !== "string" && ingredient.isAllergen) && (
                        <span className="allergen-tag">Alérgeno</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              {/* Alérgenos */}
              {selectedItem.allergens?.length > 0 && (
                <div className="allergens-section">
                  <div className="allergens-info">
                    <strong>Alérgenos:</strong>
                    {selectedItem.allergens.map((allergen, idx) => (
                      <span className="allergen-tag" key={idx}>{allergen}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                className="btn btn--primary btn--full-width"
                onClick={() => handleAddToCart(selectedItem, customizations)}
              >
                Agregar al carrito - €{Number(selectedItem.price).toFixed(2)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CART SUMMARY */}
      {cart.length > 0 && (
        <div id="cart" className={`cart-drawer${cartClosing ? " closing" : ""}`} style={{position: "fixed", left: 0, right: 0, bottom: 0, margin: 0, borderRadius: "var(--radius-lg) var(--radius-lg) 0 0", borderBottom: "none", zIndex: 100}}>
          <div className="card__body">
            <div className="flex justify-between items-center">
              <span className="font-bold">Total: €{Number(getCartTotal()).toFixed(2)}</span>
              <button className="btn btn--primary" onClick={() => setShowCart(true)}>
                Ver carrito ({getCartItemCount()})
              </button>
            </div>
          </div>
        </div>
      )}
      {showCart && (
  <div
    className={`cart-drawer${cartClosing ? " closing" : ""}`}
    style={{
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      background: "#fff",
      boxShadow: "0 -2px 8px rgba(0,0,0,0.1)",
      maxHeight: "60vh",
      overflowY: "auto",
      zIndex: 9999,
      borderTopLeftRadius: "16px",
      borderTopRightRadius: "16px",
      padding: "16px",
    }}
  >
    <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
      <h3 style={{margin: 0}}>Tu pedido</h3>
      <button onClick={closeCart} style={{fontSize: 24, background: "none", border: "none"}}>&times;</button>
    </div>
    <div style={{marginTop: 16}}>
      {cart.length === 0 ? (
        <p className="text-secondary">El carrito está vacío.</p>
      ) : (
        <>
          <ul style={{listStyle: "none", margin: 0, padding: 0}}>
            {cart.map((item, idx) => (
              <li key={item.id + '_' + idx} style={{padding: "10px 0", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid #eee"}}>
                <span style={{flex: 1}}>
                  {item.name}
                  <span style={{display: "block", fontSize: 12, color: "#888"}}>{Number(item.price).toFixed(2)} €/u</span>
                </span>
                <button onClick={() => handleChangeQuantity(item, -1)} style={btnStyle("-")}>-</button>
                <span style={{width: 24, textAlign: "center"}}>{item.quantity}</span>
                <button onClick={() => handleChangeQuantity(item, 1)} style={btnStyle("+")}>+</button>
                <button onClick={() => handleRemoveFromCart(item.id, item.customizations)} style={{background: "none", border: "none", fontSize: 20, color: "var(--color-error)"}}>🗑</button>
              </li>
            ))}
          </ul>

          <div style={{marginTop: 20}}>
            <label htmlFor="payPercent" style={{fontSize: 14, fontWeight: 600, display: "block", marginBottom: 4}}>Pagar sólo una parte (%)</label>
            <input
              id="payPercent"
              type="range"
              min="1"
              max="100"
              value={payPercentage}
              onChange={e => setPayPercentage(Number(e.target.value))}
              style={{width: "100%"}}
            />
            <div style={{display: "flex", justifyContent: "space-between", fontSize: 13}}>
              <span>{payPercentage}%</span>
              <span>Parcial: €{getPartialTotal().toFixed(2)}</span>
            </div>
          </div>

          <div style={{marginTop: 24, display: "flex", flexDirection: "column", gap: 12}}>
            <button className="btn btn--primary btn--full-width" onClick={() => { setPayPercentage(100); /* lógica de pago */ }}>
              Pagar completo €{getCartTotal().toFixed(2)}
            </button>
            <button
              className="btn btn--success btn--full-width"
              disabled={payPercentage >= 100}
              onClick={() => { /* lógica de pago parcial */ }}
            >
              Pagar {payPercentage}% (€{getPartialTotal().toFixed(2)})
            </button>
          </div>
        </>
      )}
    </div>
  </div>
)}


    </div>
  );
};

export default CustomerMenu;
