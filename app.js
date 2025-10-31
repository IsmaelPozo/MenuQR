// Sistema de Menú QR - Aplicación Principal
class MenuQRApp {
  constructor() {
    this.data = {
      restaurante: {
        nombre: "Ristorante La Nonna",
        direccion: "Calle Mayor 123, Madrid",
        telefono: "+34 91 123 4567",
        logo: "/api/placeholder/150/150"
      },
      menu: {
        "Antipasti": [
          {
            id: "a1",
            nombre: "Bruschetta Classica",
            descripcion: "Pan tostado con tomate fresco, albahaca y aceite de oliva",
            precio: 8.50,
            imagen: "/api/placeholder/200/150"
          },
          {
            id: "a2", 
            nombre: "Antipasto Misto",
            descripcion: "Selección de embutidos, quesos y verduras marinadas",
            precio: 12.90,
            imagen: "/api/placeholder/200/150"
          },
          {
            id: "a3",
            nombre: "Mozzarella di Bufala",
            descripcion: "Mozzarella fresca con tomate y albahaca",
            precio: 10.50,
            imagen: "/api/placeholder/200/150"
          }
        ],
        "Primi Piatti": [
          {
            id: "p1",
            nombre: "Spaghetti Carbonara",
            descripcion: "Pasta con huevo, panceta, queso pecorino y pimienta negra",
            precio: 13.50,
            imagen: "/api/placeholder/200/150"
          },
          {
            id: "p2",
            nombre: "Risotto ai Funghi",
            descripcion: "Arroz cremoso con setas variadas y parmesano",
            precio: 15.90,
            imagen: "/api/placeholder/200/150"
          },
          {
            id: "p3",
            nombre: "Penne Arrabbiata",
            descripcion: "Pasta con salsa picante de tomate, ajo y guindilla",
            precio: 11.50,
            imagen: "/api/placeholder/200/150"
          },
          {
            id: "p4",
            nombre: "Lasagna della Nonna",
            descripcion: "Lasaña tradicional con carne, bechamel y mozzarella",
            precio: 14.90,
            imagen: "/api/placeholder/200/150"
          }
        ],
        "Secondi Piatti": [
          {
            id: "s1",
            nombre: "Pollo alla Parmigiana",
            descripcion: "Pechuga de pollo empanada con mozzarella y tomate",
            precio: 18.50,
            imagen: "/api/placeholder/200/150"
          },
          {
            id: "s2",
            nombre: "Branzino al Sale",
            descripcion: "Lubina al horno en costra de sal con hierbas",
            precio: 22.90,
            imagen: "/api/placeholder/200/150"
          },
          {
            id: "s3",
            nombre: "Bistecca alla Fiorentina",
            descripcion: "Chuletón a la parrilla con aceite de oliva y romero",
            precio: 28.50,
            imagen: "/api/placeholder/200/150"
          }
        ],
        "Dolci": [
          {
            id: "d1",
            nombre: "Tiramisu",
            descripcion: "Postre tradicional con café, mascarpone y cacao",
            precio: 6.50,
            imagen: "/api/placeholder/200/150"
          },
          {
            id: "d2",
            nombre: "Panna Cotta",
            descripcion: "Crema italiana con frutos rojos",
            precio: 5.90,
            imagen: "/api/placeholder/200/150"
          },
          {
            id: "d3",
            nombre: "Gelato Artesanal",
            descripcion: "Helado casero - vainilla, chocolate o fresa",
            precio: 4.50,
            imagen: "/api/placeholder/200/150"
          }
        ],
        "Bevande": [
          {
            id: "b1",
            nombre: "Agua Mineral",
            descripcion: "Agua con o sin gas",
            precio: 2.50,
            imagen: "/api/placeholder/200/150"
          },
          {
            id: "b2",
            nombre: "Vino de la Casa",
            descripcion: "Tinto o blanco - copa",
            precio: 4.50,
            imagen: "/api/placeholder/200/150"
          },
          {
            id: "b3",
            nombre: "Café Espresso",
            descripcion: "Café italiano tradicional",
            precio: 1.80,
            imagen: "/api/placeholder/200/150"
          },
          {
            id: "b4",
            nombre: "Limoncello",
            descripcion: "Licor de limón tradicional",
            precio: 4.50,
            imagen: "/api/placeholder/200/150"
          }
        ]
      },
      mesas: [
        {numero: 1, qr: "mesa-1-qr", estado: "libre"},
        {numero: 2, qr: "mesa-2-qr", estado: "ocupada"},
        {numero: 3, qr: "mesa-3-qr", estado: "libre"},
        {numero: 4, qr: "mesa-4-qr", estado: "libre"},
        {numero: 5, qr: "mesa-5-qr", estado: "ocupada"},
        {numero: 6, qr: "mesa-6-qr", estado: "libre"},
        {numero: 7, qr: "mesa-7-qr", estado: "libre"},
        {numero: 8, qr: "mesa-8-qr", estado: "ocupada"},
        {numero: 9, qr: "mesa-9-qr", estado: "libre"},
        {numero: 10, qr: "mesa-10-qr", estado: "libre"}
      ],
      pedidos: [
        {
          id: "ped-001",
          mesa: 2,
          cliente: "Cliente 1",
          items: [
            {id: "a1", nombre: "Bruschetta Classica", precio: 8.50, cantidad: 2},
            {id: "p1", nombre: "Spaghetti Carbonara", precio: 13.50, cantidad: 1}
          ],
          total: 30.50,
          estado: "en_preparacion",
          timestamp: "2024-01-15T14:30:00"
        },
        {
          id: "ped-002", 
          mesa: 5,
          cliente: "Cliente 2",
          items: [
            {id: "p2", nombre: "Risotto ai Funghi", precio: 15.90, cantidad: 1},
            {id: "b2", nombre: "Vino de la Casa", precio: 4.50, cantidad: 1}
          ],
          total: 20.40,
          estado: "recibido",
          timestamp: "2024-01-15T14:45:00"
        }
      ]
    };

    this.currentSection = 'admin';
    this.currentTable = null;
    this.cart = [];
    this.qrCodes = new Map();

    this.init();
  }

  init() {
    this.setupNavigation();
    this.setupForms();
    this.setupClientView();
    this.loadInitialData();
    this.checkForTableParam();
    this.showSection('admin');
  }

  checkForTableParam() {
    // Verificar si viene de QR (simulación)
    const urlParams = new URLSearchParams(window.location.search);
    const mesaParam = urlParams.get('mesa');
    if (mesaParam) {
      this.currentTable = parseInt(mesaParam);
      this.showSection('client');
    }
  }

  setupNavigation() {
    // Navegación principal - usar event delegation
    const nav = document.getElementById('main-nav');
    if (nav) {
      nav.addEventListener('click', (e) => {
        if (e.target.hasAttribute('data-nav')) {
          e.preventDefault();
          e.stopPropagation();
          const section = e.target.getAttribute('data-nav');
          console.log('Navigating to:', section); // Debug log
          this.showSection(section);
        }
      });
    }

    // También agregar un botón para simular vista de cliente
    const header = document.querySelector('header nav');
    if (header) {
      const clientBtn = document.createElement('button');
      clientBtn.className = 'btn btn--secondary';
      clientBtn.setAttribute('data-nav', 'client');
      clientBtn.textContent = 'Vista Cliente';
      header.appendChild(clientBtn);
    }
  }

  showSection(sectionName) {
    console.log('Showing section:', sectionName); // Debug log
    
    // Ocultar todas las secciones
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
      section.classList.remove('active');
    });

    // Mostrar sección seleccionada
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
      targetSection.classList.add('active');
    } else {
      console.error('Section not found:', `${sectionName}-section`);
      return;
    }

    // Actualizar navegación
    const navButtons = document.querySelectorAll('[data-nav]');
    navButtons.forEach(btn => {
      btn.classList.remove('active');
    });
    
    const activeButton = document.querySelector(`[data-nav="${sectionName}"]`);
    if (activeButton) {
      activeButton.classList.add('active');
    }

    this.currentSection = sectionName;

    // Actualizar contenido según la sección
    if (sectionName === 'admin') {
      this.renderAdminSection();
    } else if (sectionName === 'kitchen') {
      this.renderKitchenSection();
    } else if (sectionName === 'client') {
      this.renderClientSection();
    }
  }

  setupForms() {
    // Formulario de información del restaurante
    const restoForm = document.getElementById('resto-form');
    if (restoForm) {
      restoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveRestaurantInfo();
      });
    }

    // Formulario de mesas
    const mesasForm = document.getElementById('mesas-form');
    if (mesasForm) {
      mesasForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.updateTables();
      });
    }

    // Formulario para agregar elementos al menú
    const addItemForm = document.getElementById('add-item-form');
    if (addItemForm) {
      addItemForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.addMenuItem();
      });
    }

    // Toggle para mostrar/ocultar formulario de agregar elemento
    const toggleBtn = document.getElementById('btn-toggle-add-item');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const container = document.getElementById('add-item-container');
        if (container) {
          container.classList.toggle('hidden');
        }
      });
    }
  }

  setupClientView() {
    // Botones del carrito
    const confirmBtn = document.getElementById('btn-confirm-order');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => {
        this.confirmOrder();
      });
    }

    const payBtn = document.getElementById('btn-pay-order');
    if (payBtn) {
      payBtn.addEventListener('click', () => {
        this.payOrder('individual');
      });
    }

    const payTableBtn = document.getElementById('btn-pay-table');
    if (payTableBtn) {
      payTableBtn.addEventListener('click', () => {
        this.payOrder('mesa');
      });
    }
  }

  loadInitialData() {
    // Cargar datos del restaurante
    const elements = {
      'resto-nombre': this.data.restaurante.nombre,
      'resto-dir': this.data.restaurante.direccion,
      'resto-tel': this.data.restaurante.telefono,
      'resto-logo': this.data.restaurante.logo,
      'num-mesas': this.data.mesas.length
    };

    Object.entries(elements).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) {
        element.value = value;
      }
    });

    // Llenar datalist de categorías
    const datalist = document.getElementById('categoria-list');
    if (datalist) {
      Object.keys(this.data.menu).forEach(categoria => {
        const option = document.createElement('option');
        option.value = categoria;
        datalist.appendChild(option);
      });
    }
  }

  saveRestaurantInfo() {
    const nombre = document.getElementById('resto-nombre')?.value;
    const direccion = document.getElementById('resto-dir')?.value;
    const telefono = document.getElementById('resto-tel')?.value;
    const logo = document.getElementById('resto-logo')?.value;

    if (nombre) this.data.restaurante.nombre = nombre;
    if (direccion) this.data.restaurante.direccion = direccion;
    if (telefono) this.data.restaurante.telefono = telefono;
    if (logo) this.data.restaurante.logo = logo;
    
    alert('Información del restaurante guardada correctamente');
    this.renderAdminSection();
  }

  updateTables() {
    const numMesasEl = document.getElementById('num-mesas');
    if (!numMesasEl) return;
    
    const numMesas = parseInt(numMesasEl.value);
    this.data.mesas = [];
    
    for (let i = 1; i <= numMesas; i++) {
      this.data.mesas.push({
        numero: i,
        qr: `mesa-${i}-qr`,
        estado: 'libre'
      });
    }
    
    alert(`Configuradas ${numMesas} mesas correctamente`);
    this.renderTableQRs();
  }

  addMenuItem() {
    const categoria = document.getElementById('item-cat')?.value;
    const nombre = document.getElementById('item-nombre')?.value;
    const descripcion = document.getElementById('item-desc')?.value;
    const precio = parseFloat(document.getElementById('item-precio')?.value);
    const imagen = document.getElementById('item-img')?.value || '/api/placeholder/200/150';

    if (!categoria || !nombre || !descripcion || isNaN(precio)) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    const newId = 'item-' + Date.now();
    const newItem = {
      id: newId,
      nombre,
      descripcion,
      precio,
      imagen
    };

    if (!this.data.menu[categoria]) {
      this.data.menu[categoria] = [];
    }
    
    this.data.menu[categoria].push(newItem);
    
    // Limpiar formulario
    const form = document.getElementById('add-item-form');
    if (form) form.reset();
    
    const container = document.getElementById('add-item-container');
    if (container) container.classList.add('hidden');
    
    alert(`Plato "${nombre}" agregado a la categoría "${categoria}"`);
    this.renderMenu();
  }

  renderAdminSection() {
    this.renderMenu();
    this.renderTableQRs();
  }

  renderMenu() {
    const menuList = document.getElementById('menu-list');
    if (!menuList) return;
    
    menuList.innerHTML = '';

    Object.entries(this.data.menu).forEach(([categoria, items]) => {
      const categoryDiv = document.createElement('div');
      categoryDiv.className = 'menu-category';
      
      categoryDiv.innerHTML = `
        <h3>${categoria} (${items.length} platos)</h3>
        <div class="menu-items-grid">
          ${items.map(item => this.createMenuItemCard(item, true)).join('')}
        </div>
      `;
      
      menuList.appendChild(categoryDiv);
    });
  }

  createMenuItemCard(item, isAdmin = false) {
    return `
      <article class="menu-item-card">
        <div class="menu-item-image">
          <span>Imagen: ${item.nombre}</span>
        </div>
        <div class="menu-item-info">
          <h4 class="menu-item-name">${item.nombre}</h4>
          <p class="menu-item-desc">${item.descripcion}</p>
          <div class="menu-item-price">${item.precio.toFixed(2)} €</div>
        </div>
        ${isAdmin ? `
          <div class="menu-item-actions">
            <button class="btn btn--outline btn--sm" onclick="app.editMenuItem('${item.id}')">Editar</button>
            <button class="btn btn--outline btn--sm" onclick="app.deleteMenuItem('${item.id}')">Eliminar</button>
          </div>
        ` : `
          <div class="menu-item-actions">
            <button class="add-to-cart-btn" onclick="app.addToCart('${item.id}')">
              Agregar al pedido
            </button>
          </div>
        `}
      </article>
    `;
  }

  editMenuItem(itemId) {
    alert('Funcionalidad de edición disponible en versión completa');
  }

  deleteMenuItem(itemId) {
    if (!confirm('¿Eliminar este elemento del menú?')) return;
    
    Object.keys(this.data.menu).forEach(categoria => {
      this.data.menu[categoria] = this.data.menu[categoria].filter(item => item.id !== itemId);
    });
    
    alert('Elemento eliminado correctamente');
    this.renderMenu();
  }

  renderTableQRs() {
    const container = document.getElementById('mesas-qr-list');
    if (!container) return;
    
    container.innerHTML = '';

    this.data.mesas.forEach(mesa => {
      const mesaDiv = document.createElement('div');
      mesaDiv.className = 'mesa-qr-item';
      
      mesaDiv.innerHTML = `
        <h4>Mesa ${mesa.numero}</h4>
        <div class="mesa-status ${mesa.estado}">${mesa.estado === 'libre' ? 'Libre' : 'Ocupada'}</div>
        <div id="qr-${mesa.numero}" style="margin: var(--space-8) 0;"></div>
        <button class="btn btn--outline btn--sm" onclick="app.printQR(${mesa.numero})">Imprimir QR</button>
        <button class="btn btn--primary btn--sm" onclick="app.simulateQRScan(${mesa.numero})">Simular QR</button>
      `;
      
      container.appendChild(mesaDiv);
      
      // Generar QR después de que el elemento esté en el DOM
      setTimeout(() => this.generateQRCode(mesa.numero), 100);
    });
  }

  generateQRCode(mesaNum) {
    const container = document.getElementById(`qr-${mesaNum}`);
    if (!container) return;

    const canvas = document.createElement('canvas');
    canvas.className = 'qr-canvas';
    container.appendChild(canvas);
    
    try {
      const qr = new QRious({
        element: canvas,
        size: 150,
        value: `${window.location.origin}${window.location.pathname}?mesa=${mesaNum}`,
        background: '#ffffff',
        foreground: '#134252'
      });
      
      this.qrCodes.set(mesaNum, canvas);
    } catch (error) {
      console.error('Error generating QR code:', error);
      container.innerHTML = '<div style="padding: 20px; border: 2px dashed #ccc; text-align: center;">Código QR<br>Mesa ' + mesaNum + '</div>';
    }
  }

  simulateQRScan(mesaNum) {
    this.currentTable = mesaNum;
    this.showSection('client');
  }

  printQR(mesaNum) {
    const canvas = this.qrCodes.get(mesaNum);
    if (canvas) {
      const dataURL = canvas.toDataURL();
      const printWindow = window.open('');
      printWindow.document.write(`
        <html>
          <head><title>QR Mesa ${mesaNum} - ${this.data.restaurante.nombre}</title></head>
          <body style="text-align: center; font-family: Arial; padding: 20px;">
            <h2>${this.data.restaurante.nombre}</h2>
            <h3>Mesa ${mesaNum}</h3>
            <img src="${dataURL}" style="border: 2px solid #ccc; margin: 20px;">
            <p>Escanea este código para ver nuestro menú</p>
            <p style="font-size: 12px; color: #666;">${this.data.restaurante.direccion}</p>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    } else {
      alert('QR no disponible para impresión');
    }
  }

  renderKitchenSection() {
    const container = document.getElementById('kitchen-orders');
    if (!container) return;
    
    container.innerHTML = '';

    if (this.data.pedidos.length === 0) {
      container.innerHTML = `
        <div class="card">
          <div class="card__body text-center">
            <h3>No hay pedidos pendientes</h3>
            <p>Los nuevos pedidos aparecerán aquí automáticamente</p>
          </div>
        </div>
      `;
      return;
    }

    this.data.pedidos.forEach(pedido => {
      const orderDiv = document.createElement('div');
      orderDiv.className = `kitchen-order ${pedido.estado}`;
      
      const fecha = new Date(pedido.timestamp);
      const tiempoTranscurrido = Math.floor((Date.now() - fecha.getTime()) / (1000 * 60));
      
      orderDiv.innerHTML = `
        <div class="kitchen-order-header">
          <span class="kitchen-order-mesa">Mesa ${pedido.mesa} - ${pedido.cliente}</span>
          <span class="kitchen-order-time">Hace ${tiempoTranscurrido} min</span>
        </div>
        
        <div class="kitchen-order-items">
          ${pedido.items.map(item => `
            <div class="kitchen-order-item">
              <span>${item.nombre}</span>
              <span class="kitchen-order-quantity">${item.cantidad}</span>
            </div>
          `).join('')}
        </div>
        
        <div class="kitchen-order-total">Total: ${pedido.total.toFixed(2)} €</div>
        
        <div class="kitchen-order-status">
          <button class="btn btn--sm ${pedido.estado === 'recibido' ? 'btn--primary' : 'btn--outline'}" 
                  onclick="app.updateOrderStatus('${pedido.id}', 'recibido')">Recibido</button>
          <button class="btn btn--sm ${pedido.estado === 'en_preparacion' ? 'btn--primary' : 'btn--outline'}" 
                  onclick="app.updateOrderStatus('${pedido.id}', 'en_preparacion')">Preparando</button>
          <button class="btn btn--sm ${pedido.estado === 'listo' ? 'btn--primary' : 'btn--outline'}" 
                  onclick="app.updateOrderStatus('${pedido.id}', 'listo')">Listo</button>
          <button class="btn btn--sm ${pedido.estado === 'servido' ? 'btn--primary' : 'btn--outline'}" 
                  onclick="app.updateOrderStatus('${pedido.id}', 'servido')">Servido</button>
        </div>
      `;
      
      container.appendChild(orderDiv);
    });
  }

  updateOrderStatus(pedidoId, nuevoEstado) {
    const pedido = this.data.pedidos.find(p => p.id === pedidoId);
    if (pedido) {
      pedido.estado = nuevoEstado;
      alert(`Pedido actualizado a: ${nuevoEstado.replace('_', ' ')}`);
      this.renderKitchenSection();
    }
  }

  renderClientSection() {
    // Actualizar información del restaurante y mesa
    const restaurantName = document.getElementById('client-restaurant-name');
    const tableLabel = document.getElementById('client-table-label');
    
    if (restaurantName) {
      restaurantName.textContent = this.data.restaurante.nombre;
    }
    
    if (tableLabel) {
      tableLabel.textContent = this.currentTable ? 
        `Mesa ${this.currentTable} - ¡Bienvenido!` : 
        'Vista de demostración del menú';
    }

    // Renderizar menú para clientes
    this.renderClientMenu();
    this.updateCartDisplay();
  }

  renderClientMenu() {
    const menuContainer = document.getElementById('client-menu');
    if (!menuContainer) return;
    
    menuContainer.innerHTML = '';

    Object.entries(this.data.menu).forEach(([categoria, items]) => {
      const categoryDiv = document.createElement('div');
      categoryDiv.className = 'menu-category';
      
      categoryDiv.innerHTML = `
        <h3>${categoria}</h3>
        <div class="menu-items-grid">
          ${items.map(item => this.createMenuItemCard(item, false)).join('')}
        </div>
      `;
      
      menuContainer.appendChild(categoryDiv);
    });
  }

  addToCart(itemId) {
    // Buscar el item en todo el menú
    let item = null;
    Object.values(this.data.menu).forEach(categoria => {
      const found = categoria.find(i => i.id === itemId);
      if (found) item = found;
    });

    if (!item) return;

    // Verificar si ya está en el carrito
    const existingItem = this.cart.find(cartItem => cartItem.id === itemId);
    
    if (existingItem) {
      existingItem.cantidad++;
    } else {
      this.cart.push({
        id: item.id,
        nombre: item.nombre,
        precio: item.precio,
        cantidad: 1
      });
    }

    this.updateCartDisplay();
  }

  removeFromCart(itemId) {
    this.cart = this.cart.filter(item => item.id !== itemId);
    this.updateCartDisplay();
  }

  updateCartQuantity(itemId, change) {
    const item = this.cart.find(cartItem => cartItem.id === itemId);
    if (!item) return;

    item.cantidad += change;
    
    if (item.cantidad <= 0) {
      this.removeFromCart(itemId);
    } else {
      this.updateCartDisplay();
    }
  }

  updateCartDisplay() {
    const cartElement = document.getElementById('cart');
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');

    if (!cartElement || !cartItems || !cartTotal) return;

    if (this.cart.length === 0) {
      cartElement.classList.add('hidden');
      return;
    }

    cartElement.classList.remove('hidden');

    // Renderizar items del carrito
    cartItems.innerHTML = this.cart.map(item => `
      <div class="cart-item">
        <div class="cart-item-info">
          <div class="cart-item-name">${item.nombre}</div>
          <div class="cart-item-price">${item.precio.toFixed(2)} € c/u</div>
        </div>
        <div class="cart-item-controls">
          <button class="quantity-btn" onclick="app.updateCartQuantity('${item.id}', -1)">−</button>
          <span class="quantity-display">${item.cantidad}</span>
          <button class="quantity-btn" onclick="app.updateCartQuantity('${item.id}', 1)">+</button>
        </div>
      </div>
    `).join('');

    // Calcular total
    const total = this.cart.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    cartTotal.textContent = `${total.toFixed(2)} €`;
  }

  confirmOrder() {
    if (this.cart.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    const newOrder = {
      id: 'ped-' + Date.now(),
      mesa: this.currentTable || 1,
      cliente: `Cliente Mesa ${this.currentTable || 1}`,
      items: [...this.cart],
      total: this.cart.reduce((sum, item) => sum + (item.precio * item.cantidad), 0),
      estado: 'recibido',
      timestamp: new Date().toISOString()
    };

    this.data.pedidos.push(newOrder);
    
    // Mostrar botones de pago
    const confirmBtn = document.getElementById('btn-confirm-order');
    const payBtn = document.getElementById('btn-pay-order');
    const payTableBtn = document.getElementById('btn-pay-table');
    
    if (confirmBtn) confirmBtn.classList.add('hidden');
    if (payBtn) payBtn.classList.remove('hidden');
    if (payTableBtn) payTableBtn.classList.remove('hidden');

    alert('¡Pedido confirmado! El personal de cocina lo está preparando.');
  }

  payOrder(tipo) {
    const total = this.cart.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    
    if (tipo === 'individual') {
      alert(`Pago individual procesado: ${total.toFixed(2)} €\n¡Gracias por su visita!`);
    } else {
      alert(`Solicitud de pago completo para Mesa ${this.currentTable || 1} enviada al personal.`);
    }

    // Limpiar carrito
    this.cart = [];
    this.updateCartDisplay();
    
    // Resetear botones
    const confirmBtn = document.getElementById('btn-confirm-order');
    const payBtn = document.getElementById('btn-pay-order');
    const payTableBtn = document.getElementById('btn-pay-table');
    
    if (confirmBtn) confirmBtn.classList.remove('hidden');
    if (payBtn) payBtn.classList.add('hidden');
    if (payTableBtn) payTableBtn.classList.add('hidden');
  }
}

// Inicializar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing app...');
  window.app = new MenuQRApp();
});
