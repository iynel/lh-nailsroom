const STAMPS = {
    1: "💅",
    2: "🎀",
    3: "🫦",
    4: "💕",
    5: "💕",
    6: "🫦",
    7: "🎀",
    8: "💅" // cadeau
};

let clients = JSON.parse(localStorage.getItem("clients")) || {};
const PRO_PASSWORD = "1234";

/* ----------- FONCTIONS UTILITAIRES ----------- */
function save() {
    localStorage.setItem("clients", JSON.stringify(clients));
}

/* ----------- NAVIGATION ----------- */
function goHome() {
    document.getElementById("choiceSection").style.display = "block";
    document.getElementById("clientSection").style.display = "none";
    document.getElementById("proSection").style.display = "none";

    document.getElementById("prenom").value = "";
    document.getElementById("nom").value = "";
    document.getElementById("email").value = "";

    document.getElementById("clientCard").style.display = "none";

    document.querySelectorAll("#clientCard .stamp").forEach(stamp => {
        stamp.textContent = "";
        stamp.classList.remove("active");
    });

    document.getElementById("proSearch").value = "";
    document.getElementById("proResults").innerHTML = "";
}

/* ----------- ESPACE CLIENTE ----------- */
function showClient() {
    document.getElementById("choiceSection").style.display = "none";
    document.getElementById("clientSection").style.display = "block";
}

function loginOrCreateClient() {
    let prenom = document.getElementById("prenom").value.trim();
    let nom = document.getElementById("nom").value.trim();
    let email = document.getElementById("email").value.trim().toLowerCase();

    if (!prenom || !nom || !email) {
        alert("Veuillez remplir prénom, nom et email");
        return;
    }

    let id = null;

    for (let key in clients) {
        let c = clients[key];
        if (c.prenom === prenom && c.nom === nom && c.email === email) {
            id = key;
        }
    }

    if (!id) {
        id = Date.now().toString();
        clients[id] = { prenom, nom, email, tampons: 0 };
        save();
    }

    showClientCard(id);
}

function showClientCard(id) {
    let c = clients[id];

    document.getElementById("clientCard").style.display = "block";
    document.getElementById("clientName").textContent = c.prenom + " " + c.nom;
    document.getElementById("stampCount").textContent = c.tampons;

    document.querySelectorAll("#clientCard .stamp").forEach(stamp => {
        let n = parseInt(stamp.dataset.num);
        stamp.textContent = n <= c.tampons ? STAMPS[n] : "";
        stamp.classList.toggle("active", n <= c.tampons);
    });
}

/* ----------- ESPACE PRO ----------- */
function showPro() {
    document.getElementById("choiceSection").style.display = "none";
    document.getElementById("proSection").style.display = "block";
}

function loginPro() {
    if (document.getElementById("proPassword").value !== PRO_PASSWORD) {
        alert("Mot de passe incorrect");
        return;
    }

    document.getElementById("proPassword").style.display = "none";
    document.getElementById("loginProBtn").style.display = "none";
    document.getElementById("proDashboard").style.display = "block";
}

function logoutPro() {
    location.reload();
}

/* ----------- RECHERCHE CLIENTE ----------- */
function searchClients() {
    let search = document.getElementById("proSearch").value.toLowerCase();
    let results = document.getElementById("proResults");
    results.innerHTML = "";

    for (let id in clients) {
        let c = clients[id];
        let full = (c.prenom + " " + c.nom + " " + c.email).toLowerCase();

        if (full.includes(search)) {
            let div = document.createElement("div");
            div.className = "search-item";
            div.textContent = `${c.prenom} ${c.nom} (${c.email})`;
            div.onclick = () => selectProClient(id);
            results.appendChild(div);
        }
    }
}

function selectProClient(id) {
    let c = clients[id];

    document.getElementById("selectedClientId").value = id;
    document.getElementById("proClientName").textContent = c.prenom + " " + c.nom;
    document.getElementById("proStampCount").textContent = c.tampons;

    document.querySelectorAll("#proDashboard .stamp").forEach(stamp => {
        let n = parseInt(stamp.dataset.num);
        stamp.textContent = n <= c.tampons ? STAMPS[n] : "";
        stamp.classList.toggle("active", n <= c.tampons);
    });
}

/* ----------- GESTION TAMPONS ----------- */
function addStamp() {
    let id = document.getElementById("selectedClientId").value;
    if (!id) return alert("Sélectionnez une cliente");

    clients[id].tampons = Math.min(8, clients[id].tampons + 1);
    save();
    selectProClient(id);
}

function resetCard() {
    let id = document.getElementById("selectedClientId").value;
    if (!id) return alert("Sélectionnez une cliente");

    clients[id].tampons = 0;
    save();
    selectProClient(id);
}

/* ----------- SUPPRESSION CLIENTE ----------- */
function deleteClient() {
    let id = document.getElementById("selectedClientId").value;

    if (!id) return alert("Sélectionnez une cliente");

    if (!confirm("Supprimer définitivement cette cliente ?")) return;

    delete clients[id];
    save();

    alert("Cliente supprimée.");

    document.getElementById("proClientName").textContent = "";
    document.getElementById("proStampCount").textContent = "";
    document.getElementById("proResults").innerHTML = "";
}
