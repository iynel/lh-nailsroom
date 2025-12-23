// ─────────────────────────────────────────
// 🔥 IMPORTS FIREBASE
// ─────────────────────────────────────────
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, getDocs, getDoc, doc,
  updateDoc, deleteDoc, query, where, onSnapshot
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ─────────────────────────────────────────
// 🔥 CONFIG FIREBASE
// ─────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyByz6_IgraCBmMJSw0Z1DQno760bTPWVQ0",
  authDomain: "lh-nailsroom.firebaseapp.com",
  projectId: "lh-nailsroom",
  storageBucket: "lh-nailsroom.firebasestorage.app",
  messagingSenderId: "147376012584",
  appId: "1:147376012584:web:a934c3901931d9519ea41d",
  measurementId: "G-6BYHZ8SN14"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ─────────────────────────────────────────
// 💅 TAMPONS (dernier = -10€ en rose)
// ─────────────────────────────────────────
const STAMPS = {
  1: "🎀",
  2: "💕",
  3: "🫦",
  4: "🎀",
  5: "💕",
  6: "🫦",
  7: "🎀",
  8: "-10€"
};

const MAX_STAMPS = 8;

// 🔥 pour le live côté cliente
let unsubscribeClientLive = null;

// ─────────────────────────────────────────
// 🧩 Helpers DOM
// ─────────────────────────────────────────
const $ = (id) => document.getElementById(id);

// ─────────────────────────────────────────
// 🌸 NAVIGATION
// ─────────────────────────────────────────
function showClient() {
  $("choiceSection").style.display = "none";
  $("proSection").style.display = "none";
  $("clientSection").style.display = "block";
}

function showPro() {
  $("choiceSection").style.display = "none";
  $("clientSection").style.display = "none";
  $("proSection").style.display = "block";
}

function goHome() {
  if (unsubscribeClientLive) {
    unsubscribeClientLive();
    unsubscribeClientLive = null;
  }

  $("choiceSection").style.display = "block";
  $("clientSection").style.display = "none";
  $("proSection").style.display = "none";

  if ($("clientCard")) $("clientCard").style.display = "none";
  if ($("clientLogout")) $("clientLogout").style.display = "none";
  if ($("clientForm")) $("clientForm").style.display = "block";

  ["prenom", "nom", "email"].forEach((id) => {
    if ($(id)) $(id).value = "";
  });

  if ($("proDashboard")) $("proDashboard").style.display = "none";
  if ($("proPassword")) {
    $("proPassword").value = "";
    $("proPassword").style.display = "block";
  }
  if ($("loginProBtn")) $("loginProBtn").style.display = "block";
  if ($("proResults")) $("proResults").innerHTML = "";
  if ($("proClientName")) $("proClientName").textContent = "";
  if ($("selectedClientId")) $("selectedClientId").value = "";
}

window.showClient = showClient;
window.showPro = showPro;
window.goHome = goHome;

// ─────────────────────────────────────────
// 👩‍🦰 CLIENTE : LOGIN OU CRÉATION
// ─────────────────────────────────────────
window.loginOrCreateClient = async function () {
  const prenom = $("prenom").value.trim();
  const nom = $("nom").value.trim();
  const email = $("email").value.trim().toLowerCase();

  if (!prenom || !nom || !email) {
    alert("Veuillez remplir prénom, nom et email");
    return;
  }

  const q = query(
    collection(db, "clients"),
    where("prenom", "==", prenom),
    where("nom", "==", nom),
    where("email", "==", email)
  );

  const snap = await getDocs(q);
  let id = null;

  if (!snap.empty) {
    id = snap.docs[0].id;
  } else {
    const newDoc = await addDoc(collection(db, "clients"), {
      prenom,
      nom,
      email,
      tampons: 0
    });
    id = newDoc.id;
  }

  showClientCardLive(id);
};

// ─────────────────────────────────────────
// 💳 CLIENTE : affichage + LIVE
// ─────────────────────────────────────────
function renderClientCardData(c) {
  if ($("clientName")) $("clientName").textContent = "LH Nailsroom";

  document.querySelectorAll("#clientCard .stamp").forEach((stamp) => {
    const n = parseInt(stamp.dataset.num, 10);
    const active = n <= (c.tampons || 0);

    stamp.classList.toggle("active", active);

    if (!active) {
      stamp.textContent = "";
      return;
    }

    if (n === 8) {
      stamp.innerHTML = `<span class="reward-stamp">${STAMPS[n]}</span>`;
    } else {
      stamp.textContent = STAMPS[n];
    }
  });
}

function showClientCardLive(id) {
  if (unsubscribeClientLive) {
    unsubscribeClientLive();
    unsubscribeClientLive = null;
  }

  $("clientForm").style.display = "none";
  $("clientCard").style.display = "block";
  $("clientLogout").style.display = "block";

  const ref = doc(db, "clients", id);

  unsubscribeClientLive = onSnapshot(ref, (snap) => {
    if (!snap.exists()) return;
    renderClientCardData(snap.data());
  });
}

// ─────────────────────────────────────────
// 🧑‍💼 PRO : LOGIN
// ─────────────────────────────────────────
const PRO_PASSWORD = "Guinkirchen780271";

window.loginPro = function () {
  const pwd = $("proPassword").value;

  if (pwd !== PRO_PASSWORD) {
    alert("Mot de passe incorrect");
    return;
  }

  $("proPassword").style.display = "none";
  $("loginProBtn").style.display = "none";
  $("proDashboard").style.display = "block";
};

window.logoutPro = function () {
  goHome();
};

// ─────────────────────────────────────────
// 🔍 PRO : RECHERCHE CLIENTES
// ─────────────────────────────────────────
window.searchClients = async function () {
  const search = $("proSearch").value.toLowerCase();
  const results = $("proResults");
  results.innerHTML = "";

  const snap = await getDocs(collection(db, "clients"));

  snap.forEach((docu) => {
    const c = docu.data();
    const id = docu.id;

    const match = `${c.prenom} ${c.nom} ${c.email}`.toLowerCase();

    if (match.includes(search)) {
      const div = document.createElement("div");
      div.className = "search-item";
      div.textContent = `${c.prenom} ${c.nom} (${c.email})`;
      div.onclick = () => selectProClient(id);
      results.appendChild(div);
    }
  });
};

// ─────────────────────────────────────────
// 📝 PRO : AFFICHER CLIENTE
// ─────────────────────────────────────────
async function selectProClient(id) {
  $("selectedClientId").value = id;

  const snap = await getDoc(doc(db, "clients", id));
  if (!snap.exists()) return;

  const c = snap.data();

  $("proClientName").textContent = `${c.prenom} ${c.nom}`;

  document.querySelectorAll("#proDashboard .stamp").forEach((stamp) => {
    const n = parseInt(stamp.dataset.num, 10);
    const active = n <= (c.tampons || 0);

    stamp.classList.toggle("active", active);

    if (!active) {
      stamp.textContent = "";
      return;
    }

    if (n === 8) {
      stamp.innerHTML = `<span class="reward-stamp">${STAMPS[n]}</span>`;
    } else {
      stamp.textContent = STAMPS[n];
    }
  });
}

// ─────────────────────────────────────────
// ➕ PRO : AJOUTER TAMPON
// ─────────────────────────────────────────
window.addStamp = async function () {
  const id = $("selectedClientId").value;
  if (!id) return alert("Sélectionne une cliente d'abord.");

  const ref = doc(db, "clients", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const current = snap.data().tampons || 0;

  await updateDoc(ref, { tampons: Math.min(MAX_STAMPS, current + 1) });
  selectProClient(id);
};

// ─────────────────────────────────────────
// 🔄 PRO : RESET
// ─────────────────────────────────────────
window.resetCard = async function () {
  const id = $("selectedClientId").value;
  if (!id) return alert("Sélectionne une cliente d'abord.");

  await updateDoc(doc(db, "clients", id), { tampons: 0 });
  selectProClient(id);
};

// ─────────────────────────────────────────
// 🗑 PRO : SUPPRIMER CLIENTE
// ─────────────────────────────────────────
window.deleteClient = async function () {
  const id = $("selectedClientId").value;
  if (!id) return alert("Sélectionne une cliente d'abord.");

  if (!confirm("Supprimer cette cliente ?")) return;

  await deleteDoc(doc(db, "clients", id));

  alert("Cliente supprimée.");
  $("proResults").innerHTML = "";
  $("proClientName").textContent = "";
  $("selectedClientId").value = "";
};
