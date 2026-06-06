const REVIEW_SEED = [
  { id: 'r1', targetType: 'site', reviewerName: 'Nour A.', rating: 5, title: 'Helped me stay consistent', body: 'The dashboard and weekly goals made training feel simple instead of messy.', createdAt: '2026-05-20' },
  { id: 'r2', targetType: 'trainer', reviewerName: 'Karim H.', rating: 5, title: 'Omar pushed me the right way', body: 'The trainer page feels clear and the booking request is easy to understand.', createdAt: '2026-05-19' },
  { id: 'r3', targetType: 'site', reviewerName: 'Lara M.', rating: 4, title: 'Clean progress tracking', body: 'I like the workouts and goals pages. Reviews make it easier to trust the platform.', createdAt: '2026-05-18' },
  { id: 'r4', targetType: 'trainer', reviewerName: 'Anthony S.', rating: 5, title: 'Good trainer details', body: 'Certifications, price and rating helped me choose faster.', createdAt: '2026-05-17' }
];

function escapeHTML(str) {
  return String(str).replace(/[&<>'"]/g, char => {
    return {'&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'}[char];
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

function loadReviews() {
  initTheme(); 
  initNav();   
}

window.addEventListener('DOMContentLoaded', loadReviews);
