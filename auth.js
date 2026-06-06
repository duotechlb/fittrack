
function getUser() {
  return JSON.parse(localStorage.getItem("current_user")) || null;
}

function saveUser(user) {
  localStorage.setItem("current_user", JSON.stringify(user));
  updateGlobalUser(user);
}

function updateGlobalUser(updatedUser) {
  var users = getAllUsers();
  var index = users.findIndex(u => u.id === updatedUser.id);
  if (index !== -1) {
    users[index] = updatedUser;
    saveAllUsers(users);
  }
}

function getAllUsers() {
  return JSON.parse(localStorage.getItem("users")) || [];
}

function saveAllUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

function logout() {
  localStorage.removeItem("current_user");
  window.location.href = "index.html";
}

function requireLogin() {
  if (!getUser()) window.location.href = "index.html";
}

function requireGuest() {
  if (getUser()) window.location.href = "dashboard.html";
}

function makeId() {
  return Math.random().toString(36).slice(2) + Date.now();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPassword(pass) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/.test(pass);
}

function showErr(id, msg) {
  var el = document.getElementById(id);
  if (el) { el.textContent = msg; el.classList.add("show"); }
}

function clearErrs() {
  document.querySelectorAll(".error-msg").forEach(el => {
    el.textContent = "";
    el.classList.remove("show");
  });
}

function initLogin() {
  requireGuest();
  document.getElementById("loginForm")?.addEventListener("submit", function(e) {
    e.preventDefault();
    clearErrs();
    var email = document.getElementById("email").value.trim();
    var pass = document.getElementById("password").value;
    
    var users = getAllUsers();
    var found = users.find(u => u.email === email.toLowerCase() && u.password === pass);

    if (!found) { showErr("passErr", "Invalid email or password."); return; }
    
    saveUser(found);
    window.location.href = "dashboard.html";
  });
}

function initRegister() {
  requireGuest();
  document.getElementById("registerForm")?.addEventListener("submit", function(e) {
    e.preventDefault();
    clearErrs();

    var name = document.getElementById("name").value.trim();
    var email = document.getElementById("email").value.trim();
    var pass = document.getElementById("password").value;
    var confirm = document.getElementById("confirmPass").value;

    if (!name || !isValidEmail(email) || !isValidPassword(pass) || pass !== confirm) {
      showErr("confirmErr", "Please complete all fields correctly."); return;
    }

    var users = getAllUsers();
    if (users.find(u => u.email === email.toLowerCase())) {
      showErr("emailErr", "Email already in use."); return;
    }

    var newUser = {
      id: makeId(),
      name: name,
      email: email.toLowerCase(),
      password: pass,
      height: null, 
      weight: null, 
      city: "",     
      friends: [],
      friendRequests: []
    };

    users.push(newUser);
    saveAllUsers(users);
    
    localStorage.setItem("goals_" + newUser.id, JSON.stringify({ calories: 2000, workouts: 5 }));
    localStorage.setItem("workouts_" + newUser.id, JSON.stringify([]));

    showToast("Account Created! You can login now.", "green");
    setTimeout(() => { window.location.href = "index.html"; }, 1200);
  });
}


window.deleteAccount = function() {
  var user = getUser();
  if (!user) return;

  var confirmed = confirm("Are you sure you want to permanently delete your account? You will lose all your data, workouts, and friends.");
  if (!confirmed) return;

  var userId = user.id;

  var users = getAllUsers();
  users = users.filter(u => u.id !== userId);

  users.forEach(u => {
    if (u.friends) u.friends = u.friends.filter(id => id !== userId);
    if (u.friendRequests) u.friendRequests = u.friendRequests.filter(id => id !== userId);
  });
  saveAllUsers(users);

  localStorage.removeItem("workouts_" + userId);
  localStorage.removeItem("goals_" + userId);

  var posts = JSON.parse(localStorage.getItem("community_posts")) || [];
  posts = posts.filter(p => p.userId !== userId);
  localStorage.setItem("community_posts", JSON.stringify(posts));

  
  localStorage.removeItem("current_user");
  alert("Account deleted.");
  window.location.href = "index.html";
};

function showToast(msg, type) {
  var wrap = document.querySelector(".toast-wrap") || document.createElement("div");
  wrap.className = "toast-wrap"; document.body.appendChild(wrap);
  var t = document.createElement("div");
  t.className = "toast" + (type === "green" ? " green" : "");
  t.textContent = msg; wrap.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

function initNav() {
  var user = getUser();
  var logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) logoutBtn.onclick = logout;
  var mobileLogout = document.getElementById("mobileLogout");
  if (mobileLogout) mobileLogout.onclick = logout;
  var nameEl = document.getElementById("navName");
  if (nameEl && user) nameEl.textContent = user.name.split(" ")[0];
  var current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link, .mobile-menu a').forEach(function(a) {
    var href = a.getAttribute('href');
    if (href === current) a.classList.add('active');
  });
}

function initTheme() {
  var saved = localStorage.getItem("theme") || "dark";
  document.body.className = saved;
  document.querySelectorAll(".theme-checkbox").forEach(cb => {
    cb.checked = (saved === "light");
    cb.onchange = function() {
      var theme = this.checked ? "light" : "dark";
      document.body.className = theme;
      localStorage.setItem("theme", theme);
    };
  });
}