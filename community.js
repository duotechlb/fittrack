
function safeText(value) {
  return String(value == null ? "" : value).replace(/[&<>'"]/g, function(ch) {
    return {"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"}[ch];
  });
}

function isThisWeek(dateStr) {
  var date = new Date(dateStr);
  var today = new Date();
  var day = today.getDay();
  var diff = (day === 0 ? -6 : 1) - day;
  var monday = new Date(today);
  monday.setDate(today.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return date >= monday;
}

function ensureCommunityStorage() {
  var me = getUser();
  if (!me) return;

 
  localStorage.removeItem("fittrack_community_seeded");
  localStorage.removeItem("workouts_demo_maya");
  localStorage.removeItem("workouts_demo_karim");
  localStorage.removeItem("workouts_demo_rami");

  var users = getAllUsers();
  if (!Array.isArray(users)) users = [];

  users = users.filter(function(u) {
    return u && u.id && !String(u.id).startsWith("demo_");
  });

  var existing = users.find(function(u){ return u.id === me.id; });
  if (!existing) {
    users.push(me);
  } else {
    Object.assign(existing, me);
  }

  users.forEach(function(u) {
    u.friends = Array.isArray(u.friends) ? u.friends.filter(function(id){ return !String(id).startsWith("demo_"); }) : [];
    u.friendRequests = Array.isArray(u.friendRequests) ? u.friendRequests.filter(function(id){ return !String(id).startsWith("demo_"); }) : [];
  });

  saveAllUsers(users);

  var posts = JSON.parse(localStorage.getItem("community_posts") || "[]");
  posts = Array.isArray(posts) ? posts.filter(function(post) {
    return post && post.userId && !String(post.userId).startsWith("demo_");
  }) : [];
  localStorage.setItem("community_posts", JSON.stringify(posts));
}

window.updateProfile = function() {
  var user = getUser();
  var h = document.getElementById("profileHeight").value;
  var w = document.getElementById("profileWeight").value;
  var c = document.getElementById("profileCity").value;
  if (!h || !w || !c) { showToast("Please fill in height, weight, and city."); return; }
  user.height = parseInt(h, 10);
  user.weight = parseInt(w, 10);
  user.city = c;
  saveUser(user);
  showToast("Profile updated.", "green");
  renderCommunity();
};

function renderRequests() {
  var me = getUser();
  var allUsers = getAllUsers();
  var container = document.getElementById("requestList");
  if (!container || !me) return;
  if (!me.friendRequests) me.friendRequests = [];
  if (me.friendRequests.length === 0) {
    container.innerHTML = '<p class="muted-text no-margin small-copy">No pending requests.</p>';
    return;
  }
  container.innerHTML = me.friendRequests.map(function(id) {
    var sender = allUsers.find(function(u){ return u.id === id; });
    if (!sender) return "";
    return '<div class="request-row"><strong class="small-copy">' + safeText(sender.name) + '</strong><button class="btn btn-red btn-sm" onclick="acceptRequest(\'' + safeText(id) + '\')">Accept</button></div>';
  }).join("");
}

window.sendRequest = function(targetId) {
  var me = getUser();
  var allUsers = getAllUsers();
  var target = allUsers.find(function(u){ return u.id === targetId; });
  if (!target || !me) return;
  if (!target.friendRequests) target.friendRequests = [];
  if (!me.friends) me.friends = [];
  if (!target.friendRequests.includes(me.id) && !me.friends.includes(target.id)) {
    target.friendRequests.push(me.id);
    updateGlobalUser(target);
    showToast("Request sent.", "green");
    renderCommunity();
  }
};

window.acceptRequest = function(id) {
  var me = getUser();
  var allUsers = getAllUsers();
  var sender = allUsers.find(function(u){ return u.id === id; });
  if (!sender || !me) return;
  if (!me.friendRequests) me.friendRequests = [];
  if (!me.friends) me.friends = [];
  if (!sender.friends) sender.friends = [];
  me.friendRequests = me.friendRequests.filter(function(rid){ return rid !== id; });
  if (!me.friends.includes(id)) me.friends.push(id);
  if (!sender.friends.includes(me.id)) sender.friends.push(me.id);
  saveUser(me);
  updateGlobalUser(sender);
  showToast("You are now friends.", "green");
  renderCommunity();
};

function renderCommunity() {
  var currentUser = getUser();
  var allUsers = getAllUsers();
  if (!currentUser) return;
  if (!currentUser.friends) currentUser.friends = [];
  if (!currentUser.friendRequests) currentUser.friendRequests = [];
  renderRequests();

  var leaderboard = allUsers.map(function(u) {
    if (!u.friends) u.friends = [];
    if (!u.friendRequests) u.friendRequests = [];
    var workouts = JSON.parse(localStorage.getItem("workouts_" + u.id) || "[]");
    var weeklyCals = workouts.filter(function(w){ return w.completed && isThisWeek(w.completedAt || w.date); })
      .reduce(function(sum, w){ return sum + Number(w.calories || 0); }, 0);
    return {
      id:u.id, name:u.name || "Member", cals:weeklyCals, city:u.city || "Not set",
      stats:(u.height || "--") + " cm • " + (u.weight || "--") + " kg",
      isMe:u.id === currentUser.id,
      isFriend:currentUser.friends.includes(u.id),
      iSentRequest:u.friendRequests.includes(currentUser.id),
      theySentRequest:currentUser.friendRequests.includes(u.id)
    };
  }).sort(function(a,b){ return b.cals - a.cals; });

  var lbEl = document.getElementById("leaderboardList");
  if (!lbEl) return;
  lbEl.innerHTML = leaderboard.map(function(u, i) {
    var btn = "";
    if (u.isMe) btn = '<span class="badge">You</span>';
    else if (u.isFriend) btn = '<span class="badge badge-green">Friend</span>';
    else if (u.iSentRequest) btn = '<span class="pending-pill">Pending</span>';
    else if (u.theySentRequest) btn = '<button class="btn btn-outline btn-sm" onclick="acceptRequest(\'' + safeText(u.id) + '\')">Accept</button>';
    else btn = '<button class="btn btn-red btn-sm" onclick="sendRequest(\'' + safeText(u.id) + '\')">Add</button>';
    return '<div class="leader-row"><div><strong>' + (i+1) + '. ' + safeText(u.name) + '</strong><small class="leader-meta">' + safeText(u.city) + ' • ' + safeText(u.stats) + '</small></div><div class="leader-score"><div class="leader-calories">' + u.cals + ' cal</div>' + btn + '</div></div>';
  }).join("");
}

function renderFeed() {
  var posts = JSON.parse(localStorage.getItem("community_posts") || "[]");
  posts.sort(function(a,b){ return new Date(b.createdAt) - new Date(a.createdAt); });
  var feed = document.getElementById("feedList");
  if (!feed) return;
  if (posts.length === 0) {
    feed.innerHTML = '<p class="muted-text empty-copy">No posts yet. Start the conversation!</p>';
    return;
  }
  feed.innerHTML = posts.map(function(post) {
    var name = post.name || "Member";
    var initials = name.split(" ").map(function(n){ return n[0]; }).join("").toUpperCase().substring(0,2);
    return '<div class="feed-post"><div class="feed-avatar">' + safeText(initials) + '</div><div class="feed-body"><div class="feed-head"><strong>' + safeText(name) + '</strong><span>' + new Date(post.createdAt).toLocaleDateString() + '</span></div><p class="feed-text">' + safeText(post.text) + '</p></div></div>';
  }).join("");
}

function clearMyPosts() {
  var user = getUser();
  if (!confirm("Delete all of your community posts?")) return;
  var posts = JSON.parse(localStorage.getItem("community_posts") || "[]").filter(function(p){ return p.userId !== user.id; });
  localStorage.setItem("community_posts", JSON.stringify(posts));
  renderFeed();
}

function renderChallenge() {
  var user = getUser();
  var workouts = JSON.parse(localStorage.getItem("workouts_" + user.id) || "[]");
  var weekWorkouts = workouts.filter(function(w){ return w.completed && isThisWeek(w.completedAt || w.date); });
  var wCount = weekWorkouts.length;
  var wCals = weekWorkouts.reduce(function(sum,w){ return sum + Number(w.calories || 0); }, 0);
  var avgPct = (Math.min(100, (wCount / 5) * 100) + Math.min(100, (wCals / 2000) * 100)) / 2;
  if (document.getElementById("challengeWorkouts")) document.getElementById("challengeWorkouts").textContent = wCount + " / 5";
  if (document.getElementById("challengeCals")) document.getElementById("challengeCals").textContent = wCals + " / 2000";
  if (document.getElementById("challengeFill")) document.getElementById("challengeFill").style.width = avgPct + "%";
  if (document.getElementById("challengeText")) document.getElementById("challengeText").textContent = avgPct >= 100 ? "Challenge complete!" : "Keep pushing to complete this week's challenge.";
}

function loadCommunityPage() {
  requireLogin();
  initNav();
  initTheme();
  ensureCommunityStorage();
  var user = getUser();
  if (document.getElementById("profileHeight")) {
    document.getElementById("profileHeight").value = user.height || "";
    document.getElementById("profileWeight").value = user.weight || "";
    document.getElementById("profileCity").value = user.city || "";
  }
  renderFeed();
  renderCommunity();
  renderChallenge();
  document.getElementById("postForm")?.addEventListener("submit", function(e) {
    e.preventDefault();
    var input = document.getElementById("postText");
    var err = document.getElementById("postErr");
    if (input.value.trim().length < 3) { if (err) err.textContent = "Write at least 3 characters."; return; }
    if (err) err.textContent = "";
    var posts = JSON.parse(localStorage.getItem("community_posts") || "[]");
    posts.unshift({id:Date.now(),userId:user.id,name:user.name || "You",text:input.value.trim(),createdAt:new Date().toISOString()});
    localStorage.setItem("community_posts", JSON.stringify(posts));
    input.value = "";
    renderFeed();
    showToast("Post shared.", "green");
  });
  document.getElementById("clearPostsBtn")?.addEventListener("click", clearMyPosts);
}
window.addEventListener("DOMContentLoaded", loadCommunityPage);
