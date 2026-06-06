const REVIEW_SEED = [
  { id: 'r1', targetType: 'site', reviewerName: 'Nour A.', rating: 5, title: 'Helped me stay consistent', body: 'The dashboard and weekly goals made training feel simple instead of messy.', createdAt: '2026-05-12', status: 'approved', verified: true, helpfulCount: 12 },
  { id: 'r2', targetType: 'trainer', reviewerName: 'Karim H.', rating: 5, title: 'Omar pushed me the right way', body: 'The trainer page feels clear and the booking request is easy to understand.', createdAt: '2026-05-14', status: 'approved', verified: true, helpfulCount: 8 },
  { id: 'r3', targetType: 'site', reviewerName: 'Lara M.', rating: 4, title: 'Clean progress tracking', body: 'I like the workouts and goals pages. Reviews make it easier to trust the platform.', createdAt: '2026-05-15', status: 'approved', verified: false, helpfulCount: 5 },
  { id: 'r4', targetType: 'trainer', reviewerName: 'Anthony S.', rating: 5, title: 'Good trainer details', body: 'Certifications, price and rating helped me choose faster.', createdAt: '2026-05-17', status: 'approved', verified: true, helpfulCount: 10 }
];

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

function stars(n) {
  const rating = Number(n);
  return '★'.repeat(rating) + '☆'.repeat(5 - rating);
}

function getReviews() {
  const saved = localStorage.getItem('fittrack_reviews');
  if (!saved) {
    localStorage.setItem('fittrack_reviews', JSON.stringify(REVIEW_SEED));
    return REVIEW_SEED.slice();
  }
  return JSON.parse(saved);
}

function saveReviews(reviews) {
  localStorage.setItem('fittrack_reviews', JSON.stringify(reviews));
}

function filteredReviews() {
  const query = (document.getElementById('reviewSearch')?.value || '').toLowerCase();
  const type = document.getElementById('reviewTarget')?.value || '';
  const sort = document.getElementById('reviewSort')?.value || 'newest';
  
  const list = getReviews()
    .filter(r => r.status === 'approved')
    .filter(r => {
      const matchesType = !type || r.targetType === type;
      const haystack = `${r.title} ${r.body} ${r.reviewerName}`.toLowerCase();
      const matchesQuery = !query || haystack.includes(query);
      return matchesType && matchesQuery;
    });

  if (sort === 'ratingHigh') {
    list.sort((a, b) => b.rating - a.rating);
  } else if (sort === 'ratingLow') {
    list.sort((a, b) => a.rating - b.rating);
  } else {
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  return list;
}

function renderSummary(list) {
  const approved = list.filter(r => r.status === 'approved');
  
  const avg = approved.length 
    ? (approved.reduce((sum, r) => sum + Number(r.rating), 0) / approved.length) 
    : 0;
    
  document.getElementById('avgRating').textContent = avg.toFixed(1);
  document.getElementById('reviewCount').textContent = `${approved.length} approved reviews`;
  
  const distBox = document.getElementById('ratingDistribution');
  distBox.innerHTML = [5, 4, 3, 2, 1].map(n => {
    const count = approved.filter(r => Number(r.rating) === n).length;
    const pct = approved.length ? Math.round((count / approved.length) * 100) : 0;
    
    return `
      <div class="dist-row">
        <span>${n}★</span>
        <div class="dist-bar">
          <i class="dist-fill" data-width="${pct}"></i>
        </div>
        <small>${count}</small>
      </div>
    `;
  }).join('');
  
  distBox.querySelectorAll('.dist-fill').forEach(el => {
    el.style.width = `${el.dataset.width}%`;
  });
}

function renderReviews() {
  const list = filteredReviews();
  renderSummary(getReviews());
  
  const box = document.getElementById('reviewsList');
  if (!box) return;

  if (!list.length) {
    box.innerHTML = '<div class="empty-state">No approved reviews match your filters.</div>';
    return;
  }

  box.innerHTML = list.map(r => {
    const isTrainer = r.targetType === 'trainer';
    const tagClass = isTrainer ? '' : 'soft';
    const tagLabel = isTrainer ? 'Trainer' : 'FitTrack';
    const verifiedBadge = r.verified ? '<span class="verified">Verified</span>' : '';
    const helpfulCount = r.helpfulCount || 0;
    const dateFormatted = new Date(r.createdAt).toLocaleDateString();

    return `
      <article class="review-card premium-card">
        <div class="review-top">
          <div>
            <div class="reviewer">${escapeHTML(r.reviewerName)}</div>
            <div class="review-date">${dateFormatted}</div>
          </div>
          <div class="review-stars">${stars(r.rating)}</div>
        </div>
        
        <h3>${escapeHTML(r.title)}</h3>
        <p>${escapeHTML(r.body)}</p>
        
        <div class="review-foot">
          <span class="spec-tag ${tagClass}">${tagLabel}</span>
          ${verifiedBadge}
          <button class="btn btn-outline btn-sm" onclick="markHelpful('${r.id}')">
            Helpful ${helpfulCount}
          </button>
        </div>
      </article>
    `;
  }).join('');
}

function markHelpful(id) {
  const reviews = getReviews();
  const item = reviews.find(x => x.id === id);
  
  if (item) {
    item.helpfulCount = (item.helpfulCount || 0) + 1;
    saveReviews(reviews);
    renderReviews();
  }
}

function openReview() {
  document.getElementById('reviewModal').classList.add('show');
}

function closeReview() {
  document.getElementById('reviewModal').classList.remove('show');
}

function loadReviews() {
  initTheme(); 
  initNav();   
  
  renderReviews();

  ['reviewSearch', 'reviewTarget', 'reviewSort'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', renderReviews);
      el.addEventListener('change', renderReviews);
    }
  });

  document.getElementById('resetReviews')?.addEventListener('click', () => {
    document.getElementById('reviewSearch').value = '';
    document.getElementById('reviewTarget').value = '';
    document.getElementById('reviewSort').value = 'newest';
    renderReviews();
  });

  document.getElementById('openReviewForm')?.addEventListener('click', openReview);
  document.getElementById('closeReviewForm')?.addEventListener('click', closeReview);
  
  document.getElementById('reviewModal')?.addEventListener('click', function (e) {
    if (e.target === this) closeReview();
  });

  document.getElementById('reviewForm')?.addEventListener('submit', function (e) {
    e.preventDefault();
    
    const user = getUser(); 
    const title = document.getElementById('reviewTitle').value.trim();
    const body = document.getElementById('reviewBody').value.trim();

    if (title.length < 3 || body.length < 10) {
      showErr('reviewErr', 'Write a clear title and at least 10 characters.'); 
      return;
    }

    const list = getReviews();
    
    list.unshift({
      id: makeId(), 
      targetType: document.getElementById('reviewTargetType').value,
      reviewerName: user ? user.name : 'Guest Member',
      rating: Number(document.getElementById('reviewRating').value),
      title: title,
      body: body,
      createdAt: new Date().toISOString(),
      status: 'approved',
      verified: !!user,
      helpfulCount: 0
    });

    saveReviews(list);
    this.reset();
    closeReview();
    showToast('Review published.', 'green'); 
    renderReviews();
  });
}

window.addEventListener('DOMContentLoaded', loadReviews);