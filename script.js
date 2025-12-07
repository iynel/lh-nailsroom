/* ----------------------------
      INITIALISATION FIREBASE
-----------------------------*/
  const firebaseConfig = {
    apiKey: "AIzaSyByz6_IgraCBmMJSw0Z1DQno760bTPWVQ0",
    authDomain: "lh-nailsroom.firebaseapp.com",
    projectId: "lh-nailsroom",
    storageBucket: "lh-nailsroom.firebasestorage.app",
    messagingSenderId: "147376012584",
    appId: "1:147376012584:web:a934c3901931d9519ea41d",
    measurementId: "G-6BYHZ8SN14"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);

/* ----------------------------
     SYSTEME DES TAMPONS
-----------------------------*/
const STAMPS = {
    1: "💅",
    2: "🎀",
    3: "🫦",
    4: "💕",
    5: "💕",
    6: "🫦",
    7: "🎀",
    8: "💅"
};

/* ----------------------------
       NAVIGATION
-----------------------------*/
function goHome() {
    document.getElementById("choiceSection").style.display = "block";
    document.getElementById("clientSection").style.display = "none";
    document.getElementById("proSection").style.display = "none";

    document.getElementById("prenom").value = "";
    document.getElementById("nom").value = "";
    document.getElementById("email").value = "";

    document.getElementById("clientCard").style.display = "none";
}

function showClient() {
    document.getElementById("choiceSection").style.display = "none";
    document.getElementById("clientSection").style.display = "block";
}

function showPro() {
    document.getElementById("choiceSection").style.display = "none";
    document.getElementById("proSection").style.display = "block";
}

/* ----------------------------
       LOGIN / CREATE CLIENT
-----------------------------*/
async function loginOrCreateClient() {
    let prenom = document.getElementById("prenom").value.trim();
    let nom = document.getElementById("nom").value.trim();
    let email = document.getElementById("email").value.trim().toLowerCase();

    if (!prenom || !nom || !email) {
        alert("Veuillez remplir prénom, nom et email");
        return;
    }

    // Chercher si la cliente existe
    let query = await db.collection("clients")
        .where("prenom", "==", prenom)
        .where("nom", "==", nom)
        .where("email", "==", email)
        .get();

    let id = null;

    if (!query.empty) {
        id = query.docs[0].id;
    } else {
        // Ajouter une nouvelle cliente
        let newClient = await db.collection("clients").add({
            prenom,
            nom,
            email,
            tampons: 0
        });
        id = newClient.id;
    }

    showClientCard(id);
}

/* ----------------------------
       AFFICHAGE CARTE CLIENT
-----------------------------*/
async function showClientCard(id) {
    let doc = await db.collection("clients").doc(id).get();
    let c = doc.data();

    document.getElementById("clientCard").style.display = "block";
    document.getElementById("clientName").textContent = c.prenom + " " + c.nom;
    document.getElementById("stampCount").textContent = c.tampons;

    document.querySelectorAll("#clientCard .stamp").forEach(stamp => {
        let n = parseInt(stamp.dataset.num);
        stamp.textContent = n <= c.tampons ? STAMPS[n] : "";
        stamp.classList.toggle("active", n <= c.tampons);
    });
}

/* ----------------------------
      PRO : CONNEXION
-----------------------------*/
const PRO_PASSWORD = "1234";

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

/* ----------------------------
      PRO : RECHERCHE CLIENT
-----------------------------*/
async function searchClients() {
    let search = document.getElementById("proSearch").value.toLowerCase();
    let results = document.getElementById("proResults");
    results.innerHTML = "";

    let clients = await db.collection("clients").get();

    clients.forEach(doc => {
        let c = doc.data();
        let id = doc.id;

        let full = (c.prenom + " " + c.nom + " " + c.email).toLowerCase();

        if (full.includes(search)) {
            let div = document.createElement("div");
            div.className = "search-item";
            div.textContent = `${c.prenom} ${c.nom} (${c.email})`;
            div.onclick = () => selectProClient(id);
            results.appendChild(div);
        }
    });
}

/* ----------------------------
      PRO : AFFICHAGE CLIENT
-----------------------------*/
async function selectProClient(id) {
    let doc = await db.collection("clients").doc(id).get();
    let c = doc.data();

    document.getElementById("selectedClientId").value = id;
    document.getElementById("proClientName").textContent = `${c.prenom} ${c.nom}`;
    document.getElementById("proStampCount").textContent = c.tampons;

    document.querySelectorAll("#proDashboard .stamp").forEach(stamp => {
        let n = parseInt(stamp.dataset.num);
        stamp.textContent = n <= c.tampons ? STAMPS[n] : "";
        stamp.classList.toggle("active", n <= c.tampons);
    });
}

/* ----------------------------
      PRO : AJOUT / RESET
-----------------------------*/
async function addStamp() {
    let id = document.getElementById("selectedClientId").value;
    let doc = await db.collection("clients").doc(id).get();
    let current = doc.data().tampons;

    await db.collection("clients").doc(id).update({
        tampons: Math.min(8, current + 1)
    });

    selectProClient(id);
}

async function resetCard() {
    let id = document.getElementById("selectedClientId").value;

    await db.collection("clients").doc(id).update({
        tampons: 0
    });

    selectProClient(id);
}

/* ----------------------------
      PRO : SUPPRESSION CLIENT
-----------------------------*/
async function deleteClient() {
    let id = document.getElementById("selectedClientId").value;

    if (!confirm("Supprimer cette cliente ?")) return;

    await db.collection("clients").doc(id).delete();

    alert("Cliente supprimée.");
    document.getElementById("proClientName").textContent = "";
    document.getElementById("proStampCount").textContent = "";
    document.getElementById("proResults").innerHTML = "";
}
