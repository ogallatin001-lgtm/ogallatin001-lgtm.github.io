// Game State
let state = {
    gold: 0,
    xp: 0,
    level: 1,
    herbs: { lavender: 0, nightshade: 0 },
    potions: { health: 0, mana: 0 },
    currentCustomer: null
};

// Config
const recipes = {
    health: { lavender: 2, xp: 10, value: 15 },
    mana: { lavender: 1, nightshade: 1, xp: 25, value: 40 }
};

function updateUI() {
    document.getElementById('gold').innerText = state.gold;
    document.getElementById('xp').innerText = state.xp;
    document.getElementById('level').innerText = state.level;
    document.getElementById('inv-lavender').innerText = state.herbs.lavender;
    document.getElementById('inv-nightshade').innerText = state.herbs.nightshade;
    document.getElementById('inv-potions').innerText = state.potions.health + state.potions.mana;
    
    // Unlock logic
    if (state.level >= 2) {
        document.getElementById('btn-nightshade').disabled = false;
        document.getElementById('btn-mana').disabled = false;
    }
}

function harvest(type) {
    state.herbs[type]++;
    updateUI();
}

function brew(type) {
    const recipe = recipes[type];
    let canBrew = true;

    for (let ingredient in recipe) {
        if (ingredient !== 'xp' && ingredient !== 'value') {
            if (state.herbs[ingredient] < recipe[ingredient]) canBrew = false;
        }
    }

    if (canBrew) {
        for (let ingredient in recipe) {
            if (ingredient !== 'xp' && ingredient !== 'value') state.herbs[ingredient] -= recipe[ingredient];
        }
        state.potions[type]++;
        gainXP(recipe.xp);
        updateUI();
    } else {
        alert("Not enough ingredients!");
    }
}

function gainXP(amount) {
    state.xp += amount;
    if (state.xp >= state.level * 50) {
        state.level++;
        state.xp = 0;
        document.getElementById('log').innerText = "Level Up! New recipes unlocked!";
    }
}

// Customer System
function spawnCustomer() {
    if (state.currentCustomer) return;

    const types = state.level >= 2 ? ['health', 'mana'] : ['health'];
    const want = types[Math.floor(Math.random() * types.length)];
    
    state.currentCustomer = { want: want, price: recipes[want].value };
    document.getElementById('customer-request').innerText = `Customer wants: 1 ${want} potion`;
    document.getElementById('btn-serve').style.display = 'inline-block';
}

function serveCustomer() {
    const want = state.currentCustomer.want;
    if (state.potions[want] > 0) {
        state.potions[want]--;
        state.gold += state.currentCustomer.price;
        state.currentCustomer = null;
        document.getElementById('customer-request').innerText = "Looking for next customer...";
        document.getElementById('btn-serve').style.display = 'none';
        updateUI();
    } else {
        alert("You don't have that potion!");
    }
}

// Tick Engine
setInterval(spawnCustomer, 5000); // Try to spawn a customer every 5 seconds
updateUI();
