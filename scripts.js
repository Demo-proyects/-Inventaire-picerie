// ==================================================
// CONSTANTES Y ESTADO GLOBAL
// ==================================================
const WHATSAPP_NUMBER = '18098786115';
const DISCOUNT_RATES = { dozen: 0.15 };
const sizesByCategory = {
  'Hombre': ['36', '38', '40', '42', '43'],
  'Mujer': ['36', '38', '40', '42', '43'],
  'Niño': ['22', '24', '26', '28', '30', '32']
};

// Array global de TODAS las tallas para inicializar el selector
const allSizes = [...new Set([
  ...sizesByCategory.Hombre, 
  ...sizesByCategory.Mujer, 
  ...sizesByCategory.Niño
])].sort((a, b) => parseInt(a) - parseInt(b));

let cart = JSON.parse(localStorage.getItem('sneakerCart')) || [];
let currentFilter = 'all';

const productsData = [
  { id: 6, name: "JORDAN 1 LOW", price: 99.99, colors: [{index: 1, color: "Negro", hex: "#000000"}, {index: 2, color: "Blanco", hex: "#ffffff"}, {index: 3, color: "Rojo", hex: "#dc2626"}], tag: "NEW JORDAN", tagGradient: "from-red-600 to-orange-500", rating: 30 },
  { id: 2, name: "MIDNIGHT NAVY", price: 149.99, colors: [{index: 1, color: "Carmesí Oscuro", hex: "#AA001B"}, {index: 2, color: "Azul Navy", hex: "#1B3A6B"}, {index: 3, color: "Verde Militar", hex: "#556b2f"}], tag: "NEW ARRIVAL", tagGradient: "from-blue-600 to-blue-400", rating: 18 },
  { id: 3, name: "SMOKE GREY", price: 119.99, colors: [{index: 1, color: "Negro", hex: "#000000"}, {index: 2, color: "Multicolor", class: "bg-gradient-to-r from-blue-500 via-green-500 to-red-500"}, {index: 3, color: "Rojo", hex: "#dc2626"}], tag: "HOT TODAY", tagGradient: "from-red-600 to-orange-500", rating: 42 },
  { id: 4, name: "PARIS EDITION", price: 139.99, colors: [{index: 1, color: "Azul Oscuro", hex: "#1e3a8a"}, {index: 2, color: "Plateado", hex: "#D1D1D1"}, {index: 3, color: "Azul Cielo", hex: "#7BCDF9"}], tag: "NEW SHOES", tagGradient: "from-blue-600 to-blue-400", rating: 15 },
  { id: 5, name: "JORDAN 4 RETRO", price: 159.99, colors: [{index: 1, color: "Rojo", hex: "#dc2626"}, {index: 2, color: "Azul", hex: "#2563eb"}, {index: 3, color: "Verde", hex: "#82C71E"}], tag: "HOT JORDAN", tagGradient: "from-red-600 to-orange-500", rating: 99 },
  { id: 1, name: "UNIVERSITY BLUE", price: 129.99, colors: [{index: 1, color: "Verde/Naranja Gradiente", class: "bg-gradient-to-tr from-green-300 to-orange-400"}, {index: 2, color: "Rojo", hex: "#dc2626"}, {index: 3, color: "Negro", hex: "#000000"}], tag: "HOT TODAY", tagGradient: "from-blue-600 to-blue-400", rating: 24 }
];
// ==================================================
// FUNCIONES HELPER
// ==================================================
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function calculateDiscountRate(item) {
  const totalQtyOfProduct = cart.filter(i => i.productId === item.productId)
    .reduce((sum, i) => sum + i.quantity, 0);
  return totalQtyOfProduct >= 12 ? DISCOUNT_RATES.dozen : 0;
}

// Generador de Opciones de Talla
function generateSizeOptions(sizes, selectedSize = '') {
  // Construcción determinista de las opciones para evitar reset inesperado.
  // Si `selectedSize` está presente en la lista, esa opción tendrá el atributo selected;
  // si no, el option por defecto (value="") quedará seleccionado.
  let options = `<option value="" ${selectedSize === '' ? 'selected' : ''}>size</option>`;
  sizes.forEach(size => {
    const isSelected = size === selectedSize ? 'selected' : '';
    options += `<option value="${size}" ${isSelected}>${size}</option>`;
  });
  return options;
}

// ==================================================
// GESTIÓN DEL CARRITO
// ==================================================
function saveCart() {
  localStorage.setItem('sneakerCart', JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const count = cart.reduce((total, item) => total + item.quantity, 0);
  const cartCountBadge = document.getElementById('cart-count');
  const headerCartCount = document.getElementById('header-cart-count');
  
  cartCountBadge.textContent = count;
  headerCartCount.textContent = count;
  
  if (count > 0) {
    cartCountBadge.classList.remove('hidden');
    headerCartCount.classList.remove('hidden');
  } else {
    cartCountBadge.classList.add('hidden');
    headerCartCount.classList.add('hidden');
  }
}

function calculateTotals() {
  const subtotalEl = document.getElementById('cart-subtotal');
  const discountRow = document.getElementById('discount-row');
  const discountEl = document.getElementById('cart-discount');
  const totalEl = document.getElementById('cart-total');
  
  let subtotal = 0;
  let totalDiscount = 0;

  cart.forEach(item => {
    const itemSubtotal = item.price * item.quantity;
    const discountRate = calculateDiscountRate(item);
    const discountAmount = itemSubtotal * discountRate;
    
    subtotal += itemSubtotal;
    totalDiscount += discountAmount;
  });

  const total = subtotal - totalDiscount;

  subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  totalEl.textContent = `$${total.toFixed(2)}`;

  if (totalDiscount > 0) {
    discountEl.textContent = `-$${totalDiscount.toFixed(2)}`;
    discountRow.classList.remove('hidden');
  } else {
    discountRow.classList.add('hidden');
  }
  
  return { subtotal, totalDiscount, total };
}

// ==================================================
// RENDERIZAR PRODUCTOS
// ==================================================
// ==================================================
// LOGICA DE SELECCIÓN Y RENDERIZADO (FINAL)
// ==================================================

// 1. Lógica del Modal (Bottom Sheet)
function openSelectionModal(type, productId) {
  const modal = document.getElementById('selectionModal');
  const backdrop = document.getElementById('modalBackdrop');
  const sheet = document.getElementById('modalSheet');
  const content = document.getElementById('modalContent');
  const title = document.getElementById('modalTitle');
  const subtitle = document.getElementById('modalSubtitle');

  activeProductContext = { type, productId };
  content.innerHTML = '';

  const productCard = document.querySelector(`.product-card[data-product-id="${productId}"]`);
  const currentCategory = productCard.getAttribute('data-selected-category') || '';
  const currentSize = productCard.getAttribute('data-selected-size') || '';

  if (type === 'size') {
    title.innerText = 'SELECCIONA TALLA'; // Título del Modal
    subtitle.innerText = currentCategory ? `Tallas para ${currentCategory}` : 'Todas las tallas disponibles';
    
    let sizesToShow = (currentCategory && sizesByCategory[currentCategory]) 
                      ? sizesByCategory[currentCategory] 
                      : allSizes;

    const grid = document.createElement('div');
    grid.className = 'grid grid-cols-4 gap-3';
    
    sizesToShow.forEach(size => {
      const btn = document.createElement('button');
      const isSelected = size === currentSize;
      
      btn.className = `
        py-4 rounded-xl font-bold text-lg transition-all duration-200 border
        ${isSelected 
          ? 'bg-nike-red border-nike-red text-white shadow-[0_0_15px_rgba(239,62,66,0.5)] transform scale-105' 
          : 'bg-neutral-800 border-neutral-700 text-gray-300 hover:border-gray-500'}
      `;
      btn.innerText = size;
      btn.onclick = () => applySelection('size', size, productId);
      grid.appendChild(btn);
    });
    content.appendChild(grid);

  } else if (type === 'category') {
    title.innerText = 'SELECCIONA TIPO'; // Título del Modal
    subtitle.innerText = '¿Para quién es este modelo?';

    const categories = [
      { id: 'Hombre', icon: 'fa-person', label: 'Hombre' },
      { id: 'Mujer', icon: 'fa-person-dress', label: 'Mujer' },
      { id: 'Niño', icon: 'fa-child', label: 'Niño' }
    ];

    const flexContainer = document.createElement('div');
    flexContainer.className = 'flex flex-col gap-4';

    categories.forEach(cat => {
      const isSelected = cat.id === currentCategory;
      const btn = document.createElement('button');
      btn.className = `
        flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 group
        ${isSelected 
          ? 'bg-neutral-800 border-nike-red' 
          : 'bg-neutral-900 border-neutral-700 hover:bg-neutral-800'}
      `;
      
      btn.innerHTML = `
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-full flex items-center justify-center ${isSelected ? 'bg-nike-red text-white' : 'bg-neutral-800 text-gray-400 group-hover:text-white'} transition-colors">
            <i class="fa-solid ${cat.icon} text-xl"></i>
          </div>
          <span class="text-lg font-header uppercase tracking-wide ${isSelected ? 'text-white' : 'text-gray-400 group-hover:text-white'}">${cat.label}</span>
        </div>
        ${isSelected ? '<i class="fa-solid fa-check-circle text-nike-red text-xl"></i>' : '<i class="fa-solid fa-chevron-right text-gray-600"></i>'}
      `;
      btn.onclick = () => applySelection('category', cat.id, productId);
      flexContainer.appendChild(btn);
    });
    content.appendChild(flexContainer);
  }

  modal.classList.remove('hidden');
  requestAnimationFrame(() => {
    backdrop.classList.remove('opacity-0');
    sheet.classList.remove('translate-y-full');
  });
  document.body.style.overflow = 'hidden';
}

function closeSelectionModal() {
  const modal = document.getElementById('selectionModal');
  const backdrop = document.getElementById('modalBackdrop');
  const sheet = document.getElementById('modalSheet');

  backdrop.classList.add('opacity-0');
  sheet.classList.add('translate-y-full');
  
  setTimeout(() => {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }, 300);
}

// 2. Función Inteligente para Aplicar Selección
function updateSizeTexts(productCard, size) {
  const sizeTexts = productCard.querySelectorAll('.display-size-text');
  sizeTexts.forEach(el => {
    if (size) {
      el.innerText = size;
      el.classList.add('text-white');
      el.classList.remove('text-gray-400');
    } else {
      el.innerText = 'SIZE';
      el.classList.remove('text-white');
      el.classList.add('text-gray-400');
    }
  });
}

function updateCategoryTexts(productCard, category) {
  const catTexts = productCard.querySelectorAll('.display-category-text');
  catTexts.forEach(el => {
    if (category) {
      el.innerText = category.toUpperCase();
      el.classList.add('text-white');
      el.classList.remove('text-gray-400');
    } else {
      el.innerText = 'TYPE';
      el.classList.remove('text-white');
      el.classList.add('text-gray-400');
    }
  });
}

function applySelectionToCard(productCard, type, value) {
  if (type === 'category') {
    if (!value || value === 'all') {
      productCard.setAttribute('data-selected-category', '');
      updateCategoryTexts(productCard, '');
      return { sizeReset: false };
    }

    const currentSize = productCard.getAttribute('data-selected-size');
    productCard.setAttribute('data-selected-category', value);
    updateCategoryTexts(productCard, value);

    const availableSizes = sizesByCategory[value] || [];
    let sizeReset = false;

    if (currentSize && !availableSizes.includes(currentSize)) {
      productCard.setAttribute('data-selected-size', '');
      updateSizeTexts(productCard, '');
      sizeReset = true;
    }

    return { sizeReset };
  }

  if (type === 'size') {
    const currentCategory = productCard.getAttribute('data-selected-category');
    const allowedSizes = currentCategory ? (sizesByCategory[currentCategory] || []) : allSizes;

    if (currentCategory && !allowedSizes.includes(value)) {
      productCard.setAttribute('data-selected-size', '');
      updateSizeTexts(productCard, '');
      return { sizeIncompatible: true };
    }

    productCard.setAttribute('data-selected-size', value);
    updateSizeTexts(productCard, value);
    return { sizeIncompatible: false };
  }

  return {};
}

function applySelectionAll(type, value, options = {}) {
  const { silent = false } = options;
  let sizeResetCount = 0;
  let sizeIncompatibleCount = 0;

  document.querySelectorAll('.product-card').forEach(card => {
    const result = applySelectionToCard(card, type, value);
    if (result.sizeReset) sizeResetCount += 1;
    if (result.sizeIncompatible) sizeIncompatibleCount += 1;
  });

  if (!silent) {
    if (type === 'category' && sizeResetCount > 0 && value) {
      showToast(`⚠️ Algunas tallas no están disponibles para ${value}. Se reiniciaron.`);
    }
    if (type === 'size' && sizeIncompatibleCount > 0) {
      showToast(`⚠️ La talla ${value} no está disponible en algunos tipos.`);
    }
  }
}

function applySelection(type, value, productId) {
  applySelectionAll(type, value, { silent: false });
  closeSelectionModal();
}

// 3. Renderizado de Productos (Diseño Híbrido Final)
function renderProducts() {
  const container = document.getElementById('products-container');
  container.innerHTML = '';
  
  productsData.forEach(product => {
    const productCard = document.createElement('div');
    productCard.className = 'group relative bg-neutral-800 rounded-2xl overflow-hidden border border-neutral-700 shadow-xl flex flex-col transition-transform hover:-translate-y-1 product-card';
    productCard.setAttribute('data-product-id', product.id);
    productCard.setAttribute('data-price', product.price);
    productCard.setAttribute('data-selected-category', '');
    productCard.setAttribute('data-selected-size', '');
    
    const colorButtons = product.colors.map((color, idx) => {
      // COLORES CUADRADOS (rounded en vez de rounded-full)
      let classes = `w-5 h-5 rounded cursor-pointer ${idx === 0 ? 'ring-2 ring-white scale-110 shadow-sm transition-all color-btn selected-color' : 'hover:ring-2 ring-gray-500 transition-all color-btn'}`;
      let style = color.class ? '' : `style="background-color: ${color.hex}"`;
      let bgClass = color.class ? color.class : '';
      
      return `<button class="${classes} ${bgClass}" 
              data-color-index="${color.index}" 
              data-color="${color.color}"
              ${style}></button>`;
    }).join('');
    
    productCard.innerHTML = `
      <div class="relative h-56 bg-gradient-to-b from-neutral-700/50 to-neutral-800 flex items-center justify-center p-4">
        <div class="absolute top-3 left-3 z-20 bg-gradient-to-r ${product.tagGradient} text-white text-[10px] font-black px-3 py-1 rounded shadow-lg tracking-wider">
          ${product.tag}
        </div>
        <img src="tenis/tenis${product.id}-1.png" onerror="this.src='https://placehold.co/400x300/png?text=Shoe+Image'" alt="${product.name}" class="product-image h-48 w-auto object-contain z-10 drop-shadow-2xl transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
      </div>

      <div class="p-5 pt-0 flex flex-col flex-grow relative z-20">
        <div class="flex justify-between items-end -mt-6 mb-4">
          <h2 class="text-xl font-black italic tracking-tighter text-white drop-shadow-md leading-none max-w-[70%]">
            ${product.name}
          </h2>
          <span class="text-accent font-bold text-lg drop-shadow-md bg-neutral-800/80 px-2 rounded">
            $${product.price.toFixed(2)}
          </span>
        </div>

        <div class="space-y-3 mb-4">
          <div class="flex flex-col gap-3">
            <div class="flex justify-between items-center text-xs text-gray-400">
              <div class="flex gap-2 items-center">
                <span class="font-bold tracking-wider text-gray-500">COLORS:</span>
                <div class="flex gap-2 color-selector">
                  ${colorButtons}
                </div>
              </div>

              <div class="hidden lg:flex gap-2 controls-container-pc">
                 <button onclick="openSelectionModal('size', ${product.id})" 
                         class="bg-neutral-800 border border-gray-600 px-2 py-0.5 rounded flex items-center gap-1 hover:border-gray-400 transition-colors text-white min-w-[50px] justify-between">
                    <span class="display-size-text text-[10px]">size</span>
                    <i class="fa-solid fa-chevron-down text-[8px] text-gray-500"></i>
                 </button>

                 <button onclick="openSelectionModal('category', ${product.id})" 
                         class="bg-neutral-800 border border-gray-600 px-2 py-0.5 rounded flex items-center gap-1 hover:border-gray-400 transition-colors text-white min-w-[60px] justify-between">
                    <span class="display-category-text text-[10px]">type</span>
                    <i class="fa-solid fa-chevron-down text-[8px] text-gray-500"></i>
                 </button>
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-2 mt-1 lg:hidden">
               <button onclick="openSelectionModal('size', ${product.id})" 
                       class="flex items-center justify-between bg-[#2a2a2a] hover:bg-[#333] border border-neutral-600 rounded px-3 py-2 transition-colors group/btn">
                  <div class="flex flex-col items-start">
                     <span class="text-[10px] text-gray-500 uppercase font-bold tracking-wider">SIZE</span>
                     <span class="text-sm font-bold text-gray-400 display-size-text group-hover/btn:text-white transition-colors">SIZE</span>
                  </div>
                  <i class="fa-solid fa-chevron-down text-[10px] text-gray-500"></i>
               </button>

               <button onclick="openSelectionModal('category', ${product.id})" 
                       class="flex items-center justify-between bg-[#2a2a2a] hover:bg-[#333] border border-neutral-600 rounded px-3 py-2 transition-colors group/btn">
                  <div class="flex flex-col items-start">
                     <span class="text-[10px] text-gray-500 uppercase font-bold tracking-wider">TYPE</span>
                     <span class="text-sm font-bold text-gray-400 display-category-text group-hover/btn:text-white transition-colors">TYPE</span>
                  </div>
                  <i class="fa-solid fa-chevron-down text-[10px] text-gray-500"></i>
               </button>
            </div>

          </div>
        </div>

        <div class="mt-auto pt-3 border-t border-neutral-700 flex justify-between items-center gap-3">
          <div class="flex items-center gap-1 text-yellow-500 text-sm">
            <span>★★★★★</span>
            <span class="text-[10px] text-gray-500">(${product.rating})</span>
          </div>
          
          <div class="flex gap-2">
            <button class="share-button w-9 h-9 rounded-full bg-neutral-700 hover:bg-neutral-600 flex items-center justify-center text-white transition-colors">
              <i class="fa-solid fa-share-nodes text-sm"></i>
            </button>
            <button class="add-to-cart-btn bg-white text-black text-xs font-black px-4 py-2 rounded-full hover:bg-gray-200 transition-colors flex items-center gap-1 shadow-lg shadow-white/10">
              ADD TO CART
            </button>
          </div>
        </div>
      </div>
    `;
    
    container.appendChild(productCard);
  });
  
  setupProductEvents();
}

function setupProductEvents() {
  // Selector de Color
  document.querySelectorAll('.color-selector').forEach(selector => {
    const buttons = selector.querySelectorAll('.color-btn');
    const productCard = selector.closest('[data-product-id]');
    const productImage = productCard.querySelector('.product-image');

    buttons.forEach(btn => {
      btn.addEventListener('click', function() {
        buttons.forEach(b => {
          b.classList.remove('ring-2', 'ring-white', 'scale-110', 'selected-color', 'shadow-sm');
          b.classList.add('hover:ring-2', 'ring-gray-500');
        });
        this.classList.remove('hover:ring-2', 'ring-gray-500');
        this.classList.add('ring-2', 'ring-white', 'scale-110', 'selected-color', 'shadow-sm');
        
        const productId = productCard.getAttribute('data-product-id');
        const colorIndex = this.getAttribute('data-color-index');
        productImage.src = `tenis/tenis${productId}-${colorIndex}.png`;
      });
    });
  });

  // Add to Cart
  document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const card = this.closest('[data-product-id]');
      const id = card.getAttribute('data-product-id');
      const name = card.querySelector('h2').textContent.trim();
      const basePrice = parseFloat(card.getAttribute('data-price'));
      const imageSrc = card.querySelector('.product-image').src;
      
      const size = card.getAttribute('data-selected-size');
      const category = card.getAttribute('data-selected-category');
      const colorBtn = card.querySelector('.color-selector .selected-color');
      const color = colorBtn ? colorBtn.getAttribute('data-color') : 'Rojo';

      if (!category) {
        showToast("⚠️ Por favor selecciona el tipo (TYPE)");
        openSelectionModal('category', id);
        return;
      }

      if (!size) {
        showToast("⚠️ Por favor selecciona la talla (SIZE)");
        openSelectionModal('size', id);
        return;
      }

      const uniqueId = `${id}-${color}-${size}-${category}`;
      const existingItem = cart.find(item => item.uniqueId === uniqueId);

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.push({
          uniqueId: uniqueId,
          productId: id,
          name: name,
          price: basePrice,
          image: imageSrc,
          color: color,
          size: size,
          category: category,
          quantity: 1
        });
      }

      saveCart();
      updateCartUI();
      showToast("✅ Producto añadido");
      toggleCart(true);
    });
  });
  
  // Botón de Compartir - NUEVO SISTEMA
  document.querySelectorAll('.share-button').forEach(btn => {
    btn.addEventListener('click', function() {
      const productCard = this.closest('[data-product-id]');
      const productId = productCard.getAttribute('data-product-id');
      const productData = productsData.find(p => p.id == productId);
      
      // Obtener color seleccionado
      const colorBtn = productCard.querySelector('.color-selector .selected-color');
      const selectedColor = colorBtn ? colorBtn.getAttribute('data-color') : productData.colors[0].color;
      const selectedColorIndex = colorBtn ? colorBtn.getAttribute('data-color-index') : '1';
      
      // Mostrar modal de confirmación
      mostrarConfirmacionCompartir(productData, selectedColor, selectedColorIndex);
    });
  });
}

// ==================================================
// SISTEMA DE COMPARTIR - CONFIRMACIÓN Y ENLACE
// ==================================================

// Función para mostrar el modal de confirmación de compartir
function mostrarConfirmacionCompartir(product, color, colorIndex) {
  // Cerrar cualquier modal existente
  const existingModal = document.getElementById('share-confirm-modal');
  if (existingModal) existingModal.remove();
  
  // Crear modal de confirmación
  const modal = document.createElement('div');
  modal.id = 'share-confirm-modal';
  modal.className = 'fixed inset-0 z-[9999] flex items-center justify-center bg-black overflow-y-auto';
  modal.style.opacity = '0';
  modal.style.transition = 'opacity 0.5s ease';
  
  modal.innerHTML = `
    <div class="w-full max-w-5xl my-auto relative p-4">
      <!-- Fondo gradiente -->
      <div class="fixed inset-0 bg-gradient-to-br from-neutral-900 via-black to-neutral-900 -z-10"></div>
      
      <!-- Partículas flotantes -->
      <div class="fixed inset-0 opacity-20 pointer-events-none -z-10">
        ${Array.from({length: 20}, (_, i) => `
          <div class="absolute w-1 h-1 bg-nike-red rounded-full animate-float" 
               style="left: ${Math.random() * 100}%; top: ${Math.random() * 100}%; animation-delay: ${Math.random() * 5}s; animation-duration: ${5 + Math.random() * 5}s;"></div>
        `).join('')}
      </div>
      
      <!-- Contenido -->
      <div class="relative z-10 flex flex-col items-center justify-center py-6 md:py-8">
        
        <!-- Mensaje superior -->
        <div class="mb-6 md:mb-10 text-center opacity-0 animate-fade-in px-4" style="animation-delay: 0.3s;">
          <div class="inline-block bg-nike-red/10 border border-nike-red/30 rounded-full px-4 py-1.5 md:px-6 md:py-2 mb-3 md:mb-4">
            <i class="fa-solid fa-share-nodes text-nike-red mr-2 text-xs md:text-sm"></i>
            <span class="text-nike-red font-bold text-xs md:text-sm">Compartir modelo</span>
          </div>
          <h2 class="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-header font-bold mb-2 leading-tight">
            ¿Mostrar este tenis a alguien?
          </h2>
          <p class="text-gray-400 text-sm md:text-base lg:text-lg">Genera un enlace para compartir este modelo con amigos</p>
        </div>
        
        <!-- Card producto -->
        <div class="bg-neutral-900/80 backdrop-blur-xl border border-neutral-700 rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 w-full max-w-[95vw] sm:max-w-[90vw] md:max-w-3xl opacity-0 animate-slide-up shadow-2xl" style="animation-delay: 0.6s;">
          <div class="flex flex-col md:flex-row gap-6 md:gap-8 items-center">
            
            <!-- Imagen -->
            <div class="flex-shrink-0 w-full xs:w-48 sm:w-56 md:w-72 h-48 sm:h-56 md:h-72 bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-xl md:rounded-2xl flex items-center justify-center relative overflow-hidden group">
              <div class="absolute inset-0 bg-gradient-to-tr from-nike-red/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <img src="tenis/tenis${product.id}-${colorIndex}.png" 
                   class="w-full h-full object-contain p-4 md:p-6 transform group-hover:scale-110 transition-transform duration-500 relative z-10 drop-shadow-2xl"
                   alt="${product.name}">
              <div class="absolute top-2 right-2 md:top-3 md:right-3 bg-gradient-to-r ${product.tagGradient} text-white text-[10px] md:text-xs px-2 md:px-3 py-1 rounded-full font-bold shadow-lg">
                ${product.tag}
              </div>
            </div>
            
            <!-- Info -->
            <div class="flex-grow w-full text-center md:text-left space-y-4 md:space-y-5">
              <div>
                <h3 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-header font-black text-white italic uppercase leading-none mb-2 md:mb-3">
                  ${product.name}
                </h3>
                <p class="text-gray-400 text-sm md:text-base">
                  Color: <span class="text-white font-semibold">${color}</span>
                </p>
              </div>
              
              <!-- Precio y rating -->
              <div class="flex items-center justify-center md:justify-start gap-3 md:gap-4 flex-wrap">
                <div class="text-nike-red text-3xl md:text-4xl font-black">
                  $${product.price.toFixed(2)}
                </div>
                <div class="flex items-center text-yellow-500 text-xs md:text-sm">
                  <span>★★★★★</span>
                  <span class="text-gray-500 ml-2">(${product.rating})</span>
                </div>
              </div>
              
              <!-- Botones -->
              <div class="flex flex-col sm:flex-row gap-3 pt-2">
                <button class="btn-compartir-enlace flex-1 bg-nike-red hover:bg-red-600 text-white font-bold py-3 md:py-4 px-6 rounded-xl transition-all duration-300 transform active:scale-95 hover:shadow-lg hover:shadow-nike-red/30 text-sm md:text-base">
                  <i class="fa-solid fa-paper-plane mr-2"></i>Sí, enviar
                </button>
                <button class="btn-cerrar-confirmacion sm:flex-initial bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-3 md:py-4 px-6 rounded-xl transition-colors text-sm md:text-base border border-neutral-700 hover:border-neutral-600">
                  <i class="fa-solid fa-xmark mr-2 md:hidden"></i>Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Botón X flotante -->
      <button class="btn-x-flotante-confirmacion absolute top-2 right-2 md:top-4 md:right-4 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 flex items-center justify-center text-white transition-all duration-300 opacity-0 animate-fade-in z-50 shadow-lg" style="animation-delay: 0.9s;">
        <i class="fa-solid fa-xmark text-lg md:text-xl"></i>
      </button>
    </div>
  `;
  
  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';
  
  // Fade in
  requestAnimationFrame(() => {
    modal.style.opacity = '1';
  });
  
  // Función para cerrar
  const cerrarModal = () => {
    modal.style.opacity = '0';
    setTimeout(() => {
      modal.remove();
      document.body.style.overflow = '';
    }, 300);
  };
  
  // Event listeners
  modal.querySelector('.btn-cerrar-confirmacion').addEventListener('click', cerrarModal);
  modal.querySelector('.btn-x-flotante-confirmacion').addEventListener('click', cerrarModal);
  
  // Al hacer clic en "Sí, enviar"
  modal.querySelector('.btn-compartir-enlace').addEventListener('click', () => {
    // Generar enlace compartido
    const baseUrl = window.location.origin + window.location.pathname;
    const shareUrl = `${baseUrl}?share=${product.id}-${colorIndex}`;
    
    // Intentar usar la Web Share API si está disponible (en dispositivos móviles)
    if (navigator.share) {
      navigator.share({
        title: `Mira este tenis: ${product.name}`,
        text: `Echa un vistazo a este increíble modelo: ${product.name} por $${product.price.toFixed(2)}`,
        url: shareUrl,
      })
      .then(() => {
        console.log('Enlace compartido exitosamente');
        showToast('✅ Enlace compartido');
      })
      .catch((error) => {
        console.error('Error al compartir:', error);
        // Si falla, copiar al portapapeles
        copiarEnlace(shareUrl);
      });
    } else {
      // Si no está disponible, copiar al portapapeles
      copiarEnlace(shareUrl);
    }
    
    cerrarModal();
  });
  
  // Función para copiar el enlace al portapapeles
  function copiarEnlace(url) {
    navigator.clipboard.writeText(url)
      .then(() => {
        showToast('✅ Enlace copiado al portapapeles');
      })
      .catch(err => {
        console.error('Error al copiar: ', err);
        // Fallback: mostrar el enlace en un prompt
        prompt('Copia este enlace:', url);
        showToast('✅ Enlace listo para compartir');
      });
  }
  
  // ESC para cerrar
  const handleEsc = (e) => {
    if (e.key === 'Escape') {
      cerrarModal();
      document.removeEventListener('keydown', handleEsc);
    }
  };
  document.addEventListener('keydown', handleEsc);
  
  // Click fuera para cerrar
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      cerrarModal();
    }
  });
}

// Función para mostrar el preview elegante (para cuando se abra el enlace compartido)
function mostrarPreviewElegante(product, color, colorIndex) {
  // Cerrar cualquier modal existente
  const existingModal = document.getElementById('share-preview-modal');
  if (existingModal) existingModal.remove();
  
  // Crear modal
  const modal = document.createElement('div');
  modal.id = 'share-preview-modal';
  modal.className = 'fixed inset-0 z-[9999] flex items-center justify-center bg-black overflow-y-auto';
  modal.style.opacity = '0';
  modal.style.transition = 'opacity 0.5s ease';
  
  modal.innerHTML = `
    <div class="w-full max-w-5xl my-auto relative p-4">
      <!-- Fondo gradiente -->
      <div class="fixed inset-0 bg-gradient-to-br from-neutral-900 via-black to-neutral-900 -z-10"></div>
      
      <!-- Partículas flotantes -->
      <div class="fixed inset-0 opacity-20 pointer-events-none -z-10">
        ${Array.from({length: 20}, (_, i) => `
          <div class="absolute w-1 h-1 bg-nike-red rounded-full animate-float" 
               style="left: ${Math.random() * 100}%; top: ${Math.random() * 100}%; animation-delay: ${Math.random() * 5}s; animation-duration: ${5 + Math.random() * 5}s;"></div>
        `).join('')}
      </div>
      
      <!-- Contenido -->
      <div class="relative z-10 flex flex-col items-center justify-center py-6 md:py-8">
        
        <!-- Mensaje superior -->
        <div class="mb-6 md:mb-10 text-center opacity-0 animate-fade-in px-4" style="animation-delay: 0.3s;">
          <div class="inline-block bg-nike-red/10 border border-nike-red/30 rounded-full px-4 py-1.5 md:px-6 md:py-2 mb-3 md:mb-4">
            <i class="fa-solid fa-heart text-nike-red mr-2 text-xs md:text-sm"></i>
            <span class="text-nike-red font-bold text-xs md:text-sm">Alguien pensó en ti</span>
          </div>
          <h2 class="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-header font-bold mb-2 leading-tight">
            Te compartieron algo especial
          </h2>
          <p class="text-gray-400 text-sm md:text-base lg:text-lg">Echa un vistazo a este increíble modelo</p>
        </div>
        
        <!-- Card producto -->
        <div class="bg-neutral-900/80 backdrop-blur-xl border border-neutral-700 rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 w-full max-w-[95vw] sm:max-w-[90vw] md:max-w-3xl opacity-0 animate-slide-up shadow-2xl" style="animation-delay: 0.6s;">
          <div class="flex flex-col md:flex-row gap-6 md:gap-8 items-center">
            
            <!-- Imagen -->
            <div class="flex-shrink-0 w-full xs:w-48 sm:w-56 md:w-72 h-48 sm:h-56 md:h-72 bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-xl md:rounded-2xl flex items-center justify-center relative overflow-hidden group">
              <div class="absolute inset-0 bg-gradient-to-tr from-nike-red/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <img src="tenis/tenis${product.id}-${colorIndex}.png" 
                   class="w-full h-full object-contain p-4 md:p-6 transform group-hover:scale-110 transition-transform duration-500 relative z-10 drop-shadow-2xl"
                   alt="${product.name}">
              <div class="absolute top-2 right-2 md:top-3 md:right-3 bg-gradient-to-r ${product.tagGradient} text-white text-[10px] md:text-xs px-2 md:px-3 py-1 rounded-full font-bold shadow-lg">
                ${product.tag}
              </div>
            </div>
            
            <!-- Info -->
            <div class="flex-grow w-full text-center md:text-left space-y-4 md:space-y-5">
              <div>
                <h3 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-header font-black text-white italic uppercase leading-none mb-2 md:mb-3">
                  ${product.name}
                </h3>
                <p class="text-gray-400 text-sm md:text-base">
                  Color: <span class="text-white font-semibold">${color}</span>
                </p>
              </div>
              
              <!-- Precio y rating -->
              <div class="flex items-center justify-center md:justify-start gap-3 md:gap-4 flex-wrap">
                <div class="text-nike-red text-3xl md:text-4xl font-black">
                  $${product.price.toFixed(2)}
                </div>
                <div class="flex items-center text-yellow-500 text-xs md:text-sm">
                  <span>★★★★★</span>
                  <span class="text-gray-500 ml-2">(${product.rating})</span>
                </div>
              </div>
              
              <!-- Botones -->
              <div class="flex flex-col sm:flex-row gap-3 pt-2">
                <button class="btn-ver-tienda flex-1 bg-nike-red hover:bg-red-600 text-white font-bold py-3 md:py-4 px-6 rounded-xl transition-all duration-300 transform active:scale-95 hover:shadow-lg hover:shadow-nike-red/30 text-sm md:text-base">
                  <i class="fa-solid fa-eye mr-2"></i>Ver en Tienda
                </button>
                <button class="btn-cerrar-modal sm:flex-initial bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-3 md:py-4 px-6 rounded-xl transition-colors text-sm md:text-base border border-neutral-700 hover:border-neutral-600">
                  <i class="fa-solid fa-xmark mr-2 md:hidden"></i>Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Botón X flotante -->
      <button class="btn-x-flotante absolute top-2 right-2 md:top-4 md:right-4 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 flex items-center justify-center text-white transition-all duration-300 opacity-0 animate-fade-in z-50 shadow-lg" style="animation-delay: 0.9s;">
        <i class="fa-solid fa-xmark text-lg md:text-xl"></i>
      </button>
    </div>
  `;
  
  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';
  
  // Fade in
  requestAnimationFrame(() => {
    modal.style.opacity = '1';
  });
  
  // Función para cerrar
  const cerrarModal = () => {
    modal.style.opacity = '0';
    setTimeout(() => {
      modal.remove();
      document.body.style.overflow = '';
    }, 300);
  };
  
  // Event listeners
  modal.querySelector('.btn-cerrar-modal').addEventListener('click', cerrarModal);
  modal.querySelector('.btn-x-flotante').addEventListener('click', cerrarModal);
  
  modal.querySelector('.btn-ver-tienda').addEventListener('click', () => {
    cerrarModal();
    setTimeout(() => {
      document.getElementById('products-section').scrollIntoView({ behavior: 'smooth' });
    }, 300);
  });
  
  // ESC para cerrar
  const handleEsc = (e) => {
    if (e.key === 'Escape') {
      cerrarModal();
      document.removeEventListener('keydown', handleEsc);
    }
  };
  document.addEventListener('keydown', handleEsc);
  
  // Click fuera para cerrar
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      cerrarModal();
    }
  });
}

// Función para verificar si hay un enlace compartido en la URL
function checkSharedLink() {
  const urlParams = new URLSearchParams(window.location.search);
  const shareParam = urlParams.get('share');
  
  if (shareParam) {
    // Formato: "id-colorIndex"
    const [productId, colorIndex] = shareParam.split('-');
    const product = productsData.find(p => p.id == productId);
    if (product) {
      // Encontrar el color correspondiente al colorIndex
      const colorObj = product.colors.find(c => c.index == colorIndex);
      const color = colorObj ? colorObj.color : product.colors[0].color;
      
      // Mostrar el preview elegante después de un pequeño retraso para que la página cargue
      setTimeout(() => {
        mostrarPreviewElegante(product, color, colorIndex);
      }, 1000);
    }
  }
}

// ==================================================
// FILTRO DE CATEGORÍA
// ==================================================
function setFilter(category, skipScroll = false, silent = false) {
  currentFilter = category;

  // Actualizar UI de filtros activos en el header (PC Navigation)
  document.querySelectorAll('nav a').forEach(link => {
    if (link.getAttribute('onclick') && link.getAttribute('onclick').includes('setFilter')) {
      link.classList.remove('filter-active', 'text-white', 'border-b-2', 'border-white');
      link.classList.add('text-gray-400');
    }
  });

  // Marcar filtro activo
  const filterMap = {
    'all': 'New Bestsellers',
    'Hombre': 'Men',
    'Mujer': 'Women',
    'Niño': 'Kids'
  };

  // Encontrar y activar el enlace correcto (PC Nav)
  document.querySelectorAll('nav a').forEach(link => {
    const linkText = link.textContent.trim();
    if (linkText === filterMap[category]) {
      link.classList.add('filter-active', 'text-white', 'border-b-2', 'border-white');
      link.classList.remove('text-gray-400');
    }
  });

  // Encontrar y activar el enlace correcto (Mobile Menu)
  document.querySelectorAll('#mobile-menu a').forEach(link => {
    const spanText = link.querySelector('.text')?.textContent.trim();
    const icon = link.querySelector('.icon');

    if (spanText === filterMap[category] && icon) {
        icon.classList.remove('text-nike-gray');
        icon.classList.add('text-nike-red');
    } else if (icon && link.getAttribute('onclick')?.includes('setFilter')) {
        icon.classList.add('text-nike-gray');
        icon.classList.remove('text-nike-red');
    }
  });

  // Mostrar mensaje SOLO SI NO ES MODO SILENCIOSO
  if (!silent) {
    const messages = {
      'all': '✅ Mostrando todos los modelos',
      'Hombre': '✅ Filtro aplicado: Tenis de Hombre',
      'Mujer': '✅ Filtro aplicado: Tenis de Mujer',
      'Niño': '✅ Filtro aplicado: Tenis de Niño'
    };
    showToast(messages[category]);
  }

  // Cerrar menú móvil si está abierto
  closeMobileMenu();

  // Scroll a la sección de productos (condicional)
  if (!skipScroll) {
    scrollToProducts();
  }

  // Aplicar el tipo seleccionado a TODOS los productos (sin toasts extra)
  setTimeout(() => {
    const valueToApply = (category === 'all') ? '' : category;
    applySelectionAll('category', valueToApply, { silent: true });
  }, 100);
}

// ==================================================
// UI DEL CARRITO
// ==================================================
function updateCartUI() {
  const cartItemsContainer = document.getElementById('cart-items');
  cartItemsContainer.innerHTML = '';
  
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<div class="text-center text-gray-500 mt-10 text-sm">Tu carrito está vacío.</div>';
    calculateTotals();
    return;
  }

  cart.forEach((item, index) => {
    const itemSubtotal = item.price * item.quantity;
    const discountRate = calculateDiscountRate(item);
    const discountAmount = itemSubtotal * discountRate;
    const itemTotal = itemSubtotal - discountAmount;
    
    const div = document.createElement('div');
    div.className = 'flex gap-3 bg-neutral-900 p-3 rounded-lg border border-neutral-700 relative group';
    
    let priceDisplay = `<span class="text-accent text-sm font-bold">$${itemTotal.toFixed(2)}</span>`;
    let discountDisplay = '';

    if (discountRate > 0) {
      const discountPercent = (discountRate * 100).toFixed(0);
      let discountLabel = discountRate === DISCOUNT_RATES.dozen ? 'DOCENA' : 'MAYORISTA';
      
      priceDisplay = `
        <div class="flex flex-col items-end">
          <span class="text-gray-500 text-[10px] line-through">$${itemSubtotal.toFixed(2)}</span>
          <span class="text-accent text-sm font-bold">$${itemTotal.toFixed(2)}</span>
        </div>
      `;
      discountDisplay = `
        <span class="text-[10px] text-green-400 font-bold">-${discountPercent}% (${discountLabel})</span>
      `;
    }
    
    div.innerHTML = `
      <div class="w-16 h-16 bg-neutral-800 rounded flex items-center justify-center p-1 shrink-0">
        <img src="${item.image}" class="max-w-full max-h-full object-contain">
      </div>
      <div class="flex-grow flex flex-col justify-between">
        <div>
          <h4 class="text-sm font-bold text-white leading-tight">${item.name}</h4>
          <p class="text-[10px] text-gray-400 mt-1">
            ${item.category} | ${item.color} | Talla: ${item.size} 
            ${discountDisplay}
          </p>
        </div>
        <div class="flex justify-between items-end mt-2">
          <div class="flex items-center gap-2 bg-neutral-800 rounded px-1 border border-neutral-700">
            <button class="text-gray-400 hover:text-white px-1 text-sm" onclick="changeQty(${index}, -1)">-</button>
            <span class="text-xs font-bold w-4 text-center">${item.quantity}</span>
            <button class="text-gray-400 hover:text-white px-1 text-sm" onclick="changeQty(${index}, 1)">+</button>
          </div>
          ${priceDisplay}
        </div>
      </div>
      <button onclick="removeItem(${index})" class="absolute top-2 right-2 text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
        <i class="ph ph-trash"></i>
      </button>
    `;
    cartItemsContainer.appendChild(div);
  });

  calculateTotals();
}

window.changeQty = function(index, change) {
  if (cart[index].quantity + change > 0) {
    cart[index].quantity += change;
  } else {
    cart.splice(index, 1);
  }
  saveCart();
  updateCartUI();
};

window.removeItem = function(index) {
  cart.splice(index, 1);
  saveCart();
  updateCartUI();
};

// ==================================================
// CONTROL DE VISIBILIDAD DEL CARRITO FLOTANTE
// ==================================================
function handleCartVisibility() {
  const heroSection = document.getElementById('hero-section');
  const cartButton = document.getElementById('open-cart-btn');
  
  const heroRect = heroSection.getBoundingClientRect();
  const windowHeight = window.innerHeight;
  
  // Si el hero section ocupa más del 50% de la ventana, ocultar carrito flotante
  if (heroRect.bottom > windowHeight * 0.5) {
    cartButton.style.opacity = '0';
    cartButton.style.visibility = 'hidden';
  } else {
    cartButton.style.opacity = '1';
    cartButton.style.visibility = 'visible';
  }
}

// ==================================================
// TOGGLE CARRITO
// ==================================================
function toggleCart(open) {
  const cartSidebar = document.getElementById('cart-sidebar');
  const cartOverlay = document.getElementById('cart-overlay');
  
  if (open) {
    updateCartUI();
    cartSidebar.classList.remove('cart-closed');
    cartSidebar.classList.add('cart-open');
    cartOverlay.classList.remove('hidden');
    setTimeout(() => {
      cartOverlay.classList.remove('opacity-0');
      cartOverlay.style.pointerEvents = 'auto';
    }, 10);
  } else {
    cartSidebar.classList.remove('cart-open');
    cartSidebar.classList.add('cart-closed');
    cartOverlay.classList.add('opacity-0');
    cartOverlay.style.pointerEvents = 'none';
    setTimeout(() => {
      cartOverlay.classList.add('hidden');
    }, 300);
  }
}

// ==================================================
// CHECKOUT WHATSAPP
// ==================================================
function setupCheckout() {
  document.getElementById('checkout-btn').addEventListener('click', function() {
    if (cart.length === 0) {
      showToast("⚠️ El carrito está vacío");
      return;
    }

    const location = document.getElementById('user-location').value.trim();
    const phone = document.getElementById('user-phone').value.trim();
    const email = document.getElementById('user-email').value.trim();

    if (!location || !phone || !email) {
      showToast("⚠️ Por favor completa todos tus datos de envío");
      return;
    }
    
    const totals = calculateTotals();
    const subtotalStr = totals.subtotal.toFixed(2);
    const totalDiscountStr = totals.totalDiscount.toFixed(2);
    const totalStr = totals.total.toFixed(2);
    
    let message = '🛒 *NUEVO PEDIDO - SNEAKER STORE*\n\n';
    
    message += '👤 *INFORMACIÓN DEL CLIENTE*\n';
    message += `📱 Teléfono: ${phone}\n`;
    message += `📧 Email: ${email}\n`;
    message += `📍 Ubicación: ${location}\n\n`;

    message += '👟 *DETALLES DEL PEDIDO*\n';
    message += '━━━━━━━━━━━━━━━━━━━━\n\n';

    cart.forEach((item, index) => {
      const itemSubtotal = item.price * item.quantity;
      const discountRate = calculateDiscountRate(item);
      const discountAmount = itemSubtotal * discountRate;
      const itemTotal = itemSubtotal - discountAmount;
      
      message += `*${index + 1}. ${item.name}*\n`;
      message += `  • Color: ${item.color}\n`;
      message += `  • Talla: ${item.size}\n`;
      message += `  • Género: ${item.category}\n`;
      message += `  • Cantidad: ${item.quantity} unidades\n`;
      message += `  • Precio unitario: $${item.price.toFixed(2)}\n`;
      
      if (discountRate > 0) {
        const discountPercent = (discountRate * 100).toFixed(0);
        const discountType = discountRate === DISCOUNT_RATES.dozen ? '(DOCENA)' : '(MAYOREO)';
        message += `  • 🎉 Descuento: ${discountPercent}% ${discountType}\n`;
        message += `  • Subtotal: ~$${itemSubtotal.toFixed(2)}~\n`;
        message += `  • *Total: $${itemTotal.toFixed(2)}*\n\n`;
      } else {
        message += `  • *Total: $${itemTotal.toFixed(2)}*\n\n`;
      }
    });

    message += '━━━━━━━━━━━━━━━━━━━━\n';
    message += '💰 *RESUMEN DE COMPRA*\n\n';
    message += `Subtotal: $${subtotalStr}\n`;
    
    if (totals.totalDiscount > 0) {
      message += `Descuentos: -$${totalDiscountStr}\n`;
    }
    
    message += `\n*TOTAL A PAGAR: $${totalStr}*\n\n`;
    
    message += '━━━━━━━━━━━━━━━━━━━━\n';
    message += '✅ _Pedido generado desde Sneaker Store_\n';
    message += '_Nos pondremos en contacto contigo pronto para confirmar tu orden._';
    
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    
    window.open(url, '_blank');
    
    cart = [];
    document.getElementById('user-location').value = '';
    document.getElementById('user-phone').value = '';
    document.getElementById('user-email').value = '';
    saveCart();
    updateCartUI();
    toggleCart(false);
    showToast("✅ ¡Pedido enviado! Revisa WhatsApp.");
  });
}

// ==================================================
// FUNCIONES DE UI
// ==================================================
function scrollToProducts() {
  document.getElementById('products-section').scrollIntoView({ 
    behavior: 'smooth' 
  });
}

// Menú Móvil
const mobileMenu = document.getElementById('mobile-menu');
const menuIconPath = "M4 6h16M4 12h16m-7 6h7";
const closeIconPath = "M6 18L18 6M6 6l12 12";
const iconElement = document.getElementById('menu-icon');

function toggleMobileMenu() {
  if (mobileMenu.classList.contains('-translate-x-full')) {
    openMobileMenu();
  } else {
    closeMobileMenu();
  }
}

function openMobileMenu() {
  mobileMenu.classList.remove('-translate-x-full');
  if(iconElement) iconElement.setAttribute('d', closeIconPath);
}

function closeMobileMenu() {
  mobileMenu.classList.add('-translate-x-full');
  if(iconElement) iconElement.setAttribute('d', menuIconPath);
}

// Video Modal
const modal = document.getElementById('videoModal');
const content = document.getElementById('videoContent');
const video = document.getElementById('promoVideo');

function openVideoModal() {
  const modal = document.getElementById('videoModal');
  const videoContent = document.getElementById('videoContent');
  const videoContainer = document.querySelector('.vertical-video-container');
  
  // 1. ELIMINAR cualquier widget de Instagram existente
  const existingInstagram = videoContainer.querySelector('.instagram-media, iframe');
  if (existingInstagram) {
    existingInstagram.remove();
  }
  
  // 2. Crear NUEVO código de Instagram desde cero
  const newInstagramHTML = `
    <blockquote class="instagram-media" data-instgrm-captioned data-instgrm-permalink="https://www.instagram.com/reel/DSQ3CKDEsWc/?utm_source=ig_embed&utm_campaign=loading" data-instgrm-version="14" style="background:#FFF; border:0; border-radius:3px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); margin: 1px; max-width:100%; min-width:100%; padding:0; width:99.375%; width:-webkit-calc(100% - 2px); width:calc(100% - 2px);">
      <div style="padding:16px;">
        <a href="https://www.instagram.com/reel/DSQ3CKDEsWc/?utm_source=ig_embed&utm_campaign=loading" style="background:#FFFFFF; line-height:0; padding:0 0; text-align:center; text-decoration:none; width:100%;" target="_blank">
          <div style="display: flex; flex-direction: row; align-items: center;">
            <div style="background-color: #F4F4F4; border-radius: 50%; flex-grow: 0; height: 40px; margin-right: 14px; width: 40px;"></div>
            <div style="display: flex; flex-direction: column; flex-grow: 1; justify-content: center;">
              <div style="background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; margin-bottom: 6px; width: 100px;"></div>
              <div style="background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; width: 60px;"></div>
            </div>
          </div>
          <div style="padding: 19% 0;"></div>
          <div style="display:block; height:50px; margin:0 auto 12px; width:50px;">
            <svg width="50px" height="50px" viewBox="0 0 60 60" version="1.1" xmlns="https://www.w3.org/2000/svg" xmlns:xlink="https://www.w3.org/1999/xlink">
              <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                <g transform="translate(-511.000000, -20.000000)" fill="#000000">
                  <g>
                    <path d="M556.869,30.41 C554.814,30.41 553.148,32.076 553.148,34.131 C553.148,36.186 554.814,37.852 556.869,37.852 C558.924,37.852 560.59,36.186 560.59,34.131 C560.59,32.076 558.924,30.41 556.869,30.41 M541,60.657 C535.114,60.657 530.342,55.887 530.342,50 C530.342,44.114 535.114,39.342 541,39.342 C546.887,39.342 551.658,44.114 551.658,50 C551.658,55.887 546.887,60.657 541,60.657 M541,33.886 C532.1,33.886 524.886,41.1 524.886,50 C524.886,58.899 532.1,66.113 541,66.113 C549.9,66.113 557.115,58.899 557.115,50 C557.115,41.1 549.9,33.886 541,33.886 M565.378,62.101 C565.244,65.022 564.756,66.606 564.346,67.663 C563.803,69.06 563.154,70.057 562.106,71.106 C561.058,72.155 560.06,72.803 558.662,73.347 C557.607,73.757 556.021,74.244 553.102,74.378 C549.944,74.521 548.997,74.552 541,74.552 C533.003,74.552 532.056,74.521 528.898,74.378 C525.979,74.244 524.393,73.757 523.338,73.347 C521.94,72.803 520.942,72.155 519.894,71.106 C518.846,70.057 518.197,69.06 517.654,67.663 C517.244,66.606 516.755,65.022 516.623,62.101 C516.479,58.943 516.448,57.996 516.448,50 C516.448,42.003 516.479,41.056 516.623,37.899 C516.755,34.978 517.244,33.391 517.654,32.338 C518.197,30.938 518.846,29.942 519.894,28.894 C520.942,27.846 521.94,27.196 523.338,26.654 C524.393,26.244 525.979,25.756 528.898,25.623 C532.057,25.479 533.004,25.448 541,25.448 C548.997,25.448 549.943,25.479 553.102,25.623 C556.021,25.756 557.607,26.244 558.662,26.654 C560.06,27.196 561.058,27.846 562.106,28.894 C563.154,29.942 563.803,30.938 564.346,32.338 C564.756,33.391 565.244,34.978 565.378,37.899 C565.522,41.056 565.552,42.003 565.552,50 C565.552,57.996 565.522,58.943 565.378,62.101 M570.82,37.631 C570.674,34.438 570.167,32.258 569.425,30.349 C568.659,28.377 567.633,26.702 565.965,25.035 C564.297,23.368 562.623,22.342 560.652,21.575 C558.743,20.834 556.562,20.326 553.369,20.18 C550.169,20.033 549.148,20 541,20 C532.853,20 531.831,20.033 528.631,20.18 C525.438,20.326 523.257,20.834 521.349,21.575 C519.376,22.342 517.703,23.368 516.035,25.035 C514.368,26.702 513.342,28.377 512.574,30.349 C511.834,32.258 511.326,34.438 511.181,37.631 C511.035,40.831 511,41.851 511,50 C511,58.147 511.035,59.17 511.181,62.369 C511.326,65.562 511.834,67.743 512.574,69.651 C513.342,71.625 514.368,73.296 516.035,74.965 C517.703,76.634 519.376,77.658 521.349,78.425 C523.257,79.167 525.438,79.673 528.631,79.82 C531.831,79.965 532.853,80.001 541,80.001 C549.148,80.001 550.169,79.965 553.369,79.82 C556.562,79.673 558.743,79.167 560.652,78.425 C562.623,77.658 564.297,76.634 565.965,74.965 C567.633,73.296 568.659,71.625 569.425,69.651 C570.167,67.743 570.674,65.562 570.82,62.369 C570.966,59.17 571,58.147 571,50 C571,41.851 570.966,40.831 570.82,37.631"></path>
                  </g>
                </g>
              </g>
            </svg>
          </div>
          <div style="padding-top: 8px;">
            <div style="color:#3897f0; font-family:Arial,sans-serif; font-size:14px; font-style:normal; font-weight:550; line-height:18px;">Ver esta publicación en Instagram</div>
          </div>
          <div style="padding: 12.5% 0;"></div>
          <div style="display: flex; flex-direction: row; margin-bottom: 14px; align-items: center;">
            <div>
              <div style="background-color: #F4F4F4; border-radius: 50%; height: 12.5px; width: 12.5px; transform: translateX(0px) translateY(7px);"></div>
              <div style="background-color: #F4F4F4; height: 12.5px; transform: rotate(-45deg) translateX(3px) translateY(1px); width: 12.5px; flex-grow: 0; margin-right: 14px; margin-left: 2px;"></div>
              <div style="background-color: #F4F4F4; border-radius: 50%; height: 12.5px; width: 12.5px; transform: translateX(9px) translateY(-18px);"></div>
            </div>
            <div style="margin-left: 8px;">
              <div style="background-color: #F4F4F4; border-radius: 50%; flex-grow: 0; height: 20px; width: 20px;"></div>
              <div style="width: 0; height: 0; border-top: 2px solid transparent; border-left: 6px solid #f4f4f4; border-bottom: 2px solid transparent; transform: translateX(16px) translateY(-4px) rotate(30deg);"></div>
            </div>
            <div style="margin-left: auto;">
              <div style="width: 0px; border-top: 8px solid #F4F4F4; border-right: 8px solid transparent; transform: translateY(16px);"></div>
              <div style="background-color: #F4F4F4; flex-grow: 0; height: 12px; width: 16px; transform: translateY(-4px);"></div>
              <div style="width: 0; height: 0; border-top: 8px solid #F4F4F4; border-left: 8px solid transparent; transform: translateY(-4px) translateX(8px);"></div>
            </div>
          </div>
          <div style="display: flex; flex-direction: column; flex-grow: 1; justify-content: center; margin-bottom: 24px;">
            <div style="background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; margin-bottom: 6px; width: 224px;"></div>
            <div style="background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; width: 144px;"></div>
          </div>
        </a>
        <p style="color:#c9c8cd; font-family:Arial,sans-serif; font-size:14px; line-height:17px; margin-bottom:0; margin-top:8px; overflow:hidden; padding:8px 0 7px; text-align:center; text-overflow:ellipsis; white-space:nowrap;">
          <a href="https://www.instagram.com/reel/DSQ3CKDEsWc/?utm_source=ig_embed&utm_campaign=loading" style="color:#c9c8cd; font-family:Arial,sans-serif; font-size:14px; font-style:normal; font-weight:normal; line-height:17px; text-decoration:none;" target="_blank">Una publicación compartida por Ofertas ofertas (@mvp_flow_boutique10)</a>
        </p>
      </div>
    </blockquote>
  `;
  
  // 3. Insertar el NUEVO widget
  videoContainer.innerHTML = newInstagramHTML;
  
  // 4. Mostrar modal
  modal.classList.remove('hidden');
  setTimeout(() => {
    modal.classList.remove('opacity-0');
    videoContent.classList.remove('scale-50');
    document.body.style.overflow = 'hidden';
  }, 10);

  // 5. Cargar script de Instagram y procesar
  setTimeout(() => {
    // Remover script viejo si existe
    const oldScript = document.querySelector('script[src*="instagram.com/embed.js"]');
    if (oldScript) oldScript.remove();
    
    // Cargar NUEVO script
    const script = document.createElement('script');
    script.src = '//www.instagram.com/embed.js';
    script.async = true;
    script.onload = () => {
      if (window.instgrm) {
        window.instgrm.Embeds.process();
      }
    };
    document.head.appendChild(script);
  }, 300);
}

function closeVideoModal() {
  const modal = document.getElementById('videoModal');
  const videoContent = document.getElementById('videoContent');
  
  // 1. Ocultar modal con animaciones
  modal.classList.add('opacity-0');
  videoContent.classList.add('scale-50');
  
  // 2. Restaurar el scroll
  document.body.style.overflow = '';
  
  // 3. Ocultar completamente
  setTimeout(() => {
    modal.classList.add('hidden');
    
    // 4. ELIMINAR el widget de Instagram (esto DETIENE el video)
    const videoContainer = document.querySelector('.vertical-video-container');
    const instagramWidget = videoContainer.querySelector('.instagram-media, iframe');
    if (instagramWidget) {
      instagramWidget.remove();
    }
  }, 300);
}

document.addEventListener('DOMContentLoaded', function() {
  // Detectar si viene de enlace compartido
  const urlParams = new URLSearchParams(window.location.search);
  const shareParam = urlParams.get('share');
  
  if (shareParam) {
    // Ocultar preloader inmediatamente
    const preloader = document.getElementById('preloader');
    if (preloader) {
      preloader.style.display = 'none';
    }
    
    // Extraer ID y color del parámetro (formato: "5-2")
    const [productId, colorIndex] = shareParam.split('-').map(Number);
    const product = productsData.find(p => p.id === productId);
    
    if (product && colorIndex) {
      const colorData = product.colors.find(c => c.index === colorIndex);
      if (colorData) {
        // Mostrar el modal del tenis compartido
        mostrarPreviewElegante(product, colorData.color, colorIndex);
      }
    }
  }
  
  renderProducts();
  updateCartCount();
  updateCartUI();
  setupCheckout();
  
  // Event listeners para el carrito
  const cartToggle = document.getElementById('open-cart-btn');
  const closeCart = document.getElementById('close-cart');
  const cartOverlay = document.getElementById('cart-overlay');
  
  cartToggle.addEventListener('click', () => toggleCart(true));
  closeCart.addEventListener('click', () => toggleCart(false));
  cartOverlay.addEventListener('click', () => toggleCart(false));
  
  // Control de visibilidad del carrito flotante
  window.addEventListener('scroll', handleCartVisibility);
  window.addEventListener('resize', handleCartVisibility);
  handleCartVisibility();
  
  // Filtro por defecto - MODO SILENCIOSO
  setFilter('all', true, true); 
});

// Cerrar modal con tecla ESC
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    if (typeof closeVideoModal === 'function') closeVideoModal();
    if (typeof closeDemoAlert === 'function') closeDemoAlert();
  }
});

// Cerrar modal haciendo clic fuera del contenido
document.getElementById('videoModal').addEventListener('click', function(event) {
  if (event.target === this) {
    closeVideoModal();
  }
});

// Diagnóstico del scroll bloqueado
function checkScrollBlockers() {
  console.log('=== DIAGNÓSTICO DE SCROLL ===');
  console.log('Body overflow:', document.body.style.overflow);
  console.log('Html overflow:', document.documentElement.style.overflow);
  
  // Verificar si algún modal está bloqueando
  const modal = document.getElementById('demoAlertModal');
  if (modal && !modal.classList.contains('hidden')) {
    console.log('Modal de demo está abierto');
  }
  
  const videoModal = document.getElementById('videoModal');
  if (videoModal && !videoModal.classList.contains('hidden')) {
    console.log('Modal de video está abierto');
  }
  
  // Verificar posición fixed/fixed
  const fixedElements = document.querySelectorAll('*');
  fixedElements.forEach(el => {
    const style = window.getComputedStyle(el);
    if (style.position === 'fixed' || style.position === 'absolute') {
      console.log('Elemento con posición fija/absoluta:', el);
    }
  });
}

// Llama esto cuando tengas el problema
checkScrollBlockers();

// Ajuste dinámico de la altura del hero para móviles (corrige comportamiento de barras del navegador)
function setHeroHeight() {
  const hero = document.getElementById('hero-section');
  if (!hero) return;
  // Usar innerHeight para cubrir la ventana visible en móviles
  hero.style.height = window.innerHeight + 'px';
}

// Debounce simple
let _hhTimeout = null;
function onResizeHero() {
  clearTimeout(_hhTimeout);
  _hhTimeout = setTimeout(() => setHeroHeight(), 80);
}

document.addEventListener('DOMContentLoaded', () => {
  setHeroHeight();
  window.addEventListener('resize', onResizeHero);
  window.addEventListener('orientationchange', onResizeHero);
});

// Lógica del Demo Alert Modal (botón 'Ver Todos los Modelos')
function openDemoAlert() {
  const demoAlertModal = document.getElementById('demoAlertModal');
  const demoAlertContent = document.getElementById('demoAlertContent');
  if (!demoAlertModal || !demoAlertContent) return;
  demoAlertModal.classList.remove('hidden');
  setTimeout(() => {
    demoAlertModal.classList.remove('opacity-0');
    demoAlertContent.classList.add('animate-bounce-in-custom');
    demoAlertContent.classList.remove('opacity-0', 'scale-90');
    document.body.style.overflow = 'hidden';
  }, 10);
}

function closeDemoAlert() {
  const demoAlertModal = document.getElementById('demoAlertModal');
  const demoAlertContent = document.getElementById('demoAlertContent');
  if (!demoAlertModal || !demoAlertContent) return;
  demoAlertModal.classList.add('opacity-0');
  demoAlertContent.classList.remove('animate-bounce-in-custom');
  demoAlertContent.classList.add('opacity-0', 'scale-90');
  document.body.style.overflow = '';
  setTimeout(() => {
    demoAlertModal.classList.add('hidden');
  }, 300);
}

function handleDemoLinkClick(event) {
  event.preventDefault();
  if (typeof closeMobileMenu === 'function') closeMobileMenu();
  openDemoAlert();
}

// Cerrar demo al hacer click fuera del contenido
document.addEventListener('DOMContentLoaded', () => {
  const demoAlertModal = document.getElementById('demoAlertModal');
  if (demoAlertModal) {
    demoAlertModal.addEventListener('click', (e) => {
      if (e.target === demoAlertModal) closeDemoAlert();
    });
  }
});
