/*=============== PRELOADER ===============*/
;(() => {
  const preloader = document.getElementById('preloader')
  if (!preloader) return

  const fillEl    = document.getElementById('preloader-fill')
  const percentEl = document.getElementById('preloader-percent')
  const statusEl  = document.getElementById('preloader-status')

  document.body.classList.add('is-loading')

  const statusMessages = [
    { at: 0,   text: 'Loading Assets' },
    { at: 30,  text: 'Rendering Magic' },
    { at: 60,  text: 'Polishing Pixels' },
    { at: 90,  text: 'Almost There' },
    { at: 100, text: 'Welcome' },
  ]

  const minDuration = 1800   // ms — guarantees the intro animation is fully visible
  const rampCap     = 92     // % the time-based ramp approaches while waiting for real load
  const startTime   = performance.now()

  let progress   = 0
  let pageLoaded = false

  const easeOutQuad = (t) => 1 - (1 - t) * (1 - t)

  const setProgress = (value) => {
    progress = Math.min(value, 100)
    fillEl.style.width = progress + '%'
    percentEl.textContent = Math.round(progress) + '%'

    const current = statusMessages.filter((s) => progress >= s.at).pop()
    if (current) statusEl.textContent = current.text
  }

  const hidePreloader = () => {
    preloader.classList.add('preloader--hide')
    document.body.classList.remove('is-loading')
    setTimeout(() => { preloader.style.display = 'none' }, 700)
  }

  const finishProgress = () => {
    const finishFrom = progress
    const finishDuration = 350
    const finishStart = performance.now()

    const finishTick = (now) => {
      const t = Math.min((now - finishStart) / finishDuration, 1)
      setProgress(finishFrom + (100 - finishFrom) * easeOutQuad(t))
      if (t < 1) requestAnimationFrame(finishTick)
      else hidePreloader()
    }
    requestAnimationFrame(finishTick)
  }

  const tick = (now) => {
    const elapsed = now - startTime
    const t = Math.min(elapsed / minDuration, 1)
    const ramped = easeOutQuad(t) * rampCap

    if (progress < ramped) setProgress(ramped)

    if (pageLoaded && elapsed >= minDuration) {
      finishProgress()
    } else {
      requestAnimationFrame(tick)
    }
  }

  window.addEventListener('load', () => { pageLoaded = true })

  // Safety net: never let the preloader block the site for more than 8s
  setTimeout(() => { pageLoaded = true }, 8000)

  requestAnimationFrame(tick)
})()

/*=============== EMAILJS INIT ===============*/
// ─── REPLACE these 3 values with your real IDs from emailjs.com ───────────────
const EMAILJS_PUBLIC_KEY          = 'YtKnGwKJ4n1dvhh92'  // Account → API Keys
const EMAILJS_SERVICE_ID          = 'service_fq827eo'     // Email Services
const EMAILJS_VISITOR_TEMPLATE_ID = 'template_8p79iob'    // visitor alert template
const EMAILJS_CONTACT_TEMPLATE_ID = 'template_8p79iob'    // contact form template
// ──────────────────────────────────────────────────────────────────────────────

emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY })

/*=============== VISITOR NOTIFICATION ===============*/

;(() => {
  // Fire once per browser session only — prevents inbox spam on page refreshes
  if (sessionStorage.getItem('_cmjl_notified')) return
  sessionStorage.setItem('_cmjl_notified', '1')

  const send = async () => {
    // ── Browser / Device Detection ─────────────────────────────────────────────
    const ua      = navigator.userAgent
    const device  = /Mobi|Android|iPhone|iPad|Tablet/i.test(ua) ? '📱 Mobile' : '🖥️ Desktop'
    const browser = (
      ua.includes('Edg')     ? 'Edge'    :
      ua.includes('Chrome')  ? 'Chrome'  :
      ua.includes('Firefox') ? 'Firefox' :
      ua.includes('Safari')  ? 'Safari'  : 'Other'
    )
    const os = (
      ua.includes('Windows') ? 'Windows' :
      ua.includes('Mac')     ? 'macOS'   :
      ua.includes('Android') ? 'Android' :
      ua.includes('iPhone') || ua.includes('iOS') ? 'iOS' :
      ua.includes('Linux')   ? 'Linux'   : 'Unknown OS'
    )

    // ── Philippine time ────────────────────────────────────────────────────────
    const visitTime = new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Manila',
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
    })

    // ── Geo-IP lookup (free, no API key needed) ────────────────────────────────
    let ip = 'Unknown', city = 'Unknown', country = 'Unknown', mapLink = ''
    try {
      const geo = await fetch('https://ipwho.is/').then(r => r.json())
      if (geo.success) {
        ip      = geo.ip        || 'Unknown'
        city    = geo.city      || 'Unknown'
        country = geo.country   || 'Unknown'
        if (geo.latitude && geo.longitude) {
          mapLink = `https://maps.google.com/?q=${geo.latitude},${geo.longitude}`
        }
      }
    } catch { /* geo failed, send anyway with unknowns */ }

    // ── Referrer ───────────────────────────────────────────────────────────────
    const referrer = document.referrer
      ? (document.referrer.length > 60 ? document.referrer.slice(0, 60) + '…' : document.referrer)
      : 'Direct / Typed URL'

    // ── Send via EmailJS ───────────────────────────────────────────────────────
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_VISITOR_TEMPLATE_ID, {
      visit_time : visitTime,
      page_url   : location.href,
      referrer,
      device,
      browser,
      os,
      screen_res : `${screen.width} × ${screen.height}`,
      ip,
      city,
      country,
      map_link   : mapLink || 'Location unavailable',
    })
  }

  // Slight delay so it doesn't compete with the preloader or page paint
  setTimeout(() => send().catch(() => {}), 2000)
})()

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
const copyEmailBtn = document.getElementById('copy-email')
const emailText    = document.getElementById('contact__email')

if (copyEmailBtn && emailText) {
  copyEmailBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(emailText.textContent.trim()).then(() => {
      const icon = copyEmailBtn.querySelector('i')
      icon.className = 'ri-check-line'
      copyEmailBtn.textContent = 'Copied! '
      copyEmailBtn.appendChild(icon)

      setTimeout(() => {
        icon.className = 'ri-clipboard-line'
        copyEmailBtn.textContent = 'Copy Email '
        copyEmailBtn.appendChild(icon)
      }, 2000)
    })
  })
}

/*=============== CONTACT FORM — EMAILJS ===============*/
// ── Step: Create a SECOND template in EmailJS for the contact form ──────────
// Use Service ID:  YOUR_SERVICE_ID  (same one as visitor notification)
// Use Template ID: YOUR_CONTACT_TEMPLATE_ID  (new template — see below)
// Template variables used: {{from_name}}, {{from_email}}, {{subject}},
//                          {{message}}, {{sent_time}}
const contactForm   = document.getElementById('contact-form')
const contactStatus = document.getElementById('contact-status')
const contactSubmit = document.getElementById('contact-submit')
const contactBtnIcon = document.getElementById('contact-btn-icon')

const setStatus = (type, icon, message) => {
  contactStatus.className = `contact__status status--${type}`
  contactStatus.innerHTML = `<i class="ri-${icon}"></i> ${message}`
}

const resetStatus = () => {
  contactStatus.className = 'contact__status'
  contactStatus.innerHTML = ''
}

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault()

    // ── Basic validation ─────────────────────────────────────────────────────
    const nameEl    = contactForm.querySelector('[name="from_name"]')
    const emailEl   = contactForm.querySelector('[name="from_email"]')
    const subjectEl = contactForm.querySelector('[name="subject"]')
    const msgEl     = contactForm.querySelector('[name="message"]')

    if (!nameEl.value.trim() || !emailEl.value.trim() ||
        !subjectEl.value.trim() || !msgEl.value.trim()) {
      setStatus('error', 'error-warning-line', 'Please fill in all fields.')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(emailEl.value.trim())) {
      setStatus('error', 'error-warning-line', 'Please enter a valid email address.')
      return
    }

    // ── Sending state ────────────────────────────────────────────────────────
    contactSubmit.disabled = true
    contactBtnIcon.className = 'ri-loader-4-line spin'
    setStatus('sending', 'mail-send-line', 'Sending your message...')

    // ── Philippine time ──────────────────────────────────────────────────────
    const sentTime = new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Manila',
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
    })

    try {
      const result = await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_CONTACT_TEMPLATE_ID, {
        from_name  : nameEl.value.trim(),
        from_email : emailEl.value.trim(),
        subject    : subjectEl.value.trim(),
        message    : msgEl.value.trim(),
        sent_time  : sentTime,
      })
      console.log('EmailJS success:', result)

      // ── Success state ──────────────────────────────────────────────────────
      setStatus('success', 'checkbox-circle-line', 'Message sent! I\'ll get back to you soon 🎉')
      contactBtnIcon.className = 'ri-check-line'
      contactForm.reset()

      // Reset button after 3s
      setTimeout(() => {
        contactSubmit.disabled    = false
        contactBtnIcon.className  = 'ri-send-plane-line'
        setTimeout(resetStatus, 300)
      }, 3000)

    } catch (err) {
      // ── Error state ────────────────────────────────────────────────────────
      console.error('EmailJS error:', err)
      const errMsg = err?.text || err?.message || JSON.stringify(err)
      setStatus('error', 'error-warning-line', `Failed to send (${errMsg}). Email me directly at lagmancarlosmiguel18@gmail.com`)
      contactSubmit.disabled   = false
      contactBtnIcon.className = 'ri-send-plane-line'
    }
  })
}

/*=============== CURRENT YEAR OF THE FOOTER ===============*/
const yearEl = document.getElementById('current-year')
if (yearEl) yearEl.textContent = new Date().getFullYear()

/*=============== SCROLL SECTIONS ACTIVE LINK ===============*/
const sections = document.querySelectorAll('section[id]')

const scrollActive = () => {
  const scrollDown = window.scrollY

  sections.forEach(current => {
    const sectionHeight = current.offsetHeight
    const sectionTop    = current.offsetTop - 58
    const sectionId     = current.getAttribute('id')
    const navLink       = document.querySelector(`.nav__menu a[href*=${sectionId}]`)

    if (scrollDown > sectionTop && scrollDown <= sectionTop + sectionHeight) {
      navLink && navLink.classList.add('active-link')
    } else {
      navLink && navLink.classList.remove('active-link')
    }
  })
}

window.addEventListener('scroll', scrollActive)

/*=============== CUSTOM CURSOR ===============*/
const cursorDot     = document.getElementById('cursor-dot')
const cursorOutline = document.getElementById('cursor-outline')

// Only activate custom cursor on non-touch devices
const isTouchDevice = () => window.matchMedia('(hover: none)').matches

if (!isTouchDevice() && cursorDot && cursorOutline) {
  document.body.classList.add('cursor--active')

  // Smooth outline following with lerp
  let outlineX = 0, outlineY = 0
  let targetX  = 0, targetY  = 0

  window.addEventListener('mousemove', (e) => {
    targetX = e.clientX
    targetY = e.clientY

    // Dot follows instantly
    cursorDot.style.left = targetX + 'px'
    cursorDot.style.top  = targetY + 'px'
  })

  // Smooth outline animation loop
  const animateCursor = () => {
    outlineX += (targetX - outlineX) * 0.12
    outlineY += (targetY - outlineY) * 0.12

    cursorOutline.style.left = outlineX + 'px'
    cursorOutline.style.top  = outlineY + 'px'

    requestAnimationFrame(animateCursor)
  }
  animateCursor()

  // Hover effect on links and buttons
  const hoverEls = document.querySelectorAll('a, button, .projects__card, .services__card, .skill-icon')

  hoverEls.forEach(el => {
    el.addEventListener('mouseenter', () => cursorOutline.classList.add('cursor--hover'))
    el.addEventListener('mouseleave', () => cursorOutline.classList.remove('cursor--hover'))
  })

  // Click shrink effect
  window.addEventListener('mousedown', () => cursorOutline.classList.add('cursor--click'))
  window.addEventListener('mouseup',   () => cursorOutline.classList.remove('cursor--click'))

  // Hide cursor when it leaves the window
  document.addEventListener('mouseleave', () => {
    cursorDot.style.opacity     = '0'
    cursorOutline.style.opacity = '0'
  })
  document.addEventListener('mouseenter', () => {
    cursorDot.style.opacity     = '1'
    cursorOutline.style.opacity = '0.6'
  })
}

/*=============== SCROLL REVEAL ANIMATION ===============*/
const sr = ScrollReveal({
  origin: 'top',
  distance: '60px',
  duration: 2500,
  delay: 400,
  reset: false,
})

// Home
sr.reveal('.home__data',   { delay: 300 })
sr.reveal('.home__image',  { delay: 500, origin: 'bottom' })
sr.reveal('.home__social', { delay: 700, origin: 'left' })
sr.reveal('.home__info',   { delay: 700, origin: 'right' })
sr.reveal('.home__cv',     { delay: 800, origin: 'right' })

// About
sr.reveal('.about__data',  { origin: 'left' })
sr.reveal('.about__image', { origin: 'right' })

// Projects
sr.reveal('.projects__swiper', { origin: 'bottom', delay: 300 })

// Work
sr.reveal('.work__tabs',    { origin: 'top' })
sr.reveal('.work__content', { origin: 'bottom', delay: 200 })

// Services
sr.reveal('.services__card', { interval: 150, origin: 'bottom' })

// Testimonials
sr.reveal('.testimonials .section__title', { origin: 'left' })

// Skills
sr.reveal('.skills .section__title', { origin: 'top' })
sr.reveal('.skills__globe-wrapper',  { origin: 'bottom', delay: 300 })

// Contact
sr.reveal('.contact__data',   { origin: 'left' })
sr.reveal('.contact__form',   { origin: 'right', delay: 200 })

// Footer
sr.reveal('.footer__brand',  { origin: 'bottom', delay: 100 })
sr.reveal('.footer__links',  { origin: 'bottom', delay: 200, interval: 150 })


/*--=============== SKILL GLOBE JS ===============*/
const globe = document.getElementById('skillGlobe')
const skillIcons = globe.querySelectorAll('.skill-icon')

// Globe geometry constants
const globeRadius = 130   // sphere radius
const globeCenter = 160   // half of the 320px globe container (keeps icons centered)
const iconHalf    = 30    // half of the 60px icon (so origin is icon centre)

// Restore rotation state from sessionStorage so a refresh keeps the last angle
let rotX = parseFloat(sessionStorage.getItem('globeRotX') || '0')
let rotY = parseFloat(sessionStorage.getItem('globeRotY') || '0')

let isDragging = false
let lastX, lastY
let saveTimer = null

// Save state at most every 300 ms to avoid hammering sessionStorage
function saveState() {
  clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    sessionStorage.setItem('globeRotX', rotX)
    sessionStorage.setItem('globeRotY', rotY)
  }, 300)
}

// Pre-compute evenly distributed sphere points (Fibonacci lattice)
const globePoints = []
const total = skillIcons.length
for (let i = 0; i < total; i++) {
  const phi   = Math.acos(-1 + (2 * i) / total)
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

    // Rotate around Y axis
    let x = p.x * Math.cos(rotY) - p.z * Math.sin(rotY)
    let z = p.z * Math.cos(rotY) + p.x * Math.sin(rotY)

    // Rotate around X axis
    let y = p.y * Math.cos(rotX) - z * Math.sin(rotX)
    z     = z   * Math.cos(rotX) + p.y * Math.sin(rotX)

    // Depth cues — clamp scale so back icons stay readable (0.6 → 1.0)
    const rawScale = (z + globeRadius) / (2 * globeRadius)
    const scale    = 0.6 + rawScale * 0.4
    const opacity  = 0.35 + rawScale * 0.65

    // Offset so the icon CENTRE sits on the computed point
    icon.style.transform = `translate(${x + globeCenter - iconHalf}px, ${y + globeCenter - iconHalf}px) scale(${scale})`
    icon.style.opacity   = opacity
    icon.style.zIndex    = Math.round(z + globeRadius)
  })
}

function animateGlobe() {
  if (!isDragging) rotY += 0.005
  renderGlobe()
  requestAnimationFrame(animateGlobe)
}

animateGlobe()

// ── Mouse drag ──────────────────────────────────────────────
globe.addEventListener('mousedown', (e) => {
  isDragging = true
  lastX = e.clientX
  lastY = e.clientY
  globe.style.cursor = 'grabbing'
})

window.addEventListener('mouseup', () => {
  if (isDragging) { isDragging = false; saveState() }
  globe.style.cursor = 'grab'
})

window.addEventListener('mousemove', (e) => {
  if (!isDragging) return
  rotY += (e.clientX - lastX) * 0.005
  rotX += (e.clientY - lastY) * 0.005
  lastX = e.clientX
  lastY = e.clientY
})

// ── Touch drag ───────────────────────────────────────────────
globe.addEventListener('touchstart', (e) => {
  lastX = e.touches[0].clientX
  lastY = e.touches[0].clientY
}, { passive: true })

globe.addEventListener('touchmove', (e) => {
  e.preventDefault()
  rotY += (e.touches[0].clientX - lastX) * 0.005
  rotX += (e.touches[0].clientY - lastY) * 0.005
  lastX = e.touches[0].clientX
  lastY = e.touches[0].clientY
}, { passive: false })

globe.addEventListener('touchend', saveState, { passive: true })