/*=============== CMS — Dynamic Portfolio Content Loader ===============*/
const CMS_FIREBASE_CONFIG = {
  apiKey:            'AIzaSyDf5MylXp8idwwp77NbgM7wcXlrKmIiAIQ',
  authDomain:        'cmjlportfolio.firebaseapp.com',
  projectId:         'cmjlportfolio',
  storageBucket:     'cmjlportfolio.firebasestorage.app',
  messagingSenderId: '875675827071',
  appId:             '1:875675827071:web:35658c04f4cce171f2f84a'
}

;(() => {
  // ── Init Firebase (avoid double-init) ──────────────────────────────────────
  let app
  try { app = firebase.app('cms') } catch { app = firebase.initializeApp(CMS_FIREBASE_CONFIG, 'cms') }
  const db = app.firestore()

  // ══════════════════════════════════════════════════════════════════════════
  //  HELPERS
  // ══════════════════════════════════════════════════════════════════════════
  const pad = n => String(n).padStart(2, '0')

  function getDriveId(url) {
    for (const p of [/\/file\/d\/([a-zA-Z0-9_-]+)/, /[?&]id=([a-zA-Z0-9_-]+)/, /\/d\/([a-zA-Z0-9_-]+)/]) {
      const m = url.match(p); if (m) return m[1]
    }
    return null
  }

  function buildMedia(url, title) {
    if (!url) return ''
    const u = url.toLowerCase()
    if (u.includes('drive.google.com')) {
      const id = getDriveId(url)
      return id ? `<iframe class="projects__img" src="https://drive.google.com/file/d/${id}/preview" frameborder="0" allowfullscreen style="border-radius:inherit;width:100%;height:100%"></iframe>` : ''
    }
    if (u.includes('youtube.com') || u.includes('youtu.be')) {
      const m = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/); const id = m ? m[1] : null
      return id ? `<iframe class="projects__img" src="https://www.youtube.com/embed/${id}" frameborder="0" allowfullscreen style="border-radius:inherit"></iframe>` : ''
    }
    if (u.includes('cloudinary.com') && u.includes('/video/')) {
      return `<video class="projects__img" src="${url}" autoplay muted loop playsinline style="object-fit:cover;border-radius:inherit"></video>`
    }
    if (u.includes('.mp4') || u.includes('.webm') || u.includes('.mov')) {
      return `<video class="projects__img" src="${url}" autoplay muted loop playsinline style="object-fit:cover;border-radius:inherit"></video>`
    }
    return `<img src="${url}" alt="${title || 'achievement'}" class="projects__img">`
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  BUILDERS — match original HTML exactly
  // ══════════════════════════════════════════════════════════════════════════
  function buildSlide(data) {
    const article = document.createElement('article')
    article.className = 'projects__card swiper-slide'
    const mediaUrl  = data.imageUrl || data.videoUrl || ''
    article.innerHTML = `
      <div class="blob"></div>
      <div class="projects__number">
        <h1>${pad(data.order || 1)}</h1>
        <h3>${data.category || ''}</h3>
      </div>
      <div class="projects__data">
        <h1 class="projects__title">${(data.title || '').replace(/\\n/g, '<br>')}</h1>
        <p class="projects__subtitle">${data.subtitle || 'Program Language used'}</p>
        <p class="projects__description">${data.language || ''}</p>
      </div>
      <div class="projects__image">
        ${buildMedia(mediaUrl, data.title)}
        <a href="${data.link || '#'}" target="_blank" class="projects__button">
          <i class="ri-arrow-right-up-long-line"></i>
        </a>
      </div>`
    return article
  }

  function buildWorkCard(data) {
    const div = document.createElement('div')
    div.className = 'work__card'
    div.innerHTML = `
      <div class="work__data">
        <div>
          <h1 class="work__title">${data.title || ''}</h1>
          <h3 class="work__subtitle">${data.subtitle || ''}</h3>
        </div>
        <h2 class="work__year">${data.year || ''}</h2>
      </div>
      <p class="work__description">${data.description || ''}</p>`
    return div
  }

  function buildServiceCard(data, isFirst) {
    const div = document.createElement('div')
    div.className = `services__card ${isFirst ? 'services-open' : 'services-close'}`
    const skills = (data.skills || []).map(s => `<li class="services__skill">${s}</li>`).join('')
    div.innerHTML = `
      <div class="blob blob-2"></div>
      <div class="services__data">
        <h2 class="services__title">${data.title || ''}</h2>
        <p class="services__description">${data.description || ''}</p>
      </div>
      <div class="services__info">
        <h3 class="services__subtitle">${data.subtitle || 'Skills & Tools'}</h3>
        <ul class="services__skills">${skills}</ul>
      </div>
      <button class="services__button">
        <i class="ri-arrow-down-s-line"></i>
      </button>`
    return div
  }

  function buildTestimonialCard(data) {
    const article = document.createElement('article')
    article.className = 'testimonials__card'
    const rating    = parseFloat(data.rating || 5)
    const starsHtml = Array(5).fill(0).map((_, i) =>
      `<i class="ri-star-${i < Math.floor(rating) ? 'fill' : 'line'}"></i>`
    ).join('')
    article.innerHTML = `
      <div class="blob"></div>
      <div class="testimonials__data">
        ${data.imageUrl ? `<img src="${data.imageUrl}" alt="${data.name}" class="testimonials__img">` : ''}
        <h2 class="testimonials__name">${data.name || ''}</h2>
        ${data.role ? `<p style="font-size:.72rem;color:var(--first-color);margin-bottom:.3rem">${data.role}</p>` : ''}
        <div class="testimonials__rating">
          <div class="testimonials__stars">${starsHtml}</div>
          <h3 class="testimonials__number">${rating.toFixed(1)}</h3>
        </div>
        <p class="testimonials__description">${data.description || ''}</p>
      </div>`
    return article
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  LOADERS
  // ══════════════════════════════════════════════════════════════════════════
  async function loadAchievements() {
    try {
      const snap = await db.collection('achievements').get()
      if (snap.empty) return

      const wrapper = document.querySelector('.projects__swiper .swiper-wrapper')
      if (!wrapper) return

      const slides = []
      snap.forEach(doc => slides.push(doc.data()))
      slides.sort((a, b) => (a.order || 0) - (b.order || 0))

      wrapper.innerHTML = ''
      slides.forEach(data => wrapper.appendChild(buildSlide(data)))

      if (window.swiperProjects) window.swiperProjects.destroy(true, true)
      window.swiperProjects = new Swiper('.projects__swiper', {
        loop: true, spaceBetween: 24, slidesPerView: 'auto',
        grabCursor: true, speed: 600,
        pagination: { el: '.swiper-pagination', clickable: true },
        autoplay: { delay: 3000, disableOnInteraction: false },
      })
    } catch(err) { console.info('CMS: static achievements', err.message) }
  }

  async function loadWork() {
    try {
      const snap = await db.collection('work').get()
      if (snap.empty) return

      const expEl = document.getElementById('experience')
      const eduEl = document.getElementById('education')
      if (!expEl || !eduEl) return

      const items = []
      snap.forEach(doc => items.push(doc.data()))
      items.sort((a, b) => (a.order || 0) - (b.order || 0))

      expEl.querySelectorAll('.work__card').forEach(el => el.remove())
      eduEl.querySelectorAll('.work__card').forEach(el => el.remove())

      items.forEach(data => {
        const card = buildWorkCard(data)
        if (data.tab === 'education') eduEl.appendChild(card)
        else expEl.appendChild(card)
      })

      // ── Fix: use inline style override + rebind tabs + dispatch resize ──────
      // CSS class-based show/hide can fail to repaint after dynamic inject.
      // Inline styles override any CSS specificity issues. Resize dispatch
      // is the exact browser action that was fixing it manually.
      setTimeout(() => {
        // Determine which tab is active
        const activeBtn = document.querySelector('[data-target].work-active')
        const activeSel = activeBtn ? activeBtn.dataset.target : '#experience'

        // Apply inline display to ALL content panes (bypasses CSS specificity)
        document.querySelectorAll('[data-content]').forEach(el => {
          el.style.display = el.id === activeSel.replace('#', '') ? 'grid' : 'none'
          el.classList.toggle('work-active', el.id === activeSel.replace('#', ''))
        })

        // Rebind tab clicks so switching works after dynamic inject
        document.querySelectorAll('[data-target]').forEach(btn => {
          const clone = btn.cloneNode(true)
          btn.parentNode.replaceChild(clone, btn)
          clone.addEventListener('click', () => {
            const target = document.querySelector(clone.dataset.target)
            document.querySelectorAll('[data-content]').forEach(el => {
              el.style.display = 'none'
              el.classList.remove('work-active')
            })
            document.querySelectorAll('[data-target]').forEach(b => b.classList.remove('work-active'))
            if (target) { target.style.display = 'grid'; target.classList.add('work-active') }
            clone.classList.add('work-active')
          })
        })

        // Nuclear reflow — forces complete layout recalculation
        window.dispatchEvent(new Event('resize'))
      }, 80)

    } catch(err) { console.info('CMS: static work', err.message) }
  }

  function initServicesAccordion() {
    document.querySelectorAll('.services__button').forEach(button => {
      const info = button.parentNode.querySelector('.services__info')
      if (info) {
        info.style.height = button.parentNode.classList.contains('services-open')
          ? info.scrollHeight + 'px' : '0'
      }
      button.addEventListener('click', () => {
        const cards = document.querySelectorAll('.services__card')
        const card  = button.parentNode
        const cardInfo = card.querySelector('.services__info')
        const isOpen   = card.classList.contains('services-open')
        cards.forEach(c => {
          c.classList.replace('services-open', 'services-close')
          const i = c.querySelector('.services__info')
          if (i) i.style.height = '0'
        })
        if (!isOpen) {
          card.classList.replace('services-close', 'services-open')
          if (cardInfo) cardInfo.style.height = cardInfo.scrollHeight + 'px'
        }
      })
    })
  }

  async function loadServices() {
    try {
      const snap = await db.collection('services').get()
      if (snap.empty) return

      const container = document.querySelector('.services__container')
      if (!container) return

      const items = []
      snap.forEach(doc => items.push(doc.data()))
      items.sort((a, b) => (a.order || 0) - (b.order || 0))

      container.querySelectorAll('.services__card').forEach(el => el.remove())
      items.forEach((data, i) => container.appendChild(buildServiceCard(data, i === 0)))

      requestAnimationFrame(() => initServicesAccordion())
    } catch(err) { console.info('CMS: static services', err.message) }
  }

  async function loadTestimonials() {
    try {
      const snap = await db.collection('testimonials').get()
      if (snap.empty) return

      const tracks = document.querySelectorAll('.testimonials__content')
      if (!tracks.length) return

      const items = []
      snap.forEach(doc => items.push(doc.data()))
      items.sort((a, b) => (a.order || 0) - (b.order || 0))

      tracks.forEach((track, i) => {
        track.innerHTML = ''
        const list = i === 1 ? [...items].reverse() : items
        ;[...list, ...list].forEach(data => track.appendChild(buildTestimonialCard(data)))
      })
    } catch(err) { console.info('CMS: static testimonials', err.message) }
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  BOOT
  // ══════════════════════════════════════════════════════════════════════════
  function boot() {
    loadAchievements()
    loadWork()
    loadServices()
    loadTestimonials()
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot)
  } else {
    boot()
  }
})()
