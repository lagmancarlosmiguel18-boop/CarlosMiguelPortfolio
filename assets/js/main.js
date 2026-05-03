/*=============== HOME SPLIT TEXT ===============*/
const { animate, text, stagger } = anime

const { chars: chars1 } = text.split('.home__profession-1', { chars: true })
const { chars: chars2 } = text.split('.home__profession-2', { chars: true })

animate(chars1, {
  y: [
    { to: ['100%', '0%'] },
    { to: '-100%', delay: 4000, ease: 'in(3)' }
  ],
  duration: 900,
  ease: 'out(3)',
  delay: stagger(80),
  loop: true,
})

animate(chars2, {
  y: [
    { to: ['100%', '0%'] },
    { to: '-100%', delay: 5000, ease: 'in(3)' }
  ],
  duration: 900,
  ease: 'out(3)',
  delay: stagger(80),
  loop: true,
})

/*=============== SWIPER PROJECTS ===============*/
const swiperProjects = new Swiper('.projects__swiper', {
  loop: true,
  spaceBetween: 24,
  slidesPerView: 'auto',
  grabCursor: true,
  speed: 600,

  pagination: {
    el: '.swiper-pagination',
    clickable: true
  },

  autoplay: {
    delay: 3000,
    disableOnInteraction: false,
  },
})

/*=============== WORK TABS ===============*/
const tabs = document.querySelectorAll('[data-target]'),
      tabContents = document.querySelectorAll('[data-content]')

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    const targetSelector = tab.dataset.target,
          targetContent = document.querySelector(targetSelector)

    // Disable all content and active tabs
    tabContents.forEach((content) => content.classList.remove('work-active'))
    tabs.forEach((t) => t.classList.remove('work-active'))

    // Active the tab and corresponding content
    tab.classList.add('work-active')
    targetContent.classList.add('work-active')
  })
})

/*=============== SERVICES ACCORDION ===============*/
const servicesButtons = document.querySelectorAll('.services__button')

servicesButtons.forEach(button => {
  // Set initial height for all service infos
  const heightInfo = button.parentNode.querySelector('.services__info')
  if (heightInfo) {
    heightInfo.style.height = heightInfo.scrollHeight + 'px'
  }

  button.addEventListener('click', () => {
    const servicesCards = document.querySelectorAll('.services__card'),
          currentCard = button.parentNode,
          currentInfo = currentCard.querySelector('.services__info'),
          isCardOpen = currentCard.classList.contains('services-open')

    // Close all other services info
    servicesCards.forEach(card => {
      card.classList.replace('services-open', 'services-close')

      const info = card.querySelector('.services__info')
      if (info) {
        info.style.height = '0'
      }
    })

    // Open only if not already open
    if (!isCardOpen) {
      currentCard.classList.replace('services-close', 'services-open')
      if (currentInfo) {
        currentInfo.style.height = currentInfo.scrollHeight + 'px'
      }
    }
  })
})
/*=============== TESTIMONIALS OF DUPLICATE CARDS ===============*/
const tracks = document.querySelectorAll('.testimonials__content')

tracks.forEach(track => {
  const cards = [...track.children] // spread to make a static copy

  // Duplicate cards only once
  for (const card of cards) {
    track.appendChild(card.cloneNode(true))
  }
})



/*=============== COPY EMAIL IN CONTACT ===============*/


/*=============== CURRENT YEAR OF THE FOOTER ===============*/ 


/*=============== SCROLL SECTIONS ACTIVE LINK ===============*/


/*=============== CUSTOM CURSOR ===============*/


/* Hide custom cursor on links */


/*=============== SCROLL REVEAL ANIMATION ===============*/


/*--=============== SKILL GLOBE JS ===============*/
const globe = document.getElementById('skillGlobe')
const skillIcons = globe.querySelectorAll('.skill-icon')
const globeRadius = 130
let rotX = 0
let rotY = 0
let isDragging = false
let lastX, lastY

const globePoints = []
const total = skillIcons.length
for (let i = 0; i < total; i++) {
  const phi = Math.acos(-1 + (2 * i) / total)
  const theta = Math.sqrt(total * Math.PI) * phi
  globePoints.push({
    x: globeRadius * Math.cos(theta) * Math.sin(phi),
    y: globeRadius * Math.sin(theta) * Math.sin(phi),
    z: globeRadius * Math.cos(phi)
  })
}

function renderGlobe() {
  skillIcons.forEach((icon, i) => {
    const p = globePoints[i]
    let x = p.x * Math.cos(rotY) - p.z * Math.sin(rotY)
    let z = p.z * Math.cos(rotY) + p.x * Math.sin(rotY)
    let y = p.y * Math.cos(rotX) - z * Math.sin(rotX)
    z = z * Math.cos(rotX) + p.y * Math.sin(rotX)
    const scale = (z + globeRadius) / (2 * globeRadius)
    const opacity = Math.max(0.2, scale + 0.2)
    icon.style.transform = `translateX(${x + 130}px) translateY(${y + 130}px) scale(${scale})`
    icon.style.opacity = opacity
    icon.style.zIndex = Math.round(z + globeRadius)
  })
}

function animateGlobe() {
  rotY += 0.005
  renderGlobe()
  requestAnimationFrame(animateGlobe)
}

animateGlobe()

globe.addEventListener('mousedown', (e) => {
  isDragging = true
  lastX = e.clientX
  lastY = e.clientY
  globe.style.cursor = 'grabbing'
})

window.addEventListener('mouseup', () => {
  isDragging = false
  globe.style.cursor = 'grab'
})

window.addEventListener('mousemove', (e) => {
  if (!isDragging) return
  rotY += (e.clientX - lastX) * 0.005
  rotX += (e.clientY - lastY) * 0.005
  lastX = e.clientX
  lastY = e.clientY
})

globe.addEventListener('touchstart', (e) => {
  lastX = e.touches[0].clientX
  lastY = e.touches[0].clientY
})

globe.addEventListener('touchmove', (e) => {
  e.preventDefault()
  rotY += (e.touches[0].clientX - lastX) * 0.005
  rotX += (e.touches[0].clientY - lastY) * 0.005
  lastX = e.touches[0].clientX
  lastY = e.touches[0].clientY
}, { passive: false })