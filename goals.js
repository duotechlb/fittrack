
function getUserGoals() {
  var user = getUser();
  return JSON.parse(localStorage.getItem("goals_" + user.id)) || { calories: 2000, workouts: 5 };
}

function saveUserGoals(goals) {
  var user = getUser();
  localStorage.setItem("goals_" + user.id, JSON.stringify(goals));
}

function getWorkoutsThisWeek() {
  var user  = getUser();
  var all   = JSON.parse(localStorage.getItem("workouts_" + user.id)) || [];
  var today = new Date();
  var day   = today.getDay();
  var diff  = (day === 0 ? -6 : 1) - day;
  var monday = new Date(today);
  monday.setDate(today.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  var sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 7);
  return all.filter(function(w) {
    var d = new Date(w.date);
    return w.completed && w.completedAt && d >= monday && d < sunday;
  });
}

function setProgressBar(fillId, pct) {
  var el = document.getElementById(fillId);
  if (el) {
    el.style.width = "0%";
    setTimeout(function() { el.style.width = pct + "%"; }, 100);
  }
}

function getStatusText(pct, remaining, unit, done) {
  if (done)       return "Goal achieved! Great job this week.";
  if (pct >= 75)  return "Almost there — " + remaining + " " + unit + " to go.";
  if (pct >= 50)  return "Halfway through. Keep going — " + remaining + " " + unit + " left.";
  return remaining + " " + unit + " left to hit your goal. Keep pushing!";
}


function renderWeeklyGrid(week) {
  var grid = document.getElementById("weeklyGrid");
  if (!grid) return;
  var names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  var today = new Date();
  var day = today.getDay();
  var diff = (day === 0 ? -6 : 1) - day;
  var monday = new Date(today);
  monday.setDate(today.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  grid.innerHTML = names.map(function(name, i) {
    var d = new Date(monday);
    d.setDate(monday.getDate() + i);
    var sameDay = week.filter(function(w) {
      var wd = new Date(w.date || w.completedAt);
      return wd.getFullYear() === d.getFullYear() && wd.getMonth() === d.getMonth() && wd.getDate() === d.getDate();
    });
    var cals = sameDay.reduce(function(sum, w) { return sum + Number(w.calories || 0); }, 0);
    var active = sameDay.length > 0 ? " active" : "";
    return '<div class="week-day' + active + '"><span class="day-name">' + name + '</span><strong class="day-workouts">' + sameDay.length + '</strong><span class="day-calories">' + cals + ' cal</span></div>';
  }).join("");
}

function renderGoals() {
  var goals     = getUserGoals();
  var week      = getWorkoutsThisWeek();
  var weekCals  = 0;
  week.forEach(function(w) { weekCals += Number(w.calories); });
  var weekCount = week.length;

  document.getElementById("goalCal").value     = goals.calories;
  document.getElementById("goalWorkout").value = goals.workouts;

  var calPct = Math.min(100, Math.round((weekCals / goals.calories) * 100));
  setProgressBar("calFill", calPct);
  document.getElementById("calProgress").textContent =
    weekCals.toLocaleString() + " / " + goals.calories.toLocaleString() + " cal (" + calPct + "%)";
  document.getElementById("calStatus").textContent =
    getStatusText(calPct, goals.calories - weekCals, "calories", weekCals >= goals.calories);

  var wPct = Math.min(100, Math.round((weekCount / goals.workouts) * 100));
  setProgressBar("workoutFill", wPct);
  document.getElementById("workoutProgress").textContent =
    weekCount + " / " + goals.workouts + " workouts (" + wPct + "%)";
  document.getElementById("workoutStatus").textContent =
    getStatusText(wPct, goals.workouts - weekCount, "workouts", weekCount >= goals.workouts);

  document.getElementById("sumWorkouts").textContent = weekCount;
  document.getElementById("sumCals").textContent     = weekCals.toLocaleString();
  document.getElementById("sumAvg").textContent      = weekCount > 0 ? Math.round(weekCals / weekCount) : 0;
  document.getElementById("sumGoalCal").textContent  = goals.calories.toLocaleString();
  document.getElementById("sumGoalW").textContent    = goals.workouts;

  var types   = {};
  week.forEach(function(w) { types[w.type] = (types[w.type] || 0) + 1; });
  var topType = "—";
  var max     = 0;
  Object.keys(types).forEach(function(t) { if (types[t] > max) { max = types[t]; topType = t; } });
  document.getElementById("sumTopType").textContent = topType;
  renderWeeklyGrid(week);
}

function adjust(inputId, delta, min, max) {
  var el = document.getElementById(inputId);
  if (!el) return;
  var val = parseInt(el.value) + delta;
  if (val < min) val = min;
  if (val > max) val = max;
  el.value = val;
}

function loadGoalsPage() {
  requireLogin();
  initNav();
  initTheme();
  renderGoals();

  document.getElementById("calMinus")?.addEventListener("click", function() { adjust("goalCal", -100, 100, 10000); });
  document.getElementById("calPlus")?.addEventListener("click",  function() { adjust("goalCal", 100, 100, 10000); });
  document.getElementById("wMinus")?.addEventListener("click",   function() { adjust("goalWorkout", -1, 1, 21); });
  document.getElementById("wPlus")?.addEventListener("click",    function() { adjust("goalWorkout", 1, 1, 21); });

  document.getElementById("saveBtn")?.addEventListener("click", function() {
    var cal = parseInt(document.getElementById("goalCal").value);
    var w   = parseInt(document.getElementById("goalWorkout").value);
    if (isNaN(cal) || cal < 100) { showToast("Calorie goal must be at least 100."); return; }
    if (isNaN(w)   || w < 1)    { showToast("Workout goal must be at least 1."); return; }
    saveUserGoals({ calories: cal, workouts: w });
    renderGoals();
    showToast("Goals saved.", "green");
  });

  document.getElementById("resetBtn")?.addEventListener("click", function() {
    if (!confirm("Reset goals to default?")) return;
    saveUserGoals({ calories: 2000, workouts: 5 });
    renderGoals();
    showToast("Goals reset to default.");
  });
}

window.addEventListener("DOMContentLoaded", loadGoalsPage);
