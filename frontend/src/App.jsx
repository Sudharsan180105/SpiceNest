
import { useEffect } from 'react'
import { auth, authReady } from './firebase'
import AdminPortal from './AdminPortal'
import {
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth'
import './App.css'

let dishes = [
  { name: 'Butter Naan', price: 45, image: 'butter-naan.jpg', category: 'Indian Bread', veg: true, description: 'Soft, buttery naan fresh from the tandoor.', tag: 'House favourite' },
  { name: 'Chana Masala', price: 149, image: 'chana-masala.jpg', category: 'Vegetarian', veg: true, description: 'Chickpeas simmered in a fragrant tomato masala.' },
  { name: 'Chicken 65', price: 189, image: 'chicken-65.jpg', category: 'Starters', veg: false, description: 'A crisp, spicy South Indian chicken classic.', tag: 'Popular' },
  { name: 'Chicken Burger', price: 159, image: 'chicken-burger.jpg', category: 'Fast Food', veg: false, description: 'A satisfying burger with a seasoned chicken patty.' },
  { name: 'Chicken Chettinad', price: 229, image: 'chicken-chettinad.jpg', category: 'South Indian', veg: false, description: 'Bold Chettinad spices in a rich, warming curry.' },
  { name: 'Chicken Curry', price: 199, image: 'chicken-curry.jpg', category: 'Indian Curry', veg: false, description: 'Comforting chicken curry with aromatic spices.' },
  { name: 'Chicken Dum Biryani', price: 249, image: 'chicken-dum-biryani.jpg', category: 'Biryani', veg: false, description: 'Fragrant rice and spiced chicken, inspired by dum cooking.', tag: 'Signature' },
  { name: 'Chicken Fried Rice', price: 179, image: 'chicken-fried-rice.jpg', category: 'Rice & Noodles', veg: false, description: 'Wok-tossed rice with chicken and vegetables.' },
  { name: 'Chicken Hakka Noodles', price: 179, image: 'chicken-hakka-noodles.jpg', category: 'Rice & Noodles', veg: false, description: 'Noodles tossed with vegetables and savoury sauces.' },
  { name: 'Chicken Kothu Parotta', price: 189, image: 'chicken-kothu-parotta.jpg', category: 'South Indian', veg: false, description: 'Chopped parotta tossed hot with chicken and masala.' },
  { name: 'Chicken Manchurian', price: 199, image: 'chicken-manchurian.jpg', category: 'Starters', veg: false, description: 'Indo-Chinese flavours with a savoury, spicy finish.' },
  { name: 'Chicken Tikka', price: 229, image: 'chicken-tikka.jpg', category: 'Grill', veg: false, description: 'Marinated chicken with warming tandoori spices.' },
  { name: 'Chicken Wrap', price: 149, image: 'chicken-wrap.jpg', category: 'Fast Food', veg: false, description: 'Seasoned chicken wrapped up for an easy bite.' },
  { name: 'Chilli Chicken', price: 199, image: 'chilli-chicken.jpg', category: 'Starters', veg: false, description: 'A lively Indo-Chinese favourite with chilli and aromatics.' },
  { name: 'Chocolate Brownie', price: 99, image: 'chocolate-brownie.jpg', category: 'Desserts', veg: true, description: 'A rich chocolate treat for the end of a meal.' },
  { name: 'Cold Coffee', price: 109, image: 'cold-coffee.jpg', category: 'Beverages', veg: true, description: 'Chilled coffee with a smooth, creamy finish.' },
  { name: 'Dal Tadka', price: 139, image: 'dal-tadka.jpg', category: 'Vegetarian', veg: true, description: 'Comforting lentils finished with an aromatic tempering.' },
  { name: 'Egg Biryani', price: 199, image: 'egg-biryani.jpg', category: 'Biryani', veg: false, description: 'Fragrant biryani rice served with seasoned egg.' },
  { name: 'Egg Fried Rice', price: 159, image: 'egg-fried-rice.jpg', category: 'Rice & Noodles', veg: false, description: 'Wok-fried rice with egg and vegetables.' },
  { name: 'Egg Kothu Parotta', price: 169, image: 'egg-kothu-parotta.jpg', category: 'South Indian', veg: false, description: 'A street-food favourite with egg, parotta and masala.' },
  { name: 'Farmhouse Pizza', price: 249, image: 'farmhouse-pizza.jpg', category: 'Pizza', veg: true, description: 'A colourful vegetable pizza with a satisfying topping.' },
  { name: 'Filter Coffee', price: 49, image: 'filter-coffee.jpg', category: 'Beverages', veg: true, description: 'A South Indian coffee favourite, rich and aromatic.' },
  { name: 'Fish Fry', price: 229, image: 'fish-fry.jpg', category: 'Seafood', veg: false, description: 'Fish seasoned with spices and fried until crisp.' },
  { name: 'French Fries', price: 99, image: 'french-fries.jpg', category: 'Fast Food', veg: true, description: 'Golden fries, perfect for sharing.' },
  { name: 'Fresh Lime Soda', price: 69, image: 'fresh-lime-soda.jpg', category: 'Beverages', veg: true, description: 'A refreshing lime drink, sweet or salty.' },
  { name: 'Gobi 65', price: 159, image: 'gobi-65.jpg', category: 'Starters', veg: true, description: 'Crisp cauliflower bites with South Indian spices.' },
  { name: 'Grilled Chicken Steak', price: 299, image: 'grilled-chicken-steak.jpg', category: 'Grill', veg: false, description: 'Grilled chicken served as a hearty main course.' },
  { name: 'Gulab Jamun', price: 79, image: 'gulab-jamun.jpg', category: 'Desserts', veg: true, description: 'Soft milk-solid dumplings in fragrant syrup.' },
  { name: 'Idli Sambar', price: 79, image: 'idli-sambar.jpg', category: 'South Indian', veg: true, description: 'Soft idlis served with sambar.' },
  { name: 'Jeera Rice', price: 119, image: 'jeera-rice.jpg', category: 'Rice & Noodles', veg: true, description: 'Fluffy rice scented with cumin.' },
  { name: 'Mango Milkshake', price: 119, image: 'mango-milkshake.jpg', category: 'Beverages', veg: true, description: 'A smooth mango drink with a creamy texture.' },
  { name: 'Margherita Pizza', price: 219, image: 'margherita-pizza.jpg', category: 'Pizza', veg: true, description: 'A timeless pizza with tomato and cheese.' },
  { name: 'Masala Dosa', price: 99, image: 'masala-dosa.jpg', category: 'South Indian', veg: true, description: 'Crisp dosa with a comforting potato masala.' },
  { name: 'Medu Vada', price: 69, image: 'medu-vada.jpg', category: 'South Indian', veg: true, description: 'Golden lentil fritters, crisp outside and soft inside.' },
  { name: 'Mutton Curry', price: 279, image: 'mutton-curry.jpg', category: 'Indian Curry', veg: false, description: 'A hearty mutton curry with deep, warming spices.' },
  { name: 'Mutton Dum Biryani', price: 329, image: 'mutton-dum-biryani.jpg', category: 'Biryani', veg: false, description: 'A celebratory biryani with fragrant rice and mutton.', tag: 'Chef favourite' },
  { name: 'Palak Paneer', price: 189, image: 'palak-paneer.jpg', category: 'Vegetarian', veg: true, description: 'Paneer in a smooth, delicately spiced spinach gravy.' },
  { name: 'Paneer Butter Masala', price: 219, image: 'paneer-butter-masala.jpg', category: 'Vegetarian', veg: true, description: 'Paneer in a creamy tomato and butter gravy.', tag: 'Popular' },
  { name: 'Paneer Tikka', price: 199, image: 'paneer-tikka.jpg', category: 'Starters', veg: true, description: 'Marinated paneer with a smoky, spiced finish.' },
  { name: 'Plain Dosa', price: 69, image: 'plain-dosa.jpg', category: 'South Indian', veg: true, description: 'A crisp, golden dosa made for dipping.' },
  { name: 'Prawn Biryani', price: 299, image: 'prawn-biryani.jpg', category: 'Seafood', veg: false, description: 'Fragrant biryani rice with seasoned prawns.' },
  { name: 'Schezwan Fried Rice', price: 179, image: 'schezwan-fried-rice.jpg', category: 'Rice & Noodles', veg: true, description: 'Spicy wok-fried rice with vegetables.' },
  { name: 'Schezwan Noodles', price: 179, image: 'schezwan-noodles.jpg', category: 'Rice & Noodles', veg: true, description: 'Noodles with a lively Schezwan-style sauce.' },
  { name: 'Tandoori Chicken', price: 279, image: 'tandoori-chicken.jpg', category: 'Grill', veg: false, description: 'Chicken marinated with spices for a classic grilled flavour.' },
  { name: 'Vanilla Ice Cream', price: 79, image: 'vanilla-ice-cream.jpg', category: 'Desserts', veg: true, description: 'A simple, cool and creamy dessert.' },
  { name: 'Veg Burger', price: 129, image: 'veg-burger.jpg', category: 'Fast Food', veg: true, description: 'A veggie burger with a satisfying crunch.' },
  { name: 'Veg Dum Biryani', price: 199, image: 'veg-dum-biryani.jpg', category: 'Biryani', veg: true, description: 'Aromatic rice layered with vegetables and spices.' },
  { name: 'Veg Fried Rice', price: 149, image: 'veg-fried-rice.jpg', category: 'Rice & Noodles', veg: true, description: 'Wok-fried rice with colourful vegetables.' },
  { name: 'Veg Hakka Noodles', price: 149, image: 'veg-hakka-noodles.jpg', category: 'Rice & Noodles', veg: true, description: 'Noodles tossed with vegetables and savoury seasoning.' },
  { name: 'Veg Pulao', price: 159, image: 'veg-pulao.jpg', category: 'Rice & Noodles', veg: true, description: 'Fragrant rice cooked with vegetables and whole spices.' },
]

const API_URL = 'http://localhost:5000/api/v1/foods'
const CUSTOMER_PROFILE_SYNC_URL = 'http://localhost:5000/api/v1/customers/profile/sync'


async function syncCustomerProfile(user, fullName = '') {
  if (!user) {
    throw new Error(
      'Please sign in before syncing your customer profile.'
    )
  }

  const token = await user.getIdToken(true)

  const response = await fetch(CUSTOMER_PROFILE_SYNC_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      fullName: String(
        fullName || user.displayName || ''
      ).trim(),
      phone: user.phoneNumber || '',
    }),
  })

  const result = await response.json().catch(() => ({}))

  if (!response.ok || result.success !== true) {
    throw new Error(
      result.message ||
        `Customer profile sync failed (${response.status}).`
    )
  }

  if (!result.customer) {
    throw new Error('The server did not return a customer profile.')
  }

  return result.customer
}


async function loadFoodsFromAPI() {
  try {
    const response = await fetch(API_URL)

    if (!response.ok) {
      throw new Error(`Food API returned status ${response.status}`)
    }

    const data = await response.json()

    if (!data.success || !Array.isArray(data.foods)) {
      throw new Error('Invalid food API response')
    }

    const categoryMap = {
      'Main Course': 'Indian Curry',
      Breads: 'Indian Bread',
    }

    const availableFoods = data.foods.filter(
      food => Number(food.isAvailable) === 1
    )

    const apiDishes = availableFoods.map(food => ({
      id: food.id,
      name: food.name,
      price: Number(food.price),
      image: String(food.image || '').split('/').pop(),
      category: categoryMap[food.category] || food.category,
      veg: Number(food.isVegetarian) === 1,
      description: food.description || '',
    }))

    if (apiDishes.length === 0) {
      throw new Error('No available foods returned by the API')
    }

    dishes = apiDishes
    console.info(`SpiceNest loaded ${dishes.length} foods from the API`)
    renderPage()
  } catch (error) {
    console.error('SpiceNest food API loading failed:', error.message)
  }
}

const categories = [
  'All', 'Biryani', 'South Indian', 'Vegetarian', 'Starters',
  'Rice & Noodles', 'Indian Curry', 'Grill', 'Fast Food',
  'Pizza', 'Seafood', 'Desserts', 'Beverages', 'Indian Bread',
]

const featuredNames = [
  'Chicken Dum Biryani',
  'Mutton Biryani',
  'Paneer Butter Masala',
  'Chicken 65',
]

const money = amount => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
}).format(amount)

const escapeHTML = value => String(value).replace(/[&<>"']/g, character => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}[character]))

function renderPage() {
  const app = document.getElementById('app-content')
  if (!app) return

  let page = 'login'
  let signedInUser = auth.currentUser
  let isAdminUser = false
  let selectedCategory = 'All'
  let searchText = ''
  let sortMode = 'featured'
  let vegOnly = false
  const cart = new Map()

  const logo = `
    <span class="sn-logo-symbol" aria-hidden="true">
      <span class="sn-logo-sun">✳</span>
      <span class="sn-logo-letters">S<span>N</span></span>
    </span>
    <span class="sn-logo-wordmark">
      <strong>SpiceNest</strong>
      <small>INDIAN KITCHEN &amp; DINING</small>
    </span>
  `

  app.innerHTML = `
    <main class="sn-app">
      <div class="sn-topline">
        <span>WELCOME TO SPICENEST</span>
        <span class="sn-topline-center">AUTHENTIC FLAVOURS · WARM HOSPITALITY</span>
        <span>FRESHLY PREPARED, ALWAYS</span>
      </div>

      <header class="sn-header">
        <a href="#home" class="sn-brand" data-page="home" aria-label="SpiceNest home">${logo}</a>

        <nav class="sn-nav" aria-label="Main navigation">
          <a href="#home" data-page="home" class="sn-nav-link">Home</a>
          <a href="#menu" data-page="menu" class="sn-nav-link">Menu</a>
          <a href="#about" data-page="about" class="sn-nav-link">Our Story</a>
          <a href="#contact" data-page="contact" class="sn-nav-link">Contact</a>
          <a href="#orders" data-page="orders" class="sn-nav-link">My Orders</a>
          <a href="#admin"
             data-page="admin"
             class="sn-nav-link sn-admin-dashboard-link"
             id="sn-admin-dashboard-link"
             style="display:none"
             aria-label="Open administrator dashboard">Admin Dashboard
          </a>
        </nav>

        <div class="sn-header-actions">
          <div class="sn-account-area" id="sn-account-area">
            <button class="sn-account-link" data-page="login" type="button">Sign in</button>
          </div>
          <button class="sn-cart-button" data-page="cart" type="button">
            <span class="sn-cart-icon" aria-hidden="true">♧</span>
            <span>Basket</span>
            <span class="sn-cart-badge" id="sn-cart-count">0</span>
          </button>
        </div>
      </header>

      <div id="sn-view" aria-live="polite"></div>

      <footer class="sn-footer">
        <div class="sn-footer-main">
          <div class="sn-footer-brand-block">
            <a href="#home" data-page="home" class="sn-brand">${logo}</a>
            <p>A little spice, a lot of soul.<br>Gather around something delicious.</p>
          </div>
          <div class="sn-footer-column">
            <h3>Explore</h3>
            <button data-page="home" type="button">Home</button>
            <button data-page="menu" type="button">Our Menu</button>
            <button data-page="about" type="button">Our Story</button>
          </div>
          <div class="sn-footer-column">
            <h3>Get in touch</h3>
            <button data-page="contact" type="button">Contact us</button>
            <button data-page="login" type="button">Your account</button>
            <button data-page="cart" type="button">Your basket</button>
          </div>
          <div class="sn-footer-note">
            <span class="sn-footer-flower">✳</span>
            <p>Good food tastes better<br>when shared.</p>
          </div>
        </div>
        <div class="sn-footer-bottom">
          <span>© ${new Date().getFullYear()} SpiceNest. All rights reserved.</span>
          <span>CRAFTED WITH CARE · SERVED WITH HEART</span>
        </div>
      </footer>
    </main>
  `

  const view = app.querySelector('#sn-view')

  function setAdminDashboardVisibility(visible) {
    isAdminUser = Boolean(visible)
    const adminLink = app.querySelector('#sn-admin-dashboard-link')
    if (!adminLink) return
    adminLink.style.display = isAdminUser ? 'inline-flex' : 'none'
    adminLink.setAttribute('aria-hidden', String(!isAdminUser))
  }

  function updateAccountArea() {
    const area = app.querySelector('#sn-account-area')
    if (!area) return
    if (!signedInUser) {
      area.innerHTML = '<button class="sn-account-link" data-page="login" type="button">Sign in</button>'
      return
    }
    const email = escapeHTML(signedInUser.email || 'Signed-in customer')
    const photo = signedInUser.photoURL
    const initial = escapeHTML((signedInUser.displayName || signedInUser.email || 'U').trim().charAt(0).toUpperCase())
    area.innerHTML = `
      <div class="sn-profile-wrap">
        <button class="sn-profile-button" type="button" title="${email}" aria-label="Signed in as ${email}">
          ${photo ? `<img class="sn-profile-avatar" src="${escapeHTML(photo)}" alt="Profile photo" referrerpolicy="no-referrer" onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'sn-profile-avatar sn-profile-initial',textContent:'${initial}'}))">` : `<span class="sn-profile-avatar sn-profile-initial">${initial}</span>`}
        </button>
        <div class="sn-profile-tooltip" role="tooltip">${email}</div>
        <button class="sn-account-link" data-signout type="button">Sign out</button>
      </div>`
  }

  window.addEventListener('spicenest-auth-state', event => {
    signedInUser = event.detail || null
    updateAccountArea()
    if (signedInUser && page === 'login') showPage('home')
    if (!signedInUser && (page === 'checkout' || page === 'orders')) showPage('login')
  })

  window.addEventListener('spicenest-admin-state', event => {
    setAdminDashboardVisibility(Boolean(event.detail))
  })

  function getCart() {
    const items = []
    let count = 0
    let total = 0

    cart.forEach((quantity, name) => {
      const dish = dishes.find(item => item.name === name)
      if (!dish) return
      items.push({ ...dish, quantity })
      count += quantity
      total += dish.price * quantity
    })

    return { items, count, total }
  }

  function updateCartCount() {
    const badge = app.querySelector('#sn-cart-count')
    if (badge) badge.textContent = getCart().count
  }

  function dishCard(dish, index = 0) {
    const quantity = cart.get(dish.name) || 0
    const label = dish.tag ? `<span class="sn-dish-tag">${escapeHTML(dish.tag)}</span>` : ''

    return `
      <article class="sn-dish-card">
        <div class="sn-dish-image">
          <img src="/images/dishes/${encodeURIComponent(dish.image)}"
            alt="${escapeHTML(dish.name)}" loading="lazy"
            onerror="this.style.display='none';this.parentElement.classList.add('sn-image-fallback')">
          ${label}
          <span class="sn-dish-number">${String(index + 1).padStart(2, '0')}</span>
          <span class="sn-food-type ${dish.veg ? 'sn-veg' : 'sn-nonveg'}">
            <i></i>${dish.veg ? 'VEGETARIAN' : 'NON-VEGETARIAN'}
          </span>
        </div>
        <div class="sn-dish-content">
          <p class="sn-dish-category">${escapeHTML(dish.category)}</p>
          <h3>${escapeHTML(dish.name)}</h3>
          <p class="sn-dish-description">${escapeHTML(dish.description)}</p>
          <div class="sn-dish-footer">
            <strong class="sn-price">${money(dish.price)}</strong>
            <button class="sn-add-button" type="button" data-add="${escapeHTML(dish.name)}">
              ${quantity ? `+ Add more (${quantity})` : '+ Add'}
            </button>
          </div>
        </div>
      </article>
    `
  }

  function getFilteredDishes() {
    let result = dishes.filter(dish => {
      const categoryMatch = selectedCategory === 'All' || dish.category === selectedCategory
      const searchMatch = `${dish.name} ${dish.category} ${dish.description}`
        .toLowerCase().includes(searchText)
      const vegMatch = !vegOnly || dish.veg
      return categoryMatch && searchMatch && vegMatch
    })

    if (sortMode === 'price-low') result = [...result].sort((a, b) => a.price - b.price)
    if (sortMode === 'price-high') result = [...result].sort((a, b) => b.price - a.price)
    if (sortMode === 'name') result = [...result].sort((a, b) => a.name.localeCompare(b.name))

    return result
  }

  function renderHome() {
    const featured = dishes.filter(dish => featuredNames.includes(dish.name))

    view.innerHTML = `
      <section class="sn-hero">
        <div class="sn-hero-photo"></div>
        <div class="sn-hero-shade"></div>
        <div class="sn-hero-frame"></div>

        <div class="sn-hero-copy">
          <p class="sn-eyebrow"><span></span> THE ART OF INDIAN HOSPITALITY</p>
          <h1>Where flavour<br>feels like <em>home.</em></h1>
          <p class="sn-hero-description">
            Discover comforting classics, fragrant biryanis and bold
            Indian favourites, served with a little extra warmth.
          </p>
          <div class="sn-hero-actions">
            <button class="sn-primary-button" type="button" data-page="menu">
              DISCOVER OUR MENU <span>↗</span>
            </button>
            <button class="sn-hero-secondary" type="button" data-page="about">
              THE SPICENEST STORY
            </button>
          </div>
          <div class="sn-hero-caption">
            <span>GOOD FOOD · BEAUTIFUL MOMENTS</span>
            <span>01 / SPICENEST EXPERIENCE</span>
          </div>
        </div>

        <div class="sn-hero-seal">
          <span>MADE WITH</span><b>✳</b><span>HEART &amp; SPICE</span>
        </div>
      </section>

      <section class="sn-welcome section-pad">
        <div class="sn-section-index"><span>01</span><i></i><span>OUR PHILOSOPHY</span></div>
        <div class="sn-welcome-heading">
          <p class="sn-eyebrow sn-eyebrow-dark">A SEAT AT OUR TABLE</p>
          <h2>Some meals feed you.<br><em>Some stay with you.</em></h2>
        </div>
        <div class="sn-welcome-copy">
          <p>At SpiceNest, a meal is more than what arrives at the table. It is the aroma of spices, the comfort of familiar flavours and the pleasure of sharing another helping.</p>
          <button class="sn-underlined-link" type="button" data-page="about">GET TO KNOW US <span>↗</span></button>
        </div>
      </section>

      <section class="sn-featured section-pad">
        <div class="sn-section-topline"><span>02 / FROM OUR KITCHEN</span><span>FAVOURITES WORTH SHARING</span></div>
        <div class="sn-section-heading">
          <div>
            <p class="sn-eyebrow sn-eyebrow-dark">A FEW THINGS WE LOVE</p>
            <h2>Meet the <em>favourites.</em></h2>
          </div>
          <button class="sn-outline-button" type="button" data-page="menu">VIEW THE FULL MENU ↗</button>
        </div>
        <div class="sn-dish-grid sn-featured-grid">
          ${featured.map((dish, index) => dishCard(dish, index)).join('')}
        </div>
      </section>

      <section class="sn-experience">
        <div class="sn-experience-photo"></div>
        <div class="sn-experience-content">
          <p class="sn-eyebrow"><span></span> 03 / THE SPICENEST FEELING</p>
          <h2>Come hungry.<br>Leave with a <em>story.</em></h2>
          <p>From relaxed weekday meals to long conversations over a favourite dish, we believe the best moments happen when everyone gathers around the table.</p>
          <button class="sn-primary-button sn-primary-light" type="button" data-page="menu">FIND YOUR FAVOURITE ↗</button>
        </div>
      </section>

      <section class="sn-values-strip section-pad">
        <div class="sn-value-item"><span>✳</span><div><h3>Made with care</h3><p>Thoughtful flavours in every dish.</p></div></div>
        <div class="sn-value-item"><span>✧</span><div><h3>Inspired by tradition</h3><p>Comforting food with character.</p></div></div>
        <div class="sn-value-item"><span>❋</span><div><h3>Better together</h3><p>Good food is made for sharing.</p></div></div>
      </section>

      <section class="sn-home-cta">
        <p class="sn-eyebrow sn-eyebrow-dark">YOUR TABLE IS WAITING</p>
        <h2>Make room for<br><em>something delicious.</em></h2>
        <button class="sn-primary-button" type="button" data-page="menu">EXPLORE SPICENEST ↗</button>
      </section>
    `
  }

  function renderMenu() {
    view.innerHTML = `
      <section class="sn-page-hero sn-menu-hero">
        <div class="sn-page-hero-shade"></div>
        <div class="sn-page-hero-content">
          <p class="sn-eyebrow"><span></span> FROM OUR KITCHEN TO YOUR TABLE</p>
          <h1>Explore the menu.<br><em>Find your flavour.</em></h1>
          <p>Traditional favourites, comforting classics and little treats for every kind of craving.</p>
          <div class="sn-page-hero-meta"><span>50 DISHES TO DISCOVER</span><span>PREPARED WITH HEART</span></div>
        </div>
      </section>

      <section class="sn-menu-page section-pad">
        <div class="sn-section-topline"><span>01 / THE MENU</span><span>TAKE YOUR TIME · FIND YOUR FAVOURITE</span></div>
        <div class="sn-menu-intro">
          <div><p class="sn-eyebrow sn-eyebrow-dark">WHAT ARE YOU IN THE MOOD FOR?</p><h2>A table full of <em>possibilities.</em></h2></div>
          <p>Search, browse by category, or filter vegetarian dishes. There is something for every appetite.</p>
        </div>

        <div class="sn-menu-tools">
          <label class="sn-search-box"><span aria-hidden="true">⌕</span><input id="sn-search" type="search" placeholder="Search dishes, flavours or categories..." autocomplete="off"></label>
          <select id="sn-sort" aria-label="Sort menu">
            <option value="featured">Recommended order</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
            <option value="name">Name: A to Z</option>
          </select>
          <label class="sn-veg-toggle"><input id="sn-veg-only" type="checkbox"><span class="sn-toggle-track"></span><span>Vegetarian only</span></label>
        </div>

        <div class="sn-category-bar" id="sn-categories">
          ${categories.map(item => `<button type="button" class="sn-category ${item === selectedCategory ? 'selected' : ''}" data-category="${escapeHTML(item)}">${escapeHTML(item)}</button>`).join('')}
        </div>

        <div class="sn-menu-result-line"><p id="sn-menu-count">50 dishes</p><span>GOOD TASTE STARTS HERE ↘</span></div>
        <div class="sn-dish-grid sn-menu-grid" id="sn-menu-grid"></div>
        <div class="sn-no-results" id="sn-no-results" hidden><span>✳</span><h3>No dishes found just yet.</h3><p>Try another search term or select a different category.</p><button class="sn-outline-button" id="sn-clear-filters" type="button">CLEAR FILTERS</button></div>
      </section>
    `

    const search = view.querySelector('#sn-search')
    const sort = view.querySelector('#sn-sort')
    const veg = view.querySelector('#sn-veg-only')

    function refreshMenu() {
      const filtered = getFilteredDishes()
      const grid = view.querySelector('#sn-menu-grid')
      grid.innerHTML = filtered.map((dish, index) => dishCard(dish, index)).join('')
      view.querySelector('#sn-menu-count').textContent = `${filtered.length} ${filtered.length === 1 ? 'dish' : 'dishes'} to discover`
      view.querySelector('#sn-no-results').hidden = filtered.length > 0

      view.querySelectorAll('[data-category]').forEach(button => {
        button.classList.toggle('selected', button.dataset.category === selectedCategory)
      })
    }

    search.addEventListener('input', () => {
      searchText = search.value.trim().toLowerCase()
      refreshMenu()
    })

    sort.addEventListener('change', () => {
      sortMode = sort.value
      refreshMenu()
    })

    veg.addEventListener('change', () => {
      vegOnly = veg.checked
      refreshMenu()
    })

    view.querySelector('#sn-clear-filters').addEventListener('click', () => {
      selectedCategory = 'All'
      searchText = ''
      sortMode = 'featured'
      vegOnly = false
      search.value = ''
      sort.value = 'featured'
      veg.checked = false
      refreshMenu()
    })

    refreshMenu()
  }

  function renderAbout() {
    view.innerHTML = `
      <section class="sn-page-hero sn-about-hero">
        <div class="sn-page-hero-shade"></div>
        <div class="sn-page-hero-content">
          <p class="sn-eyebrow"><span></span> OUR STORY / OUR SOUL</p>
          <h1>Rooted in flavour.<br><em>Made for togetherness.</em></h1>
          <p>Every dish has a place at the table. Every gathering deserves something delicious.</p>
          <div class="sn-page-hero-meta"><span>02 / OUR STORY</span><span>HOSPITALITY FROM THE HEART</span></div>
        </div>
      </section>

      <section class="sn-about-intro section-pad">
        <div class="sn-section-index"><span>01</span><i></i><span>WHAT WE BELIEVE</span></div>
        <div class="sn-about-intro-main"><p class="sn-eyebrow sn-eyebrow-dark">A LITTLE ABOUT SPICENEST</p><h2>Good food has a way<br>of bringing us <em>closer.</em></h2></div>
        <div class="sn-about-intro-text"><p>SpiceNest celebrates the warmth of Indian dining: the aroma of spices, the comfort of familiar recipes and the joy of sharing a meal with people who matter.</p><p>Our menu brings together South Indian favourites, hearty biryanis, comforting curries, snacks and sweet finishes. We want the experience to feel welcoming, memorable and full of character.</p><button class="sn-underlined-link" data-page="menu" type="button">EXPLORE OUR FOOD <span>↗</span></button></div>
      </section>

      <section class="sn-about-feature">
        <div class="sn-about-feature-image"></div>
        <div class="sn-about-feature-copy"><p class="sn-eyebrow"><span></span> FOOD IS A LOVE LANGUAGE</p><h2>Familiar flavours.<br><em>Beautiful memories.</em></h2><p>From a comforting everyday meal to a table filled with friends, our inspiration is simple: make food that brings people together.</p><button class="sn-light-button" data-page="menu" type="button">SEE THE MENU ↗</button></div>
      </section>

      <section class="sn-values-section section-pad">
        <div class="sn-section-heading"><div><p class="sn-eyebrow sn-eyebrow-dark">THE SPICENEST WAY</p><h2>Our values, <em>served daily.</em></h2></div></div>
        <div class="sn-values-grid">
          <article><span>01 / FLAVOUR</span><div class="sn-value-icon">✳</div><h3>Character in every bite.</h3><p>We celebrate the depth, warmth and variety of Indian flavours.</p></article>
          <article><span>02 / WELCOME</span><div class="sn-value-icon">❋</div><h3>Room at our table.</h3><p>Good hospitality means making everyone feel welcome.</p></article>
          <article><span>03 / TOGETHERNESS</span><div class="sn-value-icon">✧</div><h3>Made to be shared.</h3><p>The best meals are often the ones that turn into long conversations.</p></article>
        </div>
      </section>
    `
  }

  function renderContact() {
    view.innerHTML = `
      <section class="sn-page-hero sn-contact-hero">
        <div class="sn-page-hero-shade"></div>
        <div class="sn-page-hero-content">
          <p class="sn-eyebrow"><span></span> QUESTIONS, THOUGHTS OR FOOD TALK</p>
          <h1>Let's talk<br><em>over something delicious.</em></h1>
          <p>We would love to hear from you. Send a message to the SpiceNest team.</p>
          <div class="sn-page-hero-meta"><span>03 / CONTACT</span><span>WE'RE LISTENING</span></div>
        </div>
      </section>

      <section class="sn-contact-section section-pad">
        <div class="sn-contact-copy">
          <p class="sn-eyebrow sn-eyebrow-dark">SAY HELLO</p>
          <h2>Every good thing<br>starts with a <em>conversation.</em></h2>
          <p>Have a question about our menu or want to share feedback about your experience? Use the form and we will be ready to connect once message delivery is integrated.</p>
          <div class="sn-contact-promise"><span>✳</span><div><h3>Food brings us together.</h3><p>We value every thought, suggestion and story you share with us.</p></div></div>
          <div class="sn-contact-detail"><span>01</span><div><strong>Menu enquiries</strong><p>Ask us about the dishes featured on our menu.</p></div></div>
          <div class="sn-contact-detail"><span>02</span><div><strong>Share feedback</strong><p>Tell us what you enjoyed and what we can improve.</p></div></div>
        </div>

        <form id="sn-contact-form" class="sn-form sn-contact-form">
          <div class="sn-form-heading"><span>YOUR MESSAGE</span><h3>Write us a note.</h3><p>All fields are required for this demo.</p></div>
          <label>Full name<input name="name" required maxlength="100" placeholder="How should we address you?"></label>
          <label>Email address<input name="email" type="email" required maxlength="150" placeholder="you@example.com"></label>
          <label>What is this about?
            <select name="subject" required><option value="">Choose a topic</option><option>Menu enquiry</option><option>Feedback</option><option>Website support</option><option>Other</option></select>
          </label>
          <label>Your message<textarea name="message" required minlength="5" maxlength="2000" rows="5" placeholder="Tell us what is on your mind..."></textarea></label>
          <button class="sn-primary-button" type="submit">VALIDATE MESSAGE ↗</button>
          <p id="sn-contact-status" class="sn-form-status">This form is a frontend preview; it does not send email yet.</p>
        </form>
      </section>
            <section class="sn-customer-replies section-pad" id="sn-customer-replies">
        <div class="sn-form-heading">
          <span>YOUR CONVERSATION</span>
          <h3>Replies from SpiceNest</h3>
          <p>View responses from our team to your previous enquiries.</p>
        </div>

        <div id="sn-customer-replies-content" aria-live="polite">
          <p class="sn-form-status">
            Sign in to check replies to your enquiries.
          </p>
        </div>
      </section>
    `

   
const contactForm = view.querySelector('#sn-contact-form')
const contactStatus = view.querySelector('#sn-contact-status')
const submitButton = contactForm.querySelector('button[type="submit"]')

contactForm.addEventListener('submit', async event => {
  event.preventDefault()

  if (!contactForm.reportValidity()) return

  const formData = new FormData(contactForm)

  const payload = {
    fullName: String(formData.get('name') || '').trim(),
    email: String(formData.get('email') || '').trim(),
    subject: String(formData.get('subject') || '').trim(),
    message: String(formData.get('message') || '').trim(),
  }

  contactStatus.textContent = 'Sending your message...'
  submitButton.disabled = true
  submitButton.textContent = 'SENDING...'

  try {
    const response = await fetch('http://localhost:5000/api/v1/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const result = await response.json()

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Unable to send your message.')
    }

    contactStatus.textContent =
      'Thank you! Your message has been received by SpiceNest.'

    contactForm.reset()
  } catch (error) {
    console.error('Contact form submission failed:', error)

    contactStatus.textContent =
      error.message || 'Could not send your message. Please try again.'
  } finally {
    submitButton.disabled = false
    submitButton.textContent = 'SEND MESSAGE ↗'
  }
})
  // Load replies using the currently signed-in Firebase user.
  const repliesContent = view.querySelector('#sn-customer-replies-content')

  async function loadCustomerReplies(user) {
    if (!repliesContent) return

    if (!user) {
      repliesContent.innerHTML = `
        <p class="sn-form-status">
          Please sign in to view replies to your enquiries.
        </p>
      `
      return
    }

    repliesContent.innerHTML = `
      <p class="sn-form-status">Loading your replies...</p>
    `

    try {
      const token = await user.getIdToken()

      const response = await fetch(
        'http://localhost:5000/api/v1/contact/my-replies',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Unable to load your replies.')
      }

      const replies = Array.isArray(result.replies) ? result.replies : []

      if (replies.length === 0) {
        repliesContent.innerHTML = `
          <p class="sn-form-status">
            You don't have any admin replies yet. Please check back later.
          </p>
        `
        return
      }

      repliesContent.replaceChildren()

      replies.forEach(reply => {
        const card = document.createElement('article')
        card.className = 'sn-customer-reply-card'

        const subject = document.createElement('h4')
        subject.textContent = reply.SUBJECT || 'Your enquiry'

        const message = document.createElement('p')
        message.textContent = reply.MESSAGE || ''

        const adminReply = document.createElement('p')
        adminReply.textContent = reply.ADMIN_REPLY || ''

        const replyHeading = document.createElement('strong')
        replyHeading.textContent = 'Reply from SpiceNest'

        const date = document.createElement('p')
        date.className = 'sn-form-status'
        date.textContent = reply.REPLIED_AT
          ? `Replied: ${new Date(reply.REPLIED_AT).toLocaleString()}`
          : ''

        card.append(subject, message, replyHeading, adminReply, date)
        repliesContent.appendChild(card)
      })
    } catch (error) {
      console.error('Loading customer replies failed:', error)

      repliesContent.textContent =
        error.message || 'Unable to load your replies. Please try again.'
    }
  }

  // Load the existing session when the Contact page opens.
  loadCustomerReplies(auth.currentUser)

  // Refresh the section when the user signs in or out.
  window.addEventListener('spicenest-auth-state', event => {
    loadCustomerReplies(event.detail)
  })

  }

  function renderLogin() {
    view.innerHTML = `
      <section class="sn-login-page">
        <div class="sn-login-visual">
          <div class="sn-login-visual-shade"></div>
          <div class="sn-login-visual-content">
            <a class="sn-brand sn-login-brand" href="#login" data-page="login">${logo}</a>
            <p class="sn-eyebrow"><span></span> A PLACE AT OUR TABLE</p>
            <h1>Your favourites<br>are waiting<br><em>for you.</em></h1>
            <p>Sign in to continue your SpiceNest experience.</p>
            <div class="sn-login-visual-bottom">GOOD FOOD · WARM WELCOME · EVERY TIME</div>
          </div>
        </div>
        <div class="sn-login-panel">
          <div class="sn-login-panel-inner">
            <p class="sn-eyebrow sn-eyebrow-dark">WELCOME TO SPICENEST</p>
            <h2>Sign in to<br><em>SpiceNest.</em></h2>
            <p class="sn-login-intro">Choose the portal that matches your account.</p>

            <div class="sn-login-role-switch" role="tablist" aria-label="Choose login portal">
              <button type="button" class="sn-login-role is-active" data-login-role="customer" role="tab" aria-selected="true">Customer Login</button>
              <button type="button" class="sn-login-role" data-login-role="admin" role="tab" aria-selected="false">Admin Login</button>
            </div>

            <form id="sn-login-form" class="sn-form">
              <p class="sn-login-role-note" id="sn-login-role-note">Sign in to browse the menu, place demo orders and view your order history.</p>
              <label id="sn-full-name-label" hidden>Full name<input name="fullName" type="text" autocomplete="name" maxlength="120" placeholder="Your full name"></label>
              <label>Email address<input name="email" type="email" autocomplete="off" autocapitalize="none" spellcheck="false" required maxlength="150" placeholder="you@example.com"></label>
              <label class="sn-password-label">Password
                <span class="sn-password-wrap">
                  <input id="sn-login-password" name="password" type="password" autocomplete="new-password" minlength="6" required placeholder="Enter your password">
                  <button class="sn-password-toggle" type="button" aria-label="Show password" aria-pressed="false" data-toggle-password>
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  </button>
                </span>
              </label>
              <div class="sn-login-utility-row" id="sn-customer-utilities">
                <button type="button" class="sn-login-text-button" data-login-action="forgot">Forgot password?</button>
                <button type="button" class="sn-login-text-button" data-login-action="register">Create account</button>
              </div>
              <button class="sn-primary-button sn-login-submit" type="submit" id="sn-login-submit">CUSTOMER SIGN IN ↗</button>
              <button class="sn-google-preview-button" type="button" data-login-action="google">
                <svg class="sn-google-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
                  <path fill="#4285F4" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.6c3.9-3.6 6.1-8.8 6.1-15Z" />
                  <path fill="#34A853" d="M24 44c5.5 0 10.1-1.8 13.5-4.8l-6.6-5.1c-1.8 1.2-4.1 2-6.9 2-5.3 0-9.8-3.6-11.4-8.4H5.8v5.3A20 20 0 0 0 24 44Z" />
                  <path fill="#FBBC05" d="M12.6 27.7a12 12 0 0 1 0-7.4V15H5.8a20 20 0 0 0 0 18l6.8-5.3Z" />
                  <path fill="#EA4335" d="M24 12.1c3 0 5.7 1 7.8 3.1l5.8-5.8C34.1 6.1 29.5 4 24 4A20 20 0 0 0 5.8 15l6.8 5.3c1.6-4.8 6.1-8.2 11.4-8.2Z" />
                </svg>
                <span>Continue with Google</span>
              </button>
              <p id="sn-login-status" class="sn-form-status" role="status" aria-live="polite">Customer authentication is provided by Firebase.</p>
            </form>
            <div class="sn-login-divider"><span></span><small>ACCOUNT ACCESS</small><span></span></div>
            <p class="sn-login-footnote" id="sn-login-footnote">Customer registration and Google sign-in use Firebase. Customer profiles are synchronized with Oracle.</p>
          </div>
        </div>
      </section>
    `

    let loginRole = 'customer'
    let isRegistering = false
    const form = view.querySelector('#sn-login-form')
    const password = view.querySelector('#sn-login-password')
    const fullNameLabel = view.querySelector('#sn-full-name-label')
    const fullNameInput = form.elements.fullName
    const toggleButton = view.querySelector('[data-toggle-password]')
    const roleNote = view.querySelector('#sn-login-role-note')
    const utilities = view.querySelector('#sn-customer-utilities')
    const submitButton = view.querySelector('#sn-login-submit')
    const googleButton = view.querySelector('[data-login-action="google"]')
    const registerButton = view.querySelector('[data-login-action="register"]')
    const footnote = view.querySelector('#sn-login-footnote')
    const status = view.querySelector('#sn-login-status')

    function setLoginRole(role) {
      loginRole = role
      if (role === 'customer') setAdminDashboardVisibility(false)
      isRegistering = false
      fullNameLabel.hidden = true
      fullNameInput.required = false
      fullNameInput.value = ''
      if (registerButton) registerButton.textContent = 'Create account'
      view.querySelectorAll('[data-login-role]').forEach(button => {
        const active = button.dataset.loginRole === role
        button.classList.toggle('is-active', active)
        button.setAttribute('aria-selected', String(active))
      })
      roleNote.textContent = role === 'customer'
        ? 'Sign in to browse the menu, place demo orders and view your order history.'
        : 'Admin access is restricted to approved administrator accounts.'
      utilities.hidden = role !== 'customer'
      googleButton.hidden = role !== 'customer'
      submitButton.textContent = role === 'customer' ? 'CUSTOMER SIGN IN ↗' : 'ADMIN SIGN IN ↗'
      footnote.textContent = role === 'customer'
        ? 'Customer registration and Google sign-in use Firebase. Customer profiles are synchronized with Oracle.'
        : 'Admin access will be verified by the backend against the approved admin allowlist. This frontend preview cannot grant admin privileges.'
      status.textContent = role === 'customer'
        ? 'Preview only. Secure customer authentication is not connected yet.'
        : 'Admin authentication is not connected. No admin access is granted by this page.'
    }

    view.querySelectorAll('[data-login-role]').forEach(button => {
      button.addEventListener('click', () => setLoginRole(button.dataset.loginRole))
    })

    toggleButton.addEventListener('click', () => {
      const shouldShow = password.type === 'password'
      password.type = shouldShow ? 'text' : 'password'
      toggleButton.setAttribute('aria-label', shouldShow ? 'Hide password' : 'Show password')
      toggleButton.setAttribute('aria-pressed', String(shouldShow))
      toggleButton.innerHTML = shouldShow
        ? `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.9 5.2A10.8 10.8 0 0112 5c6.4 0 10 7 10 7s-1.1 2.1-3.2 3.8M6.2 6.2C3.5 8 2 12 2 12s3.6 7 10 7a10 10 0 004-.8"></path></svg>`
        : `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"></path><circle cx="12" cy="12" r="3"></circle></svg>`
    })

    view.querySelectorAll('[data-login-action]').forEach(button => {
      button.addEventListener('click', () => {
        const action = button.dataset.loginAction

        if (action === 'register' && loginRole === 'customer') {
          isRegistering = !isRegistering
          fullNameLabel.hidden = !isRegistering
          fullNameInput.required = isRegistering
          submitButton.textContent = isRegistering
            ? 'CREATE ACCOUNT ↗'
            : 'CUSTOMER SIGN IN ↗'
          registerButton.textContent = isRegistering
            ? 'Back to sign in'
            : 'Create account'
          status.textContent = isRegistering
            ? 'Create your SpiceNest customer account.'
            : 'Sign in with your existing account.'
          return
        }

        if (action === 'forgot') {
          status.textContent = 'Password recovery will be connected in the next step.'
        } else if (action === 'google') {
          if (loginRole !== 'customer') return
          googleButton.disabled = true
          status.textContent = 'Opening Google sign-in...'
          authReady
            .then(() => setPersistence(auth, browserSessionPersistence))
            .then(() => signInWithPopup(auth, new GoogleAuthProvider()))
            .then(async result => {
              signedInUser = result.user
              setAdminDashboardVisibility(false)
              updateAccountArea()
              try {
                await syncCustomerProfile(result.user)
                status.textContent = 'Google sign-in successful. Your customer profile is synchronized.'
              } catch (syncError) {
                status.textContent = `Signed in, but the customer profile could not be saved: ${syncError.message}`
                console.error('SpiceNest Google profile sync failed:', syncError.message)
              }
              showPage('home')
            })
            .catch(error => {
              const messages = {
                'auth/popup-closed-by-user': 'Google sign-in was cancelled. Please try again.',
                'auth/popup-blocked': 'Your browser blocked the Google sign-in popup. Allow popups and try again.',
                'auth/unauthorized-domain': 'This website domain is not authorized in Firebase Authentication settings.',
                'auth/account-exists-with-different-credential': 'An account already exists with this email using another sign-in method.'
              }
              status.textContent = messages[error.code] || 'Google sign-in failed. Please try again.'
              console.error('SpiceNest Google authentication:', error.code)
            })
            .finally(() => { googleButton.disabled = false })
        }
      })
    })

    form.addEventListener('submit', async event => {
      event.preventDefault()
      if (!form.reportValidity()) return

      
if (loginRole === 'admin') {
  const email = form.elements.email.value.trim()
  const passwordValue = form.elements.password.value

  submitButton.disabled = true
  status.textContent = 'Verifying administrator access...'

  try {
    await authReady
    await setPersistence(auth, browserLocalPersistence)

    const credential = await signInWithEmailAndPassword(
      auth,
      email,
      passwordValue
    )

    const token = await credential.user.getIdToken(true)

    const response = await fetch(
      'http://localhost:5000/api/v1/admin/access-check',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    const result = await response.json()

    if (!response.ok || !result.success) {
      await signOut(auth)
      throw new Error(
        result.message || 'This account is not authorized for admin access.'
      )
    }

    signedInUser = credential.user
    setAdminDashboardVisibility(true)
    updateAccountArea()
    status.textContent = 'Administrator verified successfully.'

    showPage('admin')
  } catch (error) {
    const messages = {
      'auth/invalid-credential': 'Email or password is incorrect.',
      'auth/too-many-requests': 'Too many attempts. Please try again later.',
      'auth/network-request-failed': 'Network error. Check your connection.',
    }

    status.textContent =
      messages[error.code] ||
      error.message ||
      'Admin sign-in failed.'

    console.error('SpiceNest admin sign-in failed:', error.code || error.message)
  } finally {
    submitButton.disabled = false
  }

  return
}


      const email = form.elements.email.value.trim()
      const passwordValue = form.elements.password.value

      submitButton.disabled = true
      status.textContent = isRegistering
        ? 'Creating your account...'
        : 'Signing you in...'

      try {
        await authReady
        await setPersistence(auth, browserSessionPersistence)
        let credential
        const registeringNow = isRegistering
        if (registeringNow) {
          credential = await createUserWithEmailAndPassword(auth, email, passwordValue)
        } else {
          credential = await signInWithEmailAndPassword(auth, email, passwordValue)
        }
        signedInUser = credential.user
        setAdminDashboardVisibility(false)
        updateAccountArea()

        try {
          await syncCustomerProfile(
            credential.user,
            registeringNow ? fullNameInput.value : ''
          )
          status.textContent = registeringNow
            ? 'Account created and customer profile saved successfully!'
            : 'Signed in and customer profile synchronized successfully.'
        } catch (syncError) {
          status.textContent = `You are signed in, but your customer profile could not be saved: ${syncError.message}`
          console.error('SpiceNest customer profile sync failed:', syncError.message)
        }

        isRegistering = false
        fullNameLabel.hidden = true
        fullNameInput.required = false
        showPage('home')
      } catch (error) {
        const messages = {
          'auth/email-already-in-use': 'An account already exists with this email. Please sign in.',
          'auth/invalid-email': 'Please enter a valid email address.',
          'auth/weak-password': 'Choose a stronger password with at least 6 characters.',
          'auth/invalid-credential': 'Email or password is incorrect.',
          'auth/user-not-found': 'No account was found. Please create an account.',
          'auth/wrong-password': 'Email or password is incorrect.',
          'auth/too-many-requests': 'Too many attempts. Please wait and try again.',
          'auth/network-request-failed': 'Network error. Check your internet connection and try again.',
        }
        status.textContent = messages[error.code] || 'Authentication failed. Please try again.'
        console.error('SpiceNest customer authentication:', error.code)
      } finally {
        submitButton.disabled = false
      }
    })

    setLoginRole('customer')
  }

  function renderCart() {
    const { items, count, total } = getCart()

    view.innerHTML = `
      <section class="sn-page-hero sn-basket-hero">
        <div class="sn-page-hero-shade"></div>
        <div class="sn-page-hero-content">
          <p class="sn-eyebrow"><span></span> YOUR SELECTION</p>
          <h1>A basket full<br><em>of good things.</em></h1>
          <p>All the dishes you love, gathered in one place.</p>
          <div class="sn-page-hero-meta"><span>04 / YOUR BASKET</span><span>${count} ${count === 1 ? 'ITEM' : 'ITEMS'}</span></div>
        </div>
      </section>

      <section class="sn-basket-section section-pad">
        ${items.length ? `
          <div class="sn-basket-layout">
            <div class="sn-basket-list">
              <div class="sn-basket-list-heading"><h2>Your selections</h2><span>${count} ${count === 1 ? 'item' : 'items'}</span></div>
              ${items.map(item => `
                <article class="sn-basket-item">
                  <img src="/images/dishes/${encodeURIComponent(item.image)}" alt="${escapeHTML(item.name)}" onerror="this.style.opacity='.15'">
                  <div class="sn-basket-item-info"><small>${escapeHTML(item.category)}</small><h3>${escapeHTML(item.name)}</h3><p>${money(item.price)} each</p></div>
                  <div class="sn-quantity"><button type="button" data-minus="${escapeHTML(item.name)}" aria-label="Remove one ${escapeHTML(item.name)}">−</button><strong>${item.quantity}</strong><button type="button" data-plus="${escapeHTML(item.name)}" aria-label="Add one ${escapeHTML(item.name)}">+</button></div>
                  <strong class="sn-basket-line-total">${money(item.price * item.quantity)}</strong>
                </article>
              `).join('')}
            </div>
            <aside class="sn-order-summary">
              <p class="sn-eyebrow sn-eyebrow-dark">YOUR ORDER</p>
              <h2>A little something <em>delicious.</em></h2>
              <div class="sn-summary-line"><span>Items (${count})</span><span>${money(total)}</span></div>
              <div class="sn-summary-line"><span>Delivery</span><span>Calculated later</span></div>
              <div class="sn-summary-total"><span>Subtotal</span><strong>${money(total)}</strong></div>
              <p class="sn-summary-note">Delivery charges, address validation and checkout will be connected to the backend later.</p>
              <button type="button" class="sn-primary-button sn-summary-button" data-checkout-preview>CONTINUE TO CHECKOUT ↗</button>
              <button type="button" class="sn-underlined-link" data-page="menu">CONTINUE BROWSING</button>
              <p id="sn-checkout-status" class="sn-form-status" hidden></p>
            </aside>
          </div>
        ` : `
          <div class="sn-empty-basket">
            <div class="sn-empty-basket-mark">✳</div>
            <p class="sn-eyebrow sn-eyebrow-dark">A LITTLE SPACE FOR SOMETHING GOOD</p>
            <h2>Your basket is<br><em>waiting to be filled.</em></h2>
            <p>Explore our menu and add something delicious to get started.</p>
            <button class="sn-primary-button" type="button" data-page="menu">DISCOVER THE MENU ↗</button>
          </div>
        `}
      </section>
    `
  }


  function orderStorageKey(uid = signedInUser?.uid) {
    return uid ? `spicenest_demo_orders_${uid}` : null
  }

  function readSavedOrders() {
    const key = orderStorageKey()
    if (!key) return []
    try {
      const saved = JSON.parse(localStorage.getItem(key) || '[]')
      return Array.isArray(saved) ? saved.filter(order => order.userId === signedInUser.uid) : []
    } catch {
      return []
    }
  }

  function saveDemoOrder(order) {
    if (!signedInUser?.uid) throw new Error('Customer sign-in is required to save an order.')
    const key = orderStorageKey(order.userId)
    const orders = readSavedOrders()
    orders.unshift(order)
    localStorage.setItem(key, JSON.stringify(orders))
  }

  
function renderOrderConfirmation(order) {
  const customerName = order.customer?.fullName || 'Customer';
  const orderReference = order.orderId ?? order.id ?? 'Confirmed';
  const placedAt = order.placedAt || order.orderDate || new Date().toLocaleString('en-IN');

  const items = Array.isArray(order.items) ? order.items : [];
  const deliveryFee = Number(order.deliveryFee ?? 0);
  const discount = Number(order.discount ?? 0);
  const total = Number(order.total ?? order.totalAmount ?? 0);

  view.innerHTML = `
    <section class="sn-order-result section-pad">
      <div class="sn-order-result-card">
        <div class="sn-order-result-icon">✓</div>
        <p class="sn-eyebrow sn-eyebrow-dark">SPICENEST ORDER CONFIRMATION</p>
        <h1>Your order is<br><em>placed!</em></h1>
        <p class="sn-order-result-lead">
          Thank you, ${escapeHTML(customerName)}. Your order has been submitted successfully.
        </p>

        <div class="sn-order-number">
          <span>ORDER REFERENCE</span>
          <strong>${escapeHTML(String(orderReference))}</strong>
          <small>Placed ${escapeHTML(String(placedAt))}</small>
        </div>

        <div class="sn-order-result-summary">
          ${items.map(item => {
            const name = item.name || item.foodName || 'Food item';
            const quantity = Number(item.quantity || 1);
            const price = Number(item.price ?? item.unitPrice ?? 0);

            return `
              <div>
                <span>${escapeHTML(name)} × ${quantity}</span>
                <strong>${money(price * quantity)}</strong>
              </div>
            `;
          }).join('')}

          ${deliveryFee > 0 ? `
            <div>
              <span>Delivery fee</span>
              <strong>${money(deliveryFee)}</strong>
            </div>
          ` : ''}

          ${discount > 0 ? `
            <div>
              <span>Discount</span>
              <strong>−${money(discount)}</strong>
            </div>
          ` : ''}

          <div class="sn-order-result-total">
            <span>Order total</span>
            <strong>${money(total)}</strong>
          </div>
        </div>

        <p class="sn-order-demo-note">
          Payment method: ${escapeHTML(order.paymentMethod || order.paymentLabel || 'Cash on Delivery')}.
          You can check your order status in My Orders.
        </p>

        <div class="sn-order-result-actions">
          <button class="sn-primary-button" type="button" data-page="orders">
            TRACK MY ORDER ↗
          </button>
          <button class="sn-underlined-link" type="button" data-page="menu">
            CONTINUE BROWSING
          </button>
        </div>
      </div>
    </section>`;
}

  

async function renderOrders() {
  const API_ORDERS_URL = 'http://localhost:5000/api/v1/orders';

  view.innerHTML = `
    <section class="sn-page-hero sn-basket-hero">
      <div class="sn-page-hero-shade"></div>
      <div class="sn-page-hero-content">
        <p class="sn-eyebrow"><span></span> YOUR SPICENEST ACCOUNT</p>
        <h1>My orders.<br><em>Every detail, together.</em></h1>
        <p>Track current orders and revisit completed purchases.</p>
        <div class="sn-page-hero-meta">
          <span>MY ORDERS</span>
          <span>LOADING…</span>
        </div>
      </div>
    </section>
    <section class="sn-orders-section section-pad">
      <p>Loading your orders…</p>
    </section>
  `;

  try {
    const user = auth.currentUser || signedInUser;

    if (!user) {
      throw new Error('Please sign in to view your orders.');
    }

    const token = await user.getIdToken();

    const response = await fetch(API_ORDERS_URL, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || data.success === false) {
      throw new Error(
        data.message || data.error || 'Unable to load your orders.'
      );
    }

    const orders = Array.isArray(data.orders) ? data.orders : [];

    const getValue = (object, ...keys) => {
      for (const key of keys) {
        if (object?.[key] !== undefined && object[key] !== null) {
          return object[key];
        }
      }
      return '';
    };

    const formatDate = value => {
      if (!value) return 'Date unavailable';

      const date = new Date(value);
      return Number.isNaN(date.getTime())
        ? String(value)
        : date.toLocaleString('en-IN');
    };

    const formatStatus = value => {
      const status = String(value || 'PLACED').replace(/[_-]+/g, ' ');
      return status.charAt(0) + status.slice(1).toLowerCase();
    };

    const trackingSteps = [
      'Order received',
      'Confirmed',
      'Preparing',
      'Out for delivery',
      'Delivered'
    ];

    const getTrackingIndex = status => {
      const value = String(status || '').toUpperCase();

      if (value.includes('CANCEL')) return -1;
      if (value.includes('DELIVER')) return 4;
      if (
        value.includes('OUT_FOR_DELIVERY') ||
        value.includes('OUT FOR DELIVERY')
      ) return 3;
      if (value.includes('PREPAR')) return 2;
      if (value.includes('CONFIRM') || value.includes('ACCEPT')) return 1;

      return 0;
    };

    const isOrderDelivered = order => {
      const status = String(
        getValue(order, 'ORDER_STATUS', 'orderStatus', 'status')
      ).trim().toUpperCase();

      return status === 'DELIVERED';
    };

    const isPaymentPaid = order => {
      const status = String(
        getValue(order, 'PAYMENT_STATUS', 'paymentStatus')
      ).trim().toUpperCase();

      return status === 'PAID';
    };

    const activeOrders = orders.filter(order =>
      !(
        isOrderDelivered(order) &&
        isPaymentPaid(order)
      )
    );

    const orderHistory = orders.filter(order =>
      isOrderDelivered(order) &&
      isPaymentPaid(order)
    );

    const renderOrderCard = (order, showTracking) => {
      const orderId = getValue(order, 'ORDER_ID', 'orderId', 'id');
      const orderDate = getValue(order, 'ORDER_DATE', 'orderDate', 'placedAt');
      const status = getValue(
        order, 'ORDER_STATUS', 'orderStatus', 'status'
      ) || 'PLACED';

      const paymentMethod = getValue(
        order, 'PAYMENT_METHOD', 'paymentMethod', 'paymentLabel'
      ) || 'Cash on Delivery';

      const paymentStatus = getValue(
        order, 'PAYMENT_STATUS', 'paymentStatus'
      );

      const total = Number(
        getValue(order, 'TOTAL_AMOUNT', 'totalAmount', 'total') || 0
      );

      const address = getValue(
        order, 'DELIVERY_ADDRESS', 'deliveryAddress', 'address'
      );

      const items = Array.isArray(order.items) ? order.items : [];
      const currentStep = getTrackingIndex(status);

      return `
        <article class="sn-order-card">
          <div class="sn-order-card-top">
            <div>
              <span class="sn-order-kicker">ORDER REFERENCE</span>
              <h2>${escapeHTML(String(orderId || 'Unavailable'))}</h2>
              <p>${escapeHTML(formatDate(orderDate))}</p>
            </div>
            <span class="sn-order-status">
              ${escapeHTML(formatStatus(status))}
            </span>
          </div>

          <div class="sn-order-card-items">
            ${
              items.length
                ? items.map(item => {
                    const name = getValue(
                      item, 'FOOD_NAME', 'foodName', 'name'
                    ) || 'Food item';

                    const quantity = Number(
                      getValue(item, 'QUANTITY', 'quantity') || 1
                    );

                    const price = Number(
                      getValue(
                        item, 'UNIT_PRICE', 'unitPrice', 'PRICE', 'price'
                      ) || 0
                    );

                    return `
                      <div>
                        <span>${escapeHTML(String(name))} × ${quantity}</span>
                        <strong>${money(price * quantity)}</strong>
                      </div>
                    `;
                  }).join('')
                : '<p>Order item details are not available from the server.</p>'
            }
          </div>

          <div class="sn-order-card-bottom">
            <div>
              <small>Payment method</small>
              <strong>${escapeHTML(String(paymentMethod))}</strong>
              ${
                paymentStatus
                  ? `<small>Payment status: ${escapeHTML(String(paymentStatus))}</small>`
                  : ''
              }
            </div>
            <div>
              <small>Order total</small>
              <strong>${money(total)}</strong>
            </div>
          </div>

          ${
            showTracking
              ? `
                <div class="sn-order-tracking">
                  <h3>Track this order</h3>
                  ${
                    currentStep === -1
                      ? '<p class="sn-order-tracking-note">This order has been cancelled.</p>'
                      : `
                        <p class="sn-order-tracking-note">
                          Current status: ${escapeHTML(formatStatus(status))}
                        </p>
                        <ol class="sn-tracking-timeline">
                          ${trackingSteps.map((step, index) => {
                            const completed = index <= currentStep;
                            const current = index === currentStep;

                            return `
                              <li class="sn-tracking-step ${current ? 'is-current' : ''}">
                                <span class="sn-tracking-dot" aria-hidden="true"></span>
                                <span>${step}</span>
                                ${
                                  current
                                    ? '<strong>Current</strong>'
                                    : `<small>${completed ? 'Completed' : 'Pending'}</small>`
                                }
                              </li>
                            `;
                          }).join('')}
                        </ol>
                      `
                  }
                </div>
              `
              : `
                <p class="sn-order-tracking-note">
                  <strong>Completed:</strong> This order has been delivered and paid.
                </p>
              `
          }

          ${
            address
              ? `
                <details class="sn-order-address">
                  <summary>View delivery details</summary>
                  <p>${escapeHTML(
                    typeof address === 'string'
                      ? address
                      : JSON.stringify(address)
                  )}</p>
                </details>
              `
              : ''
          }
        </article>
      `;
    };

    const renderGroup = (title, groupOrders, showTracking) => {
      if (!groupOrders.length) {
        return `
          <section class="sn-order-group">
            <h2 class="sn-order-group-title">${title}</h2>
            <div class="sn-empty-basket">
              <p>
                ${
                  showTracking
                    ? 'You have no active orders right now.'
                    : 'Your completed orders will appear here.'
                }
              </p>
            </div>
          </section>
        `;
      }

      return `
        <section class="sn-order-group">
          <h2 class="sn-order-group-title">${title}</h2>
          <div class="sn-orders-list">
            ${groupOrders.map(order =>
              renderOrderCard(order, showTracking)
            ).join('')}
          </div>
        </section>
      `;
    };

    view.innerHTML = `
      <section class="sn-page-hero sn-basket-hero">
        <div class="sn-page-hero-shade"></div>
        <div class="sn-page-hero-content">
          <p class="sn-eyebrow"><span></span> YOUR SPICENEST ACCOUNT</p>
          <h1>My orders.<br><em>Every detail, together.</em></h1>
          <p>Track current orders and revisit completed purchases.</p>
          <div class="sn-page-hero-meta">
            <span>MY ORDERS</span>
            <span>${orders.length} ${orders.length === 1 ? 'ORDER' : 'ORDERS'}</span>
          </div>
        </div>
      </section>

      <section class="sn-orders-section section-pad">
        ${renderGroup('Active Orders', activeOrders, true)}
        ${renderGroup('Order History', orderHistory, false)}
      </section>
    `;
  } catch (error) {
    console.error('Failed to load SpiceNest orders:', error);

    view.innerHTML = `
      <section class="sn-orders-section section-pad">
        <div class="sn-empty-basket sn-orders-empty">
          <p class="sn-eyebrow sn-eyebrow-dark">MY ORDERS</p>
          <h2>We couldn't load <em>your orders.</em></h2>
          <p>${escapeHTML(error.message || 'Please sign in and try again.')}</p>
          <button class="sn-primary-button" type="button" data-page="orders">
            TRY AGAIN ↻
          </button>
        </div>
      </section>
    `;
  }
}
  function renderAdmin() {
    view.innerHTML = `
      <section class="sn-orders-section section-pad">
        <p class="sn-eyebrow sn-eyebrow-dark">SPICENEST ADMINISTRATION</p>
        <h1>Admin Dashboard</h1>
        <p>Signed in as an authorized administrator.</p>

        <div class="sn-values-grid">
          <article>
            <span>01 / MENU</span>
            <h3>Food Management</h3>
            <p>Manage the restaurant menu.</p>
            <button class="sn-primary-button" type="button" data-admin-action="foods">
              Manage Foods
            </button>
          </article>

          <article>
            <span>02 / ORDERS</span>
            <h3>Order Management</h3>
            <p>Review and manage customer orders.</p>
            <button class="sn-primary-button" type="button" data-admin-action="orders">
              Manage Orders
            </button>
          </article>

          <article>
            <span>03 / ACCOUNT</span>
            <h3>Administrator</h3>
            <p>Access is restricted by the backend allowlist.</p>
            <button class="sn-underlined-link" type="button" data-signout>
              Sign Out
            </button>
          </article>
        </div>

        <p class="sn-form-status" id="sn-admin-status" role="status">
          Dashboard layout loaded. Food and order management APIs are not connected yet.
        </p>
      </section>
    `
  }


  
function renderCheckout() {
  const { items, count, total } = getCart()

  if (!items.length) {
    view.innerHTML = `
      <section class="sn-checkout-page section-pad">
        <div class="sn-empty-basket">
          <p class="sn-eyebrow sn-eyebrow-dark">YOUR TABLE IS WAITING</p>
          <h2>Your basket is <em>empty.</em></h2>
          <p>Add dishes before continuing to checkout.</p>
          <button class="sn-primary-button" type="button" data-page="menu">
            EXPLORE THE MENU ↗
          </button>
        </div>
      </section>`
    return
  }

  const deliveryFee = 40
  let couponDiscount = 0

  view.innerHTML = `
    <section class="sn-page-hero sn-basket-hero">
      <div class="sn-page-hero-shade"></div>
      <div class="sn-page-hero-content">
        <p class="sn-eyebrow"><span></span> ALMOST AT YOUR TABLE</p>
        <h1>Make it a<br><em>delicious delivery.</em></h1>
        <p>Share your details and choose how you would like to pay.</p>
        <div class="sn-page-hero-meta">
          <span>05 / CHECKOUT</span>
          <span>${count} ${count === 1 ? 'ITEM' : 'ITEMS'}</span>
        </div>
      </div>
    </section>

    <section class="sn-checkout-section section-pad">
      <form id="sn-checkout-form" class="sn-checkout-layout">
        <div class="sn-checkout-main">
          <section class="sn-checkout-card">
            <div class="sn-checkout-heading">
              <span>01 / WHO'S ORDERING?</span>
              <h2>Customer details</h2>
              <p>Enter your details for your order.</p>
            </div>
            <div class="sn-checkout-fields">
              <label>
                Full name
                <input name="fullName" autocomplete="name"
                  required maxlength="100"
                  placeholder="Enter your full name">
              </label>
              <label>
                Mobile number
                <input name="phone" type="tel" inputmode="numeric"
                  autocomplete="tel" pattern="[0-9]{10}"
                  minlength="10" maxlength="10" required
                  placeholder="10-digit mobile number">
              </label>
              <label>
                Email address
                <input name="email" type="email" autocomplete="email"
                  maxlength="150" placeholder="you@example.com (optional)">
              </label>
            </div>
          </section>

          <section class="sn-checkout-card">
            <div class="sn-checkout-heading">
              <span>02 / WHERE SHOULD WE DELIVER?</span>
              <h2>Delivery address</h2>
              <p>Enter a complete delivery address.</p>
            </div>
            <div class="sn-checkout-fields">
              <label class="sn-field-full">
                House / flat, street
                <input name="address" autocomplete="street-address"
                  required maxlength="180"
                  placeholder="Door number, street and landmark">
              </label>
              <label>
                Area / locality
                <input name="area" required maxlength="100"
                  placeholder="Area or locality">
              </label>
              <label>
                City
                <input name="city" autocomplete="address-level2"
                  required maxlength="80" placeholder="City">
              </label>
              <label>
                State
                <input name="state" autocomplete="address-level1"
                  required maxlength="80" placeholder="State">
              </label>
              <label>
                PIN code
                <input name="pincode" inputmode="numeric"
                  pattern="[0-9]{6}" minlength="6" maxlength="6"
                  autocomplete="postal-code" required
                  placeholder="6-digit PIN code">
              </label>
              <label class="sn-field-full">
                Delivery instructions
                <textarea name="instructions" rows="3" maxlength="500"
                  placeholder="Optional delivery directions"></textarea>
              </label>
            </div>
          </section>

          <section class="sn-checkout-card">
            <div class="sn-checkout-heading">
              <span>03 / PAYMENT</span>
              <h2>Choose a payment method</h2>
              <p>Only Cash on Delivery is available for the current integration step.</p>
            </div>
            <div class="sn-payment-options">
              <label class="sn-payment-option">
                <input type="radio" name="payment" value="cod" checked>
                <span>
                  <strong>Cash on Delivery</strong>
                  <small>Pay when your order arrives</small>
                </span>
                <b>₹</b>
              </label>
            </div>
            <p class="sn-checkout-safety">
              Online payment is not integrated. Never enter your card PIN,
              CVV or UPI PIN on this page.
            </p>
          </section>

          <section class="sn-checkout-card">
            <div class="sn-checkout-heading">
              <span>04 / ANYTHING ELSE?</span>
              <h2>Order notes</h2>
            </div>
            <label class="sn-notes-label">
              Special requests (optional)
              <textarea name="orderNotes" rows="3" maxlength="500"
                placeholder="Spice preference or other food-related request"></textarea>
            </label>
          </section>
        </div>

        <aside class="sn-checkout-summary">
          <p class="sn-eyebrow sn-eyebrow-dark">YOUR ORDER</p>
          <h2>A little something <em>delicious.</em></h2>

          <div class="sn-checkout-items">
            ${items.map(item => `
              <div class="sn-checkout-item">
                <img
                  src="/images/dishes/${encodeURIComponent(item.image)}"
                  alt="${escapeHTML(item.name)}"
                  onerror="this.style.opacity='.15'">
                <div>
                  <strong>${escapeHTML(item.name)}</strong>
                  <small>Qty ${item.quantity} × ${money(item.price)}</small>
                </div>
                <b>${money(item.price * item.quantity)}</b>
              </div>
            `).join('')}
          </div>

          <div class="sn-coupon-row">
            <label for="sn-coupon">Coupon code</label>
            <div>
              <input id="sn-coupon" name="coupon" maxlength="30"
                placeholder="Try SPICE10">
              <button type="button" id="sn-apply-coupon">Apply</button>
            </div>
            <p id="sn-coupon-status" aria-live="polite">
              Optional demo coupon: SPICE10
            </p>
          </div>

          <div class="sn-summary-line">
            <span>Items (${count})</span>
            <span>${money(total)}</span>
          </div>
          <div class="sn-summary-line">
            <span>Estimated delivery</span>
            <span>${money(deliveryFee)}</span>
          </div>
          <div class="sn-summary-line" id="sn-discount-line" hidden>
            <span>Coupon discount</span>
            <span id="sn-discount-value">−${money(0)}</span>
          </div>
          <div class="sn-summary-total">
            <span>Estimated total</span>
            <strong id="sn-checkout-total">${money(total + deliveryFee)}</strong>
          </div>

          <p class="sn-checkout-disclaimer">
            The server must calculate and verify final prices and discounts
            before an order is saved.
          </p>

          <button class="sn-primary-button sn-summary-button" type="submit">
            PLACE ORDER ↗
          </button>
          <button class="sn-underlined-link" type="button" data-page="cart">
            ← BACK TO BASKET
          </button>
          <p id="sn-checkout-status" class="sn-form-status"
            role="status" aria-live="polite">
            Order submission will be enabled after the backend POST endpoint
            is implemented.
          </p>
        </aside>
      </form>
    </section>
  `

  const couponInput = view.querySelector('#sn-coupon')
  const couponStatus = view.querySelector('#sn-coupon-status')
  const discountLine = view.querySelector('#sn-discount-line')
  const discountValue = view.querySelector('#sn-discount-value')
  const totalLabel = view.querySelector('#sn-checkout-total')
  const status = view.querySelector('#sn-checkout-status')
  const checkoutForm = view.querySelector('#sn-checkout-form')
  const submitButton = checkoutForm.querySelector('[type="submit"]')

  view.querySelector('#sn-apply-coupon').addEventListener('click', () => {
    const code = couponInput.value.trim().toUpperCase()

    if (code === 'SPICE10') {
      couponDiscount = Math.round(total * 0.10)
      couponStatus.textContent =
        `Demo coupon applied: 10% off items (−${money(couponDiscount)}).`
      discountLine.hidden = false
      discountValue.textContent = `−${money(couponDiscount)}`
    } else {
      couponDiscount = 0
      couponStatus.textContent = code
        ? 'That demo coupon is not recognised.'
        : 'Enter SPICE10 to preview a 10% item discount.'
      discountLine.hidden = true
    }

    totalLabel.textContent =
      money(Math.max(0, total + deliveryFee - couponDiscount))

    status.textContent =
      'These are estimated totals. The backend must verify the final amount.'
  })

  checkoutForm.addEventListener('submit', async event => {
    event.preventDefault()

    if (!checkoutForm.reportValidity()) return

    if (!signedInUser?.uid) {
      status.textContent = 'Please sign in before placing an order.'
      showPage('login')
      return
    }

    const data = new FormData(checkoutForm)
    const payment = data.get('payment')

    if (payment !== 'cod') {
      status.textContent = 'Only Cash on Delivery is currently supported.'
      return
    }

    if (items.some(item => !Number.isSafeInteger(Number(item.id ?? item.foodId)))) {
      status.textContent =
        'A menu item is missing its database food ID. Refresh the menu and try again.'
      status.classList.add('sn-status-notice')
      return
    }

    submitButton.disabled = true
    status.classList.remove('sn-status-notice')
    status.textContent = 'Checking order submission availability...'

    try {
      const token = await signedInUser.getIdToken(true)

      const address = [
        data.get('address'),
        data.get('area'),
        data.get('city'),
        data.get('state'),
        data.get('pincode'),
        data.get('instructions')
          ? `Instructions: ${data.get('instructions')}`
          : '',
      ]
        .map(value => String(value || '').trim())
        .filter(Boolean)
        .join(', ')

      /*
       * Do not report success or save a fake local order here.
       * The current backend code provided so far does not include
       * POST /api/v1/orders. Enable order submission after that route
       * is implemented and its response contract is confirmed.
       */
      const response = await fetch('http://localhost:5000/api/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: items.map(item => ({
            foodId: Number(item.id ?? item.foodId),
            quantity: Number(item.quantity),
          })),
          paymentMethod: 'COD',
          deliveryAddress: address,
          customer: {
            fullName: String(data.get('fullName') || '').trim(),
            phone: String(data.get('phone') || '').trim(),
            email: String(data.get('email') || '').trim(),
          },
          notes: String(data.get('orderNotes') || '').trim(),
        }),
      })

      const result = await response.json().catch(() => ({}))

      if (!response.ok || result.success !== true) {
        throw new Error(
          result.message ||
          `Order submission failed with HTTP ${response.status}.`
        )
      }

      if (!result.order) {
        throw new Error(
          'The API did not return an order record. Verify the backend response.'
        )
      }

      status.textContent =
        'The backend accepted the order. Check My Orders to verify it was saved.'
      status.classList.remove('sn-status-notice')

      // Only clear the cart after the API confirms success.
      cart.clear()
      updateCartCount()

      const savedOrder = result.order
      renderOrderConfirmation({
        id: savedOrder.orderId ?? savedOrder.ORDER_ID ?? savedOrder.id,
        placedAt: savedOrder.orderDate ?? savedOrder.ORDER_DATE ??
          new Date().toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short',
          }),
        status: savedOrder.orderStatus ?? savedOrder.ORDER_STATUS ?? 'PLACED',
        customer: {
          fullName: String(data.get('fullName') || '').trim(),
          phone: String(data.get('phone') || '').trim(),
          email: String(data.get('email') || '').trim(),
        },
        address: { line: address, area: '', city: '', state: '', pincode: '' },
        paymentLabel: 'Cash on Delivery',
        notes: String(data.get('orderNotes') || '').trim(),
        items: items.map(item => ({
          ...item,
          price: Number(item.price),
        })),
        subtotal: total,
        deliveryFee,
        discount: couponDiscount,
        total: Number(
          savedOrder.totalAmount ??
          savedOrder.TOTAL_AMOUNT ??
          Math.max(0, total + deliveryFee - couponDiscount)
        ),
      })
    } catch (error) {
      console.error('SpiceNest checkout failed:', error)
      status.textContent =
        error.message || 'Unable to submit your order. Please try again.'
      status.classList.add('sn-status-notice')
    } finally {
      submitButton.disabled = false
    }
  })
}


  function showPage(nextPage) {
    if (nextPage === 'admin' && !isAdminUser) {
      nextPage = 'login'
      setTimeout(() => {
        const status = view.querySelector('#sn-login-status')
        if (status) status.textContent = 'Please sign in through Admin Login to verify administrator access.'
      }, 0)
    }
    if ((nextPage === 'checkout' || nextPage === 'orders') && !signedInUser) {
      nextPage = 'login'
      const message = 'Please sign in to place an order or view your order history.'
      setTimeout(() => {
        const status = view.querySelector('#sn-login-status')
        if (status) status.textContent = message
      }, 0)
    }
    page = nextPage

    app.querySelectorAll('.sn-nav-link').forEach(link => {
      link.classList.toggle('active', link.dataset.page === page)
    })

    if (page === 'home') renderHome()
    else if (page === 'menu') renderMenu()
    else if (page === 'about') renderAbout()
    else if (page === 'contact') renderContact()
    else if (page === 'login') renderLogin()
    else if (page === 'cart') renderCart()
    else if (page === 'checkout') renderCheckout()
    else if (page === 'orders') renderOrders()
    else if (page === 'admin') {
  view.innerHTML = ''
  const root = document.createElement('div')
  root.id = 'admin-portal-root'
  view.appendChild(root)

  import('react-dom/client').then(({ createRoot }) => {
    if (page !== 'admin') return

    if (!root._reactRoot) {
      root._reactRoot = createRoot(root)
    }

    root._reactRoot.render(
      <AdminPortal
        user={signedInUser}
        onSignOut={() => {
          signOut(auth).then(() => {
            signedInUser = null
            setAdminDashboardVisibility(false)
            updateAccountArea()
            showPage('login')
          })
        }}
      />
    )
  })
}
    else renderHome()

    updateCartCount()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  app.addEventListener('click', event => {
    const pageLink = event.target.closest('[data-page]')
    if (pageLink) {
      event.preventDefault()
      showPage(pageLink.dataset.page)
      return
    }

    const signOutButton = event.target.closest('[data-signout]')
    if (signOutButton) {
      signOut(auth).then(() => {
        signedInUser = null
        setAdminDashboardVisibility(false)
        updateAccountArea()
        showPage('login')
      }).catch(error => {
        console.error('SpiceNest sign out failed:', error.code)
      })
      return
    }

    const categoryButton = event.target.closest('[data-category]')
    if (categoryButton) {
      selectedCategory = categoryButton.dataset.category
      const filtered = getFilteredDishes()
      const grid = view.querySelector('#sn-menu-grid')
      if (grid) grid.innerHTML = filtered.map((dish, index) => dishCard(dish, index)).join('')
      const count = view.querySelector('#sn-menu-count')
      if (count) count.textContent = `${filtered.length} ${filtered.length === 1 ? 'dish' : 'dishes'} to discover`
      const noResults = view.querySelector('#sn-no-results')
      if (noResults) noResults.hidden = filtered.length > 0
      view.querySelectorAll('[data-category]').forEach(button => {
        button.classList.toggle('selected', button.dataset.category === selectedCategory)
      })
      return
    }

    const addButton = event.target.closest('[data-add]')
    if (addButton) {
      const name = addButton.dataset.add
      cart.set(name, (cart.get(name) || 0) + 1)
      updateCartCount()
      addButton.textContent = `+ Add more (${cart.get(name)})`
      return
    }

    const plusButton = event.target.closest('[data-plus]')
    if (plusButton) {
      const name = plusButton.dataset.plus
      cart.set(name, (cart.get(name) || 0) + 1)
      renderCart()
      updateCartCount()
      return
    }

    const minusButton = event.target.closest('[data-minus]')
    if (minusButton) {
      const name = minusButton.dataset.minus
      const nextQuantity = (cart.get(name) || 0) - 1
      if (nextQuantity <= 0) cart.delete(name)
      else cart.set(name, nextQuantity)
      renderCart()
      updateCartCount()
      return
    }

    if (event.target.closest('[data-checkout-preview]')) {
      showPage('checkout')
    }
  })

  updateAccountArea()
  showPage(page)
}

export default function App() {
  useEffect(() => {
    renderPage()
    let unsubscribe
    let cancelled = false

    loadFoodsFromAPI()

    import('firebase/auth').then(({ onAuthStateChanged }) => {
      authReady
        .then(() => {
          if (cancelled) return
          unsubscribe = onAuthStateChanged(auth, async user => {
            window.dispatchEvent(
              new CustomEvent('spicenest-auth-state', { detail: user })
            )

            // Re-check the current Firebase session with the backend so the
            // admin navbar link survives navigation and page refreshes, but
            // is never shown to an ordinary customer account.
            if (!user) {
              window.dispatchEvent(new CustomEvent('spicenest-admin-state', { detail: false }))
              return
            }

            try {
              const token = await user.getIdToken()
              const response = await fetch('http://localhost:5000/api/v1/admin/access-check', {
                headers: { Authorization: `Bearer ${token}` },
              })
              const result = await response.json().catch(() => ({}))
              window.dispatchEvent(new CustomEvent('spicenest-admin-state', {
                detail: Boolean(response.ok && result.success),
              }))
            } catch (error) {
              window.dispatchEvent(new CustomEvent('spicenest-admin-state', { detail: false }))
              console.error('SpiceNest admin session verification failed:', error.code || error.message)
            }
          })
        })
        .catch(error => {
          console.error(
            'SpiceNest session initialization failed:',
            error.code || error.message
          )
        })
    })

    return () => {
      cancelled = true
      if (unsubscribe) unsubscribe()
    }
  }, [])

  return <div id="app-content"></div>
}
