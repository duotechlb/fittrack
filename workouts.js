// workouts page

var STARTER_WORKOUT_NAMES = [
  "Morning Jog", "HIIT Circuit", "Yoga Session", "Treadmill Run", "Pilates Session",
  "Evening Walk", "Sprint Training", "Bike Ride", "Morning Yoga", "5K Run",
  "Full Body HIIT", "Jump Rope", "Pilates Core", "Sunset Run", "Power Yoga",
  "Bodyweight HIIT", "HIIT Cardio", "Cardio Kickboxing", "Morning Run", "Stretch and Relax"
];

function seedTwentyWorkouts() {
  var user = getUser();
  var storageKey = "workouts_" + user.id;
  var existingList = JSON.parse(localStorage.getItem(storageKey)) || [];
  
 
  if (existingList.length === 0) {
    var twentyWorkouts = [
      { id: "w1", name: "Morning Jog", type: "Cardio", duration: 30, calories: 300, date: "2026-05-01", completed: false, createdByUser: true },
      { id: "w2", name: "HIIT Circuit", type: "HIIT", duration: 20, calories: 250, date: "2026-05-01", completed: false, createdByUser: true },
      { id: "w3", name: "Yoga Session", type: "Yoga", duration: 45, calories: 150, date: "2026-05-02", completed: false, createdByUser: true },
      { id: "w4", name: "Treadmill Run", type: "Cardio", duration: 40, calories: 350, date: "2026-05-02", completed: false, createdByUser: true },
      { id: "w5", name: "Pilates Session", type: "Pilates", duration: 50, calories: 200, date: "2026-05-03", completed: false, createdByUser: true },
      { id: "w6", name: "Evening Walk", type: "Cardio", duration: 60, calories: 180, date: "2026-05-03", completed: false, createdByUser: true },
      { id: "w7", name: "Sprint Training", type: "HIIT", duration: 15, calories: 220, date: "2026-05-04", completed: false, createdByUser: true },
      { id: "w8", name: "Bike Ride", type: "Cardio", duration: 45, calories: 400, date: "2026-05-04", completed: false, createdByUser: true },
      { id: "w9", name: "Morning Yoga", type: "Yoga", duration: 30, calories: 120, date: "2026-05-05", completed: false, createdByUser: true },
      { id: "w10", name: "5K Run", type: "Cardio", duration: 28, calories: 310, date: "2026-05-05", completed: false, createdByUser: true },
      { id: "w11", name: "Full Body HIIT", type: "HIIT", duration: 25, calories: 290, date: "2026-05-06", completed: false, createdByUser: true },
      { id: "w12", name: "Jump Rope", type: "Cardio", duration: 20, calories: 240, date: "2026-05-06", completed: false, createdByUser: true },
      { id: "w13", name: "Pilates Core", type: "Pilates", duration: 35, calories: 190, date: "2026-05-07", completed: false, createdByUser: true },
      { id: "w14", name: "Sunset Run", type: "Cardio", duration: 30, calories: 320, date: "2026-05-07", completed: false, createdByUser: true },
      { id: "w15", name: "Power Yoga", type: "Yoga", duration: 40, calories: 200, date: "2026-05-08", completed: false, createdByUser: true },
      { id: "w16", name: "Bodyweight HIIT", type: "HIIT", duration: 20, calories: 230, date: "2026-05-08", completed: false, createdByUser: true },
      { id: "w17", name: "HIIT Cardio", type: "HIIT", duration: 30, calories: 350, date: "2026-05-09", completed: false, createdByUser: true },
      { id: "w18", name: "Cardio Kickboxing", type: "Cardio", duration: 45, calories: 420, date: "2026-05-09", completed: false, createdByUser: true },
      { id: "w19", name: "Morning Run", type: "Cardio", duration: 25, calories: 280, date: "2026-05-10", completed: false, createdByUser: true },
      { id: "w20", name: "Stretch and Relax", type: "Yoga", duration: 30, calories: 90, date: "2026-05-10", completed: false, createdByUser: true }
    ];
    localStorage.setItem(storageKey, JSON.stringify(twentyWorkouts));
  }
}

function cleanUserWorkouts(list) {
  return (list || []).filter(function(w) {
    return w.createdByUser === true;
  });
}

function getUserWorkouts() {
  var user = getUser();
  var list = JSON.parse(localStorage.getItem("workouts_" + user.id)) || [];
  var cleaned = cleanUserWorkouts(list);
  if (cleaned.length !== list.length) {
    saveUserWorkouts(cleaned);
  }
  return cleaned;
}

function saveUserWorkouts(list) {
  var user = getUser();
  localStorage.setItem("workouts_" + user.id, JSON.stringify(list));
}

function newId() {
  return Math.random().toString(36).slice(2) + Date.now();
}

function formatDateCard(str) {
  var d = new Date(str + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function renderCards(list) {
  var grid = document.getElementById("cardsGrid");
  if (!grid) return;

  if (list.length === 0) {
    grid.innerHTML = '<div class="empty"><p>No workouts yet. Add your own workout.</p></div>';
    return;
  }

  grid.innerHTML = list.map(function(w) {
    var calPerMin = w.duration > 0 ? Math.round(w.calories / w.duration) : 0;
    var isDone    = !!w.completed;
    var cardClass = "workout-card" + (isDone ? " done" : "");
    var doneBtn   = isDone
      ? '<button class="btn-mark-done active" onclick="toggleComplete(\'' + w.id + '\')">Completed</button>'
      : '<button class="btn-mark-done" onclick="toggleComplete(\'' + w.id + '\')">Mark Done</button>';

    return '<div class="' + cardClass + '">' +
      '<div class="card-top">' +
        '<div class="w-name">' + w.name + '</div>' +
        '<span class="badge badge-' + w.type + '">' + w.type + '</span>' +
      '</div>' +
      '<div class="card-stats">' +
        '<div class="stat"><div class="num">' + w.duration + '</div><div class="lbl">Min</div></div>' +
        '<div class="stat"><div class="num">' + w.calories + '</div><div class="lbl">Cal</div></div>' +
        '<div class="stat"><div class="num">' + calPerMin + '</div><div class="lbl">Cal/min</div></div>' +
      '</div>' +
      '<div class="card-bottom">' +
        '<span class="w-date">' + formatDateCard(w.date) + '</span>' +
        '<div class="workout-actions">' +
          doneBtn +
          '<button class="btn-delete" onclick="deleteWorkout(\'' + w.id + '\')">Delete</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }).join("");
}

function updateCount(n) {
  var el = document.getElementById("count");
  if (el) el.textContent = n + " workout" + (n !== 1 ? "s" : "");
}

function applyAll() {
  var list   = getUserWorkouts();
  var search = (document.getElementById("searchBox")?.value || "").toLowerCase().trim();
  var type   = document.getElementById("filterType")?.value || "";
  var date   = document.getElementById("filterDate")?.value || "";
  var sort   = document.getElementById("sortBy")?.value || "";

  list = list.filter(function(w) {
    var matchName = !search || w.name.toLowerCase().includes(search);
    var matchType = !type   || w.type === type;
    var matchDate = !date   || w.date === date;
    return matchName && matchType && matchDate;
  });

  if (sort === "cal_high")  list.sort(function(a, b) { return b.calories - a.calories; });
  if (sort === "cal_low")   list.sort(function(a, b) { return a.calories - b.calories; });
  if (sort === "dur_high")  list.sort(function(a, b) { return b.duration - a.duration; });
  if (sort === "dur_low")   list.sort(function(a, b) { return a.duration - b.duration; });
  if (sort === "oldest")    list.sort(function(a, b) { return new Date(a.date) - new Date(b.date); });
  if (!sort || sort === "newest") list.sort(function(a, b) { return new Date(b.date) - new Date(a.date); });

  renderCards(list);
  updateCount(list.length);
}

function toggleComplete(id) {
  var list = getUserWorkouts();
  list = list.map(function(w) {
    if (w.id == id) {
      if (w.completed) {
        var updated = Object.assign({}, w, { completed: false });
        delete updated.completedAt;
        return updated;
      }
      return Object.assign({}, w, { completed: true, completedAt: new Date().toISOString(), date: new Date().toISOString().split("T")[0], createdByUser: true });
    }
    return w;
  });
  saveUserWorkouts(list);
  applyAll();
  var workout = list.find(function(w) { return w.id == id; });
  if (workout && workout.completed) {
    showToast("Workout completed and added to your dashboard.", "green");
  } else {
    showToast("Workout marked as incomplete.");
  }
}

function deleteWorkout(id) {
  var list = getUserWorkouts();
  list = list.filter(function(w) { return w.id !== id; });
  saveUserWorkouts(list);
  applyAll();
  showToast("Workout deleted.");
}

function openModal() {
  document.getElementById("modal").classList.add("show");
  document.getElementById("workoutForm").reset();
  clearFormErrors();
  document.getElementById("wDate").value = new Date().toISOString().split("T")[0];
}

function closeModal() {
  document.getElementById("modal").classList.remove("show");
}

function clearFormErrors() {
  document.querySelectorAll("#workoutForm .error-msg").forEach(function(el) {
    el.textContent = "";
    el.classList.remove("show");
  });
}

function showFormErr(id, msg) {
  var el = document.getElementById(id);
  if (el) { el.textContent = msg; el.classList.add("show"); }
}

function submitWorkout(e) {
  e.preventDefault();
  clearFormErrors();

  var name     = document.getElementById("wName").value.trim();
  var type     = document.getElementById("wType").value;
  var duration = parseInt(document.getElementById("wDuration").value);
  var calories = parseInt(document.getElementById("wCalories").value);
  var date     = document.getElementById("wDate").value;
  var ok = true;

  if (!name)                               { showFormErr("wNameErr", "Name is required."); ok = false; }
  if (!type)                               { showFormErr("wTypeErr", "Please select a type."); ok = false; }
  if (!duration || duration <= 0 || isNaN(duration)) { showFormErr("wDurErr", "Enter a valid number of minutes."); ok = false; }
  if (!calories || calories <= 0 || isNaN(calories)) { showFormErr("wCalErr", "Enter a valid calorie amount."); ok = false; }
  if (!date)                               { showFormErr("wDateErr", "Please pick a date."); ok = false; }
  if (!ok) return;

  var list = getUserWorkouts();
  list.unshift({
    id: newId(),
    name: name,
    type: type,
    duration: duration,
    calories: calories,
    date: date,
    completed: false,
    createdByUser: true
  });
  saveUserWorkouts(list);
  closeModal();
  applyAll();
  showToast("Workout added.", "green");
}

function loadWorkoutsPage() {
  requireLogin();
  initNav();
  initTheme();
  
 
  seedTwentyWorkouts();

  var dateInput = document.getElementById("wDate");
  if (dateInput) dateInput.max = new Date().toISOString().split("T")[0];

  document.getElementById("addBtn")?.addEventListener("click", openModal);
  document.getElementById("modalClose")?.addEventListener("click", closeModal);
  document.getElementById("cancelBtn")?.addEventListener("click", closeModal);
  document.getElementById("workoutForm")?.addEventListener("submit", submitWorkout);
  document.getElementById("searchBox")?.addEventListener("input", applyAll);
  document.getElementById("filterType")?.addEventListener("change", applyAll);
  document.getElementById("filterDate")?.addEventListener("change", applyAll);
  document.getElementById("sortBy")?.addEventListener("change", applyAll);

  document.getElementById("clearDate")?.addEventListener("click", function() {
    document.getElementById("filterDate").value = "";
    applyAll();
  });

  document.getElementById("modal")?.addEventListener("click", function(e) {
    if (e.target === this) closeModal();
  });

  applyAll();
}

window.addEventListener("DOMContentLoaded", loadWorkoutsPage);