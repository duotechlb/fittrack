const STARTER_WORKOUT_NAMES = [
  "Morning Jog", "HIIT Circuit", "Yoga Session", "Treadmill Run", "Pilates Session",
  "Evening Walk", "Sprint Training", "Bike Ride", "Morning Yoga", "5K Run",
  "Full Body HIIT", "Jump Rope", "Pilates Core", "Sunset Run", "Power Yoga",
  "Bodyweight HIIT", "HIIT Cardio", "Cardio Kickboxing", "Morning Run", "Stretch and Relax"
];

function getWorkouts() {
  const user = getUser();
  const key = `workouts_${user.id}`;
  const list = JSON.parse(localStorage.getItem(key)) || [];
  
  return list.filter(w => w.createdByUser === true);
}

function getGoals() {
  const user = getUser();
  return JSON.parse(localStorage.getItem(`goals_${user.id}`)) || { calories: 2000, workouts: 5 };
}

function isThisWeek(dateStr) {
  const date = new Date(dateStr);
  const today = new Date();
  const day = today.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  
  const monday = new Date(today);
  monday.setDate(today.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 7);
  
  return date >= monday && date < sunday;
}

function getMotivation(count) {
  if (count === 0) return "No workouts logged this week. Time to get moving!";
  if (count <= 2) return "Good start — keep the momentum going.";
  if (count <= 4) return "Great week so far. You are building solid habits.";
  return "You are crushing your goals this week. Amazing work!";
}

function formatDate(str) {
  const d = new Date(`${str}T00:00:00`);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function drawChart(workouts) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const today = new Date();
  const dayNum = today.getDay();
  const diffToMon = (dayNum === 0 ? -6 : 1) - dayNum;
  
  const monday = new Date(today);
  monday.setDate(today.getDate() + diffToMon);
  monday.setHours(0, 0, 0, 0);

  const cals = [0, 0, 0, 0, 0, 0, 0];
  workouts.forEach(w => {
    const d = new Date(w.date);
    const diff = Math.floor((d - monday) / (1000 * 60 * 60 * 24));
    if (diff >= 0 && diff < 7) cals[diff] += Number(w.calories);
  });

  let max = Math.max(...cals);
  if (max === 0) max = 1;
  
  const todayIndex = (dayNum === 0 ? 6 : dayNum - 1);
  const chart = document.getElementById("chart");
  if (!chart) return;
  
  chart.innerHTML = "";

  for (let i = 0; i < 7; i++) {
    const pct = Math.round((cals[i] / max) * 100);
    
    const item = document.createElement("div");
    item.className = "bar-item";

    const fill = document.createElement("div");
    fill.className = "bar-fill";
    fill.style.height = "0px";
    fill.title = `${cals[i]} cal`;

    const label = document.createElement("div");
    label.className = "bar-day";
    label.textContent = days[i];
    
    if (i === todayIndex) {
      label.style.color = "var(--red)";
      label.style.fontWeight = "700";
    }

    item.appendChild(fill);
    item.appendChild(label);
    chart.appendChild(item);

    setTimeout((f, percent) => {
      f.style.height = `${percent}%`;
    }, 100 + i * 80, fill, pct);
  }
}

function loadDashboard() {
  requireLogin();
  initNav();
  initTheme();

  const user = getUser();
  const workouts = getWorkouts();
  const goals = getGoals();

  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const greetEl = document.getElementById("greeting");
  if (greetEl) {
    greetEl.textContent = `${greet}, ${user.name.split(" ")[0]}!`;
  }

  const completedWorkouts = workouts.filter(w => w.completed && w.completedAt);
  const totalWorkouts = completedWorkouts.length;
  
  let totalCals = 0;
  completedWorkouts.forEach(w => {
    totalCals += Number(w.calories);
  });

  const weekWorkouts = completedWorkouts.filter(w => isThisWeek(w.date));
  const weekCount = weekWorkouts.length;
  
  let weekCals = 0;
  weekWorkouts.forEach(w => {
    weekCals += Number(w.calories);
  });

  const completedTotal = completedWorkouts.length;

  document.getElementById("totalWorkouts").textContent = totalWorkouts;
  document.getElementById("totalCals").textContent = totalCals.toLocaleString();
  document.getElementById("thisWeek").textContent = weekCount;
  document.getElementById("completedCount").textContent = completedTotal;

  const motEl = document.getElementById("motivation");
  if (motEl) {
    motEl.querySelector(".msg").textContent = getMotivation(weekCount);
  }

  const calPct = Math.min(100, Math.round((weekCals / goals.calories) * 100));
  const wPct = Math.min(100, Math.round((weekCount / goals.workouts) * 100));
  
  setTimeout(() => {
    const cf = document.getElementById("calFill");
    if (cf) cf.style.width = `${calPct}%`;
    
    const wf = document.getElementById("workoutFill");
    if (wf) wf.style.width = `${wPct}%`;
  }, 300);

  const calLabel = document.getElementById("calLabel");
  if (calLabel) {
    calLabel.textContent = `${weekCals}/${goals.calories} cal (${calPct}%)`;
  }
  
  const wLabel = document.getElementById("workoutLabel");
  if (wLabel) {
    wLabel.textContent = `${weekCount}/${goals.workouts} workouts (${wPct}%)`;
  }

  drawChart(completedWorkouts);

  const sorted = completedWorkouts.slice().sort((a, b) => {
    return new Date(b.completedAt || b.date) - new Date(a.completedAt || a.date);
  });
  const recent = sorted.slice(0, 5);

  const list = document.getElementById("recentList");
  if (list) {
    if (recent.length === 0) {
      list.innerHTML = '<p class="muted-text empty-copy">No completed workouts yet.</p>';
    } else {
      list.innerHTML = recent.map(w => {
        const doneTag = w.completed ? '<span class="done-tag">Done</span>' : '';
        return `
          <div class="recent-item">
            <div class="info">
              <div class="name">${w.name}</div>
              <div class="meta">${w.type} &middot; ${w.duration} min &middot; ${formatDate(w.date)}</div>
            </div>
            <div class="recent-actions">
              ${doneTag}
              <div class="cal">
                ${w.calories}<small class="tiny-muted"> cal</small>
                <div class="tiny-muted">${weekCals}/${goals.calories} cal</div>
              </div>
            </div>
          </div>
        `;
      }).join("");
    }
  }
}

window.addEventListener("DOMContentLoaded", loadDashboard);