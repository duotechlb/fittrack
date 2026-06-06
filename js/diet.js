const dietPlans = [
  {
    id: "cutting",
    name: "Cutting Plan",
    price: "$29",
    target: "Fat loss",
    calories: "1,800 kcal/day",
    duration: "4 weeks",
    level: "Intermediate",
    description: "High-protein meals for losing fat while keeping muscle and energy stable.",
    meals: ["Egg and turkey breakfast", "Chicken rice bowl", "Greek yogurt snack", "Light high-protein dinner"],
    details: ["Protein target: 140-170g/day", "Steps target: 8,000/day", "2 flexible meals/week", "Weekly waist and weight check"]
  },
  {
    id: "muscle",
    name: "Muscle Gain Plan",
    price: "$35",
    target: "Lean bulk",
    calories: "2,700 kcal/day",
    duration: "4 weeks",
    level: "Hard training",
    description: "A controlled surplus for building muscle without turning the bulk messy.",
    meals: ["Oats and eggs", "Rice and beef", "Chicken pasta", "Protein shake"],
    details: ["Progressive calories", "Pre/post workout timing", "Strength-focused meals", "Weekly weight target +0.25-0.5kg"]
  },
  {
    id: "balanced",
    name: "Balanced Lifestyle Plan",
    price: "$25",
    target: "Maintenance",
    calories: "2,200 kcal/day",
    duration: "4 weeks",
    level: "Beginner",
    description: "Simple meals for better habits, less bloating and more stable daily energy.",
    meals: ["Eggs and toast", "Chicken salad", "Rice bowl", "Fruit snack"],
    details: ["Easy grocery list", "No strict restriction", "Hydration targets", "Weekend flexibility"]
  },
  {
    id: "athlete",
    name: "Athlete Performance Plan",
    price: "$45",
    target: "Performance",
    calories: "3,000 kcal/day",
    duration: "6 weeks",
    level: "Advanced",
    description: "Fuel and recovery plan for users training hard several times per week.",
    meals: ["Carb breakfast", "Pre-workout meal", "Post-workout protein", "Recovery dinner"],
    details: ["Carb cycling", "Electrolyte reminder", "Recovery meal timing", "Performance check-ins"]
  }
];

function getPurchasedPlan() {
  const user = getUser();
  return localStorage.getItem(`purchased_diet_plan_${user.id}`) || "";
}

function savePurchasedPlan(id) {
  const user = getUser();
  localStorage.setItem(`purchased_diet_plan_${user.id}`, id);
}

function renderDietPlans() {
  const wrap = document.getElementById("dietPlans");
  if (!wrap) return;

  const purchasedId = getPurchasedPlan();

  wrap.innerHTML = dietPlans.map(plan => {
    const isBought = purchasedId === plan.id;
    const mealsHtml = plan.meals.map(m => `<li>${m}</li>`).join("");

    return `
      <div class="diet-plan-card premium-card ${isBought ? 'active' : ''}">
        <div class="diet-plan-top">
          <div>
            <h3>${plan.name}</h3>
            <p>${plan.target} • ${plan.level}</p>
          </div>
          <div class="diet-price">${plan.price}</div>
        </div>
        
        <p class="diet-desc">${plan.description}</p>
        
        <div class="diet-plan-stats">
          <div>
            <span>Calories</span>
            <strong>${plan.calories}</strong>
          </div>
          <div>
            <span>Duration</span>
            <strong>${plan.duration}</strong>
          </div>
        </div>
        
        <div class="included-title">Included Meals</div>
        <ul class="plan-meals">
          ${mealsHtml}
        </ul>
        
        <div class="diet-actions">
          <button class="btn ${isBought ? 'btn-outline' : 'btn-red'}" onclick="buyPlan('${plan.id}')">
            ${isBought ? 'Current Plan' : 'Buy Plan'}
          </button>
          <button class="btn btn-outline" onclick="showDetailedPlan('${plan.id}')">
            Detailed Plan
          </button>
        </div>
      </div>
    `;
  }).join("");

  renderSelectedPlan();
}

function renderSelectedPlan() {
  const id = getPurchasedPlan();
  const box = document.getElementById("selectedPlanBox");
  const details = document.getElementById("selectedPlanDetails");

  if (!box || !details) return;

  if (!id) {
    box.classList.add('is-hidden');
    details.innerHTML = "";
    return;
  }

  const plan = dietPlans.find(p => p.id === id);
  if (!plan) return;

  box.classList.remove('is-hidden');
  
  const mealsHtml = plan.meals.map(m => `<span>${m}</span>`).join('');
  
  details.innerHTML = `
    <div class="purchased-plan-summary">
      <div><span>Plan</span><strong>${plan.name}</strong></div>
      <div><span>Goal</span><strong>${plan.target}</strong></div>
      <div><span>Calories</span><strong>${plan.calories}</strong></div>
      <div><span>Duration</span><strong>${plan.duration}</strong></div>
    </div>
    <div class="purchased-meals">
      ${mealsHtml}
    </div>
  `;
}

function buyPlan(id) {
  savePurchasedPlan(id);
  renderDietPlans();
  showToast("Diet plan purchased.", "green");
}

function showDetailedPlan(id) {
  const plan = dietPlans.find(p => p.id === id);
  if (!plan) return;

  const tracker = JSON.parse(localStorage.getItem(`diet_tracker_${id}`) || '{}');
  
  const stepsHtml = plan.details.map((detail, index) => {
    const isDone = tracker[index] ? 'checked' : '';
    return `
      <label class="tracker-step">
        <input type="checkbox" ${isDone} onchange="toggleDietStep('${id}', ${index}, this.checked)">
        <span>${detail}</span>
      </label>
    `;
  }).join('');

  const scheduleData = {
    cutting: [
      ["Eggs + turkey", "Chicken rice bowl", "Greek yogurt", "Light dinner"],
      ["Oats + whey", "Tuna salad", "Fruit", "Chicken wrap"],
      ["Egg saj", "Beef rice", "Labneh snack", "Chicken salad"]
    ],
    muscle: [
      ["Oats + banana", "Rice + beef", "Shake", "Chicken pasta"],
      ["Eggs + toast", "Turkey sandwich", "Yogurt", "Steak potato"],
      ["Pancakes", "Chicken rice", "Nuts", "Beef wrap"]
    ],
    balanced: [
      ["Eggs + toast", "Chicken salad", "Fruit", "Rice bowl"],
      ["Labneh saj", "Tuna pasta", "Yogurt", "Grilled chicken"],
      ["Oats", "Turkey wrap", "Apple", "Home meal"]
    ],
    athlete: [
      ["Carb breakfast", "Pre-workout meal", "Post protein", "Recovery dinner"],
      ["Oats + honey", "Chicken pasta", "Shake", "Rice + beef"],
      ["Eggs + rice", "Turkey wrap", "Banana", "High-carb dinner"]
    ]
  };

  const days = ['Day 1', 'Day 2', 'Day 3'];
  const currentSchedule = scheduleData[id] || scheduleData.balanced;
  
  const mealsHtml = currentSchedule.map((list, index) => {
    const listItems = list.map(m => `<li>${m}</li>`).join('');
    return `
      <div class="schedule-day">
        <strong>${days[index]}</strong>
        <ul>${listItems}</ul>
      </div>
    `;
  }).join('');

  let box = document.getElementById('dietDetailBox');
  if (!box) {
    box = document.createElement('div');
    box.id = 'dietDetailBox';
    box.className = 'card premium-card diet-detail-box';
    document.querySelector('.container').appendChild(box);
  }

  box.innerHTML = `
    <div class="detail-head">
      <div>
        <p class="eyebrow">Detailed plan tracker</p>
        <h3>${plan.name}</h3>
        <p class="muted-text">This does more than show text: it gives a checklist, saves progress in localStorage, and shows a sample 3-day meal schedule.</p>
      </div>
      <button class="btn btn-outline btn-sm" onclick="document.getElementById('dietDetailBox').remove()">Close</button>
    </div>
    
    <div class="tracker-list">
      ${stepsHtml}
    </div>
    
    <h3 class="mt-4">Sample Meal Schedule</h3>
    <div class="schedule-grid">
      ${mealsHtml}
    </div>
  `;

  box.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function toggleDietStep(id, index, isChecked) {
  const tracker = JSON.parse(localStorage.getItem(`diet_tracker_${id}`) || '{}');
  tracker[index] = isChecked;
  localStorage.setItem(`diet_tracker_${id}`, JSON.stringify(tracker));
  showToast(isChecked ? 'Progress updated.' : 'Step unchecked.', 'green');
}

function updateMacroPreview(planId) {
  const macrosData = {
    cutting: [165, 160, 55],
    muscle: [180, 330, 80],
    balanced: [150, 240, 70],
    athlete: [190, 380, 85]
  };
  
  const macros = macrosData[planId] || macrosData.balanced;
  const box = document.getElementById('macroPreview');
  
  if (!box) return;

  box.innerHTML = `
    <div class="macro-pill"><span>Protein</span><strong>${macros[0]}g</strong></div>
    <div class="macro-pill"><span>Carbs</span><strong>${macros[1]}g</strong></div>
    <div class="macro-pill"><span>Fat</span><strong>${macros[2]}g</strong></div>
  `;
}

function recommendPlan() {
  const goal = document.getElementById('dietGoal')?.value || 'maintain';
  const days = parseInt(document.getElementById('trainingDays')?.value || '4', 10);
  
  let id = 'balanced';
  
  if (goal === 'cut') id = 'cutting';
  if (goal === 'bulk') id = 'muscle';
  if (goal === 'performance' || days >= 6) id = 'athlete';

  const plan = dietPlans.find(p => p.id === id);
  updateMacroPreview(id);
  
  const resultBox = document.getElementById('recommendResult');
  if (resultBox && plan) {
    resultBox.classList.remove('is-hidden');
    resultBox.innerHTML = `
      <strong>${plan.name}</strong>
      <p class="muted-text no-margin">Best match: ${plan.target} • ${plan.calories} • ${plan.duration}.</p>
      <button class="btn btn-red btn-sm mt-2" onclick="buyPlan('${plan.id}')">Choose this plan</button>
    `;
  }
}

function loadDietPage() {
  requireLogin();
  initNav();
  initTheme();
  
  renderDietPlans();
  updateMacroPreview(getPurchasedPlan() || "balanced");
  
  const recommendBtn = document.getElementById("recommendPlanBtn");
  if (recommendBtn) {
    recommendBtn.addEventListener("click", recommendPlan);
  }
}

window.addEventListener("DOMContentLoaded", loadDietPage);
