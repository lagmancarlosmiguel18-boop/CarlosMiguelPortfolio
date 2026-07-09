/*=============== CMS — Dynamic Portfolio Content Loader ===============*/
// ── Fill in your Firebase config from Firebase Console ──────────────────
const CMS_FIREBASE_CONFIG = {
  apiKey:            'AIzaSyDf5MylXp8idwwp77NbgM7wcXlrKmIiAIQ',
  authDomain:        'cmjlportfolio.firebaseapp.com',
  projectId:         'cmjlportfolio',
  storageBucket:     'cmjlportfolio.firebasestorage.app',
  messagingSenderId: '875675827071',
  appId:             '1:875675827071:web:35658c04f4cce171f2f84a'
}
// ─────────────────────────────────────────────────────────────────────────

;(() => {
  // Avoid double-init if Firebase was already initialized (e.g. by admin.html)
  try {
    firebase.app('cms')
  } catch {
    firebase.initializeApp(CMS_FIREBASE_CONFIG, 'cms')
  }

  const db = firebase.app('cms').firestore()

  // ── Helpers ────────────────────────────────────────────────────────────
  const pad = n => String(n).padStart(2, '0')

  // ── Detect and build media element (image / mp4 / youtube) ───────────────
  function buildMedia(url, title) {
    if (!url) return ''
    const u = url.toLowerCase()
    if (u.includes('youtube.com') || u.includes('youtu.be')) {
      const match = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/)
      const id = match ? match[1] : null
      return id ? `<iframe class="projects__img" src="https://www.youtube.com/embed/${id}" frameborder="0" allowfullscreen style="border-radius:inherit"></iframe>` : ''
    }
    if (u.includes('.mp4') || u.includes('.webm') || u.includes('.mov')) {
      return `<video class="projects__img" src="${url}" autoplay muted loop playsinline style="object-fit:cover;border-radius:inherit"></video>`
    }
    return `<img src="${url}" alt="${title || 'achievement'}" class="projects__img">`
  }

  // ── Build an achievement slide — exactly matches original HTML ─────────────
  function buildSlide(data) {
    const article = document.createElement('article')
    article.className = 'projects__card swiper-slide'

    const titleHtml = (data.title || '').replace(/\\n/g, '<br>')
    const numStr    = pad(data.order || 1)
    const mediaUrl  = data.imageUrl || data.videoUrl || ''

    article.innerHTML = `
      <div class="blob"></div>
      <div class="projects__number">
        <h1>${numStr}</h1>
        <h3>${data.category || ''}</h3>
      </div>
      <div class="projects__data">
        <h1 class="projects__title">${titleHtml}</h1>
        <p class="projects__subtitle">${data.subtitle || 'Program Language used'}</p>
        <p class="projects__description">${data.language || ''}</p>
      </div>
      <div class="projects__image">
        ${buildMedia(mediaUrl, data.title)}
        <a href="${data.link || '#'}" target="_blank" class="projects__button">
          <i class="ri-arrow-right-up-long-line"></i>
        </a>
      </div>
    `
    return article
  }

  // ── Build a work card ──────────────────────────────────────────────────
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
      <p class="work__description">${data.description || ''}</p>
    `
    return div
  }

  // ── Load achievements → inject into Swiper ─────────────────────────────
  async function loadAchievements() {
    try {
      const snap = await db.collection('achievements').orderBy('order').get()
      if (snap.empty) return  // fallback: keep static HTML

      const wrapper = document.querySelector('.projects__swiper .swiper-wrapper')
      if (!wrapper) return

      // Sort client-side then inject
      const slides = []
      snap.forEach(doc => slides.push(doc.data()))
      slides.sort((a, b) => (a.order || 0) - (b.order || 0))
      wrapper.innerHTML = ''
      slides.forEach(data => wrapper.appendChild(buildSlide(data)))

      // Re-initialize Swiper with the new slides
      if (window.swiperProjects) {
        window.swiperProjects.destroy(true, true)
      }
      window.swiperProjects = new Swiper('.projects__swiper', {
        loop: true,
        spaceBetween: 24,
        slidesPerView: 'auto',
        grabCursor: true,
        speed: 600,
        pagination: { el: '.swiper-pagination', clickable: true },
        autoplay: { delay: 3000, disableOnInteraction: false },
      })
    } catch (err) {
      // Firebase not configured or network error → static HTML stays
      console.info('CMS: using static achievement content', err.message)
    }
  }

  // ── Load work / education ──────────────────────────────────────────────
  async function loadWork() {
    try {
      const snap = await db.collection('work').get()
      if (snap.empty) return  // fallback: keep static HTML

      const expEl = document.getElementById('experience')
      const eduEl = document.getElementById('education')
      if (!expEl || !eduEl) return

      // Sort client-side — avoids composite index requirement
      const items = []
      snap.forEach(doc => items.push(doc.data()))
      items.sort((a, b) => (a.order || 0) - (b.order || 0))

      // Remove only .work__card elements — preserves any structural divs inside
      expEl.querySelectorAll('.work__card').forEach(el => el.remove())
      eduEl.querySelectorAll('.work__card').forEach(el => el.remove())

      items.forEach(data => {
        const card = buildWorkCard(data)
        if (data.tab === 'education') eduEl.appendChild(card)
        else expEl.appendChild(card)
      })

      // ── Re-apply work-active + force reflow ───────────────────────────────
      // Dynamic injection collapses the height-based show/hide — this restores it
      requestAnimationFrame(() => {
        // Find the currently active tab button
        const activeTab = document.querySelector('[data-target].work-active')
        const targetSel = activeTab ? activeTab.dataset.target : '#experience'
        const targetEl  = document.querySelector(targetSel)

        // Reset all content panes then activate the correct one
        document.querySelectorAll('[data-content]').forEach(el =>
          el.classList.remove('work-active')
        )
        if (targetEl) {
          targetEl.classList.add('work-active')
          void targetEl.offsetHeight   // trigger reflow — fixes resize-to-show bug
        }
      })

    } catch (err) {
      console.info('CMS: using static work content', err.message)
    }
  }

  // ── Boot ───────────────────────────────────────────────────────────────
  // Wait for DOM + Swiper library to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      loadAchievements()
      loadWork()
    })
  } else {
    loadAchievements()
    loadWork()
  }
})()
