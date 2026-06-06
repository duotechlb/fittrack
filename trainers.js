const TRAINERS = [
  {
    id: 1,
    name: "Sarah Mitchell",
    initials: "SM",
    avatarClass: "",
    title: "Strength & Fat Loss Coach",
    specialties: ["Strength", "Fat Loss", "HIIT"],
    certifications: ["NASM-CPT", "Nutrition Coach"],
    languages: ["English", "Arabic"],
    mode: ["Gym", "Online"],
    price: "$28/session",
    rating: 4.9,
    reviews: 64,
    response: "2h",
    bestFor: "Body recomposition",
    bio: "Sarah builds direct, realistic programs for people who want to lose fat, get stronger and keep a clean routine without overcomplicating training.",
    availability: [true, true, false, true, true, false, false]
  },
  {
    id: 2,
    name: "David Chen",
    initials: "DC",
    avatarClass: "teal",
    title: "Mobility & Yoga Specialist",
    specialties: ["Yoga", "Mobility", "Pilates"],
    certifications: ["RYT-500", "Corrective Exercise"],
    languages: ["English", "French"],
    mode: ["Online", "Outdoor"],
    price: "$24/session",
    rating: 4.8,
    reviews: 48,
    response: "4h",
    bestFor: "Flexibility and posture",
    bio: "David mixes mobility, breathing and controlled strength work. His sessions are calm, detailed and useful for recovery or posture improvement.",
    availability: [true, false, true, false, true, true, true]
  },
  {
    id: 3,
    name: "Maria Lopez",
    initials: "ML",
    avatarClass: "purple",
    title: "Pilates & Core Conditioning",
    specialties: ["Pilates", "Mobility", "Fat Loss"],
    certifications: ["Pilates Mat", "Pre/Posture Coach"],
    languages: ["English", "Spanish"],
    mode: ["Gym", "Online"],
    price: "$26/session",
    rating: 4.7,
    reviews: 53,
    response: "1h",
    bestFor: "Core strength",
    bio: "Maria focuses on deep core strength, alignment and steady progress. Her plans are ideal if you want strong abs without random workouts.",
    availability: [false, true, true, true, false, true, false]
  },
  {
    id: 4,
    name: "James Wilson",
    initials: "JW",
    avatarClass: "blue",
    title: "Running & Athletic Conditioning",
    specialties: ["Running", "HIIT", "Strength"],
    certifications: ["Run Coach", "Sports Conditioning"],
    languages: ["English"],
    mode: ["Outdoor", "Online"],
    price: "$30/session",
    rating: 4.9,
    reviews: 71,
    response: "3h",
    bestFor: "Stamina and speed",
    bio: "James designs running plans with strength and intervals so members improve speed, endurance and confidence outdoors.",
    availability: [true, true, true, false, true, false, true]
  },
  {
    id: 5,
    name: "Emma Torres",
    initials: "ET",
    avatarClass: "green",
    title: "Dance Fitness & Zumba",
    specialties: ["Fat Loss", "HIIT", "Dance"],
    certifications: ["Zumba Pro", "Group Fitness"],
    languages: ["English", "Spanish"],
    mode: ["Gym", "Outdoor"],
    price: "$22/session",
    rating: 4.6,
    reviews: 39,
    response: "5h",
    bestFor: "Fun cardio",
    bio: "Emma keeps cardio energetic and social. Her sessions are perfect when you want sweat, music and consistency without boring machines.",
    availability: [false, true, false, true, true, true, true]
  },
  {
    id: 6,
    name: "Omar Hassan",
    initials: "OH",
    avatarClass: "teal",
    title: "HIIT & Athletic Conditioning",
    specialties: ["HIIT", "Strength", "Fat Loss"],
    certifications: ["ACE-CPT", "Boxing Conditioning"],
    languages: ["Arabic", "English"],
    mode: ["Gym", "Outdoor"],
    price: "$32/session",
    rating: 4.8,
    reviews: 88,
    response: "1h",
    bestFor: "High intensity progress",
    bio: "Omar is direct and performance-focused. He builds hard but controlled sessions for people who like pushing themselves safely.",
    availability: [true, false, true, true, false, true, false]
  }
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function stars(rating) {
  const rounded = Math.round(rating);
  return "★".repeat(rounded) + "☆".repeat(5 - rounded);
}

function badgeList(arr, className) {
  return arr.map(item => `<span class="${className}">${escapeHTML(item)}</span>`).join('');
}

function escapeHTML(str) {
  return String(str).replace(/[&<>'"]/g, char => {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[char];
  });
}

function currentFiltered() {
  const query = (document.getElementById('trainerSearch')?.value || '').toLowerCase();
  const specialty = document.getElementById('filterSpecialty')?.value || '';
  const mode = document.getElementById('filterMode')?.value || '';
  const minRating = Number(document.getElementById('filterRating')?.value || 0);

  return TRAINERS.filter(trainer => {
    const haystack = `${trainer.name} ${trainer.title} ${trainer.specialties.join(' ')} ${trainer.certifications.join(' ')}`.toLowerCase();
    
    const matchesQuery = !query || haystack.includes(query);
    const matchesSpecialty = !specialty || trainer.specialties.includes(specialty);
    const matchesMode = !mode || trainer.mode.includes(mode);
    const matchesRating = trainer.rating >= minRating;

    return matchesQuery && matchesSpecialty && matchesMode && matchesRating;
  });
}

function renderTrainers(list) {
  const grid = document.getElementById('trainersGrid');
  if (!grid) return;

  if (!list.length) {
    grid.innerHTML = '<div class="empty-state">No trainers match your filters. Try resetting the search.</div>';
    return;
  }

  grid.innerHTML = list.map(trainer => {
    const availabilityDots = DAYS.map((day, index) => {
      const isActive = trainer.availability[index] ? 'active' : 'muted';
      return `<span class="avail-pill ${isActive}">${day}</span>`;
    }).join('');

    return `
      <article class="trainer-card premium-card"> 
        <div class="trainer-card-top">
          <div class="trainer-avatar ${trainer.avatarClass}">${trainer.initials}</div>
          <div class="trainer-info">
            <div class="trainer-name">${escapeHTML(trainer.name)}</div>
            <div class="trainer-title">${escapeHTML(trainer.title)}</div>
            <div class="rating-line">
              <span>${stars(trainer.rating)}</span>
              <strong>${trainer.rating}</strong>
              <small>(${trainer.reviews} reviews)</small>
            </div>
          </div>
        </div>
        
        <div class="specialty-tags">
          ${badgeList(trainer.specialties, 'spec-tag')}
        </div>
        
        <p class="trainer-bio">${escapeHTML(trainer.bio)}</p>
        
        <div class="trainer-meta-grid">
          <div><span>Best for</span><strong>${escapeHTML(trainer.bestFor)}</strong></div>
          <div><span>Price</span><strong>${trainer.price}</strong></div>
          <div><span>Mode</span><strong>${trainer.mode.join(' / ')}</strong></div>
          <div><span>Replies</span><strong>${trainer.response}</strong></div>
        </div>
        
        <div class="availability-dots">
          ${availabilityDots}
        </div>
        
        <div class="trainer-actions">
          <button class="btn btn-red" onclick="bookTrainer(${trainer.id})">Book Session</button>
          <button class="btn btn-outline btn-sm" onclick="requestCallback(${trainer.id})">Callback</button>
          <button class="btn btn-outline btn-sm" onclick="viewProfile(${trainer.id})">Profile</button>
        </div>
      </article>
    `;
  }).join('');
}

function bookTrainer(id) {
  const trainer = TRAINERS.find(t => t.id === id);
  if (!trainer) return;

  const user = getUser();
  const storageKey = `trainer_bookings_${user ? user.id : 'guest'}`;
  const bookings = JSON.parse(localStorage.getItem(storageKey) || '[]');
  
  bookings.push({
    id: makeId(),
    trainerId: id,
    trainer: trainer.name,
    createdAt: new Date().toISOString(),
    status: 'pending'
  });
  
  localStorage.setItem(storageKey, JSON.stringify(bookings));
  showToast(`Session request sent to ${trainer.name}.`, 'green');
}

function requestCallback(id) {
  const trainer = TRAINERS.find(t => t.id === id);
  if (trainer) {
    showToast(`${trainer.name} will contact you for available times.`, 'green');
  }
}

function viewProfile(id) {
  const trainer = TRAINERS.find(t => t.id === id);
  if (!trainer) return;

  document.getElementById('modalTrainerName').textContent = trainer.name;

  const availabilityHtml = DAYS.map((day, index) => {
    const isActive = trainer.availability[index] ? 'active' : 'muted';
    return `<span class="avail-pill ${isActive}">${day}</span>`;
  }).join('');

  document.getElementById('trainerModalBody').innerHTML = `
    <div class="profile-head">
      <div class="trainer-avatar ${trainer.avatarClass} large">${trainer.initials}</div>
      <div>
        <p class="muted-text">${escapeHTML(trainer.title)}</p>
        <div class="rating-line">
          <span>${stars(trainer.rating)}</span>
          <strong>${trainer.rating}</strong>
          <small>${trainer.reviews} reviews</small>
        </div>
      </div>
    </div>
    
    <p class="trainer-bio profile-bio">${escapeHTML(trainer.bio)}</p>
    
    <div class="specialty-tags">
      ${badgeList(trainer.certifications, 'spec-tag soft')}
      ${badgeList(trainer.languages, 'spec-tag')}
    </div>
    
    <div class="trainer-meta-grid modal-grid">
      <div><span>Best for</span><strong>${escapeHTML(trainer.bestFor)}</strong></div>
      <div><span>Price</span><strong>${trainer.price}</strong></div>
      <div><span>Mode</span><strong>${trainer.mode.join(' / ')}</strong></div>
      <div><span>Response</span><strong>${trainer.response}</strong></div>
    </div>
    
    <p class="eyebrow mini">Availability</p>
    <div class="availability-dots modal-days">
      ${availabilityHtml}
    </div>
    
    <div class="trainer-actions modal-actions">
      <button class="btn btn-red" onclick="bookTrainer(${trainer.id}); closeTrainerModal();">
        Book a Session
      </button>
      <button class="btn btn-outline" onclick="requestCallback(${trainer.id})">
        Request Callback
      </button>
    </div>
  `;
  
  document.getElementById('trainerModal').classList.add('show');
}

function closeTrainerModal() {
  document.getElementById('trainerModal').classList.remove('show');
}

function loadTrainersPage() {
  requireLogin();
  initNav();
  initTheme();
  
  renderTrainers(TRAINERS);

  const filterIds = ['trainerSearch', 'filterSpecialty', 'filterMode', 'filterRating'];
  
  filterIds.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener('input', () => renderTrainers(currentFiltered()));
      element.addEventListener('change', () => renderTrainers(currentFiltered()));
    }
  });

  const resetBtn = document.getElementById('resetTrainerFilters');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      ['trainerSearch', 'filterSpecialty', 'filterMode'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });
      
      const ratingEl = document.getElementById('filterRating');
      if (ratingEl) ratingEl.value = '0';
      
      renderTrainers(TRAINERS);
    });
  }

  document.getElementById('trainerModalClose')?.addEventListener('click', closeTrainerModal);
  
  document.getElementById('trainerModal')?.addEventListener('click', function(e) {
    if (e.target === this) closeTrainerModal();
  });
}

window.addEventListener('DOMContentLoaded', loadTrainersPage);