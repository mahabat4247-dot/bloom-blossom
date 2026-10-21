/**
 * Bloom & Blossom - Main Application Script
 * Handcrafted vanilla JavaScript for catalog, shopping cart, and interactivity.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Product Data
  const products = [
    {
      id: 'p1',
      name: 'Blush & Peony Romance',
      description: 'Delicate soft pink peonies blended with white roses and fresh eucalyptus sprigs.',
      price: 64.99,
      badge: 'Bestseller',
      image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80',
      fallback: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'p2',
      name: 'Velvet Meadow Grace',
      description: 'A rustic garden mix of wild chamomile, sage foliage, and deep crimson dahlias.',
      price: 58.50,
      badge: 'Seasonal',
      image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80',
      fallback: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'p3',
      name: 'Elysian Rose Harmony',
      description: 'Classic long-stemmed pastel garden roses wrapped in eco-friendly linen paper.',
      price: 72.00,
      badge: 'Popular',
      image: 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=800&q=80',
      fallback: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'p4',
      name: 'Sunset Orchid Elegance',
      description: 'Vibrant golden orchids with delicate spray roses and wild lavender stems.',
      price: 84.99,
      badge: 'Luxury',
      image: 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?auto=format&fit=crop&w=800&q=80',
      fallback: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'p5',
      name: 'Serene Lily Whisper',
      description: 'Pure white calla lilies paired with baby\'s breath and soft sage greenery.',
      price: 49.99,
      badge: 'Minimalist',
      image: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&w=800&q=80',
      fallback: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'p6',
      name: 'Botanical Sage Delight',
      description: 'Organic green foliage arrangement with ranunculus and subtle blush highlights.',
      price: 54.00,
      badge: 'Fresh',
      image: 'https://images.unsplash.com/photo-1533616688419-b7a585564566?auto=format&fit=crop&w=800&q=80',
      fallback: 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=800&q=80'
    }
  ];

  // Cart State (Persisted in LocalStorage)
  let cart = JSON.parse(localStorage.getItem('bloom_cart') || '[]');

  // DOM Elements
  const productGrid = document.getElementById('product-grid');
  const cartBtn = document.getElementById('open-cart-btn');
  const closeCartBtn = document.getElementById('close-cart-btn');
  const cartDrawer = document.getElementById('cart-drawer');
  const cartOverlay = document.getElementById('cart-overlay');
  const cartItemsContainer = document.getElementById('cart-items-container');
  const cartCountEl = document.getElementById('cart-count');
  const cartSubtotalEl = document.getElementById('cart-subtotal');
  const cartTotalEl = document.getElementById('cart-total');
  const clearCartBtn = document.getElementById('clear-cart-btn');
  const checkoutBtn = document.getElementById('checkout-btn');
  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');
  const contactForm = document.getElementById('contact-form');
  const toastContainer = document.getElementById('toast-container');

  // SVG Fallback Data URL for broken images
  const placeholderDataUrl = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23FBF0EF"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="serif" font-size="20" fill="%238A9A86">🌸 Bloom %26 Blossom</text></svg>';

  // Initialize
  renderCatalog();
  updateCartUI();
  setupImageFallbacks();

  // Render Product Catalog
  function renderCatalog() {
    if (!productGrid) return;
    productGrid.innerHTML = products.map(product => `
      <div class="product-card">
        <div class="product-image-wrap">
          <span class="product-badge">${product.badge}</span>
          <img
            src="${product.image}"
            alt="${product.name}"
            data-fallback="${product.fallback}"
            loading="lazy"
          >
        </div>
        <div class="product-body">
          <h3 class="product-title">${product.name}</h3>
          <p class="product-desc">${product.description}</p>
          <div class="product-footer">
            <span class="product-price">$${product.price.toFixed(2)}</span>
            <button class="add-cart-btn" data-id="${product.id}">+ Add to Cart</button>
          </div>
        </div>
      </div>
    `).join('');

    // Attach Event Listeners to Add to Cart buttons
    productGrid.querySelectorAll('.add-cart-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        const productId = e.target.getAttribute('data-id');
        addToCart(productId);
      });
    });

    setupImageFallbacks();
  }

  // Setup Robust Image Fallback Handler
  function setupImageFallbacks() {
    document.querySelectorAll('img').forEach(img => {
      img.onerror = function() {
        const fallback = this.getAttribute('data-fallback');
        if (fallback && this.src !== fallback) {
          this.src = fallback;
        } else {
          this.src = placeholderDataUrl;
        }
      };
    });
  }

  // Add Item to Cart
  function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingIndex = cart.findIndex(item => item.id === productId);

    if (existingIndex > -1) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        fallback: product.fallback,
        quantity: 1
      });
    }

    saveAndRefreshCart();
    showToast(`Added "${product.name}" to cart! 🌸`);
    openCart();
  }

  // Save Cart & Update Interface
  function saveAndRefreshCart() {
    localStorage.setItem('bloom_cart', JSON.stringify(cart));
    updateCartUI();
  }

  // Update Shopping Cart UI
  function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    if (cartCountEl) cartCountEl.textContent = totalItems.toString();
    if (cartSubtotalEl) cartSubtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    if (cartTotalEl) cartTotalEl.textContent = `$${subtotal.toFixed(2)}`;

    if (!cartItemsContainer) return;

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = `
        <div class="cart-empty-msg">
          <span>🌿</span>
          <p>Your shopping cart is currently empty.</p>
        </div>
      `;
      return;
    }

    cartItemsContainer.innerHTML = cart.map(item => `
      <div class="cart-item">
        <img
          src="${item.image}"
          alt="${item.name}"
          class="cart-item-img"
          data-fallback="${item.fallback}"
        >
        <div class="cart-item-details">
          <div class="cart-item-title">${item.name}</div>
          <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
          <div class="cart-item-controls">
            <button class="qty-btn" data-id="${item.id}" data-action="decrease">-</button>
            <span class="qty-val">${item.quantity}</span>
            <button class="qty-btn" data-id="${item.id}" data-action="increase">+</button>
          </div>
        </div>
        <button class="remove-item-btn" data-id="${item.id}" aria-label="Remove Item">&times;</button>
      </div>
    `).join('');

    // Cart event handlers
    cartItemsContainer.querySelectorAll('.qty-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        const action = e.target.getAttribute('data-action');
        updateQuantity(id, action);
      });
    });

    cartItemsContainer.querySelectorAll('.remove-item-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        removeFromCart(id);
      });
    });

    setupImageFallbacks();
  }

  // Quantity Change Handler
  function updateQuantity(productId, action) {
    const itemIndex = cart.findIndex(item => item.id === productId);
    if (itemIndex === -1) return;

    if (action === 'increase') {
      cart[itemIndex].quantity += 1;
    } else if (action === 'decrease') {
      cart[itemIndex].quantity -= 1;
      if (cart[itemIndex].quantity <= 0) {
        cart.splice(itemIndex, 1);
      }
    }

    saveAndRefreshCart();
  }

  // Remove Item Handler
  function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveAndRefreshCart();
    showToast('Item removed from cart');
  }

  // Drawer Controls
  function openCart() {
    if (cartDrawer) cartDrawer.classList.add('active');
    if (cartOverlay) cartOverlay.classList.add('active');
  }

  function closeCart() {
    if (cartDrawer) cartDrawer.classList.remove('active');
    if (cartOverlay) cartOverlay.classList.remove('active');
  }

  if (cartBtn) cartBtn.addEventListener('click', openCart);
  if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

  if (clearCartBtn) {
    clearCartBtn.addEventListener('click', () => {
      if (cart.length === 0) return;
      cart = [];
      saveAndRefreshCart();
      showToast('Shopping cart cleared');
    });
  }

  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (cart.length === 0) {
        showToast('Your cart is empty!');
        return;
      }
      showToast('🎉 Demo Order Placed! Thank you for visiting Bloom & Blossom.');
      cart = [];
      saveAndRefreshCart();
      closeCart();
    });
  }

  // Mobile Navigation Toggle
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });
  }

  // Contact Form Submission
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast('Thank you for your message! We will get back to you soon. 🌺');
      contactForm.reset();
    });
  }

  // Toast Notification System
  function showToast(message) {
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
});
