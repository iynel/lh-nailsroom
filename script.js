// 🔥 Import Firebase (OBLIGATOIRE avec type="module")
import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";

import {
    getFirestore, collection, addDoc, getDocs, getDoc, doc,
    updateDoc, deleteDoc, query, where
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";



/* ----------------------------
      CONFIG FIREBASE
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
    location.reload();
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
       CLIENTE : LOGIN/CREATE
-----------------------------*/
async function loginOrCreateClient() {
    let prenom = document.getElementById("prenom").value.trim();
    let nom = document.getElementById("nom").value.trim();
    let email = document.getElementById("email").value.trim().toLowerCase();

    if (!prenom || !nom || !email) {
        alert("Veuillez remplir prénom, nom et email");
        return;
    }

    // Chercher si cliente existe
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
        // Nouvelle cliente
        const newDoc = await addDoc(collection(db, "clients"), {
            prenom,
            nom,
            email,
            tampons: 0
        });
        id = newDoc.id;
    }

    showClientCard(id);
}

/* ----------------------------
      CLIENTE : AFFICHE CARTE
-----------------------------*/
async function showClientCard(id) {
    const clientRef = doc(db, "clients", id);
    const clientSnap = await getDoc(clientRef);

    if (!clientSnap.exists()) return;

    let c = clientSnap.data();

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
       PRO : LOGIN
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

/* ----------------------------
      PRO : RECHERCHE CLIENT
-----------------------------*/
async function searchClients() {
    let search = document.getElementById("proSearch").value.toLowerCase();
    let results = document.getElementById("proResults");
    results.innerHTML = "";

    const snap = await getDocs(collection(db, "clients"));

    snap.forEach(docu => {
        let c = docu.data();
        let id = docu.id;

        let text = (c.prenom + " " + c.nom + " " + c.email).toLowerCase();

        if (text.includes(search)) {
            let div = document.createElement("div");
            div.className = "search-item";
            div.textContent = `${c.prenom} ${c.nom} (${c.email})`;
            div.onclick = () => selectProClient(id);
            results.appendChild(div);
        }
    });
}

/* ----------------------------
      PRO : VOIR CLIENT
-----------------------------*/
async function selectProClient(id) {
    document.getElementById("selectedClientId").value = id;

    const snap = await getDoc(doc(db, "clients", id));
    let c = snap.data();

    document.getElementById("proClientName").textContent = c.prenom + " " + c.nom;
    document.getElementById("proStampCount").textContent = c.tampons;

    document.querySelectorAll("#proDashboard .stamp").forEach(stamp => {
        let n = parseInt(stamp.dataset.num);
        stamp.textContent = n <= c.tampons ? STAMPS[n] : "";
        stamp.classList.toggle("active", n <= c.tampons);
    });
}

/* ----------------------------
      PRO : AJOUT TAMPON
-----------------------------*/
async function addStamp() {
    let id = document.getElementById("selectedClientId").value;
    const ref = doc(db, "clients", id);

    const snap = await getDoc(ref);
    let current = snap.data().tampons;

    await updateDoc(ref, { tampons: Math.min(8, current + 1) });

    selectProClient(id);
}

/* ----------------------------
      PRO : RESET
-----------------------------*/
async function resetCard() {
    let id = document.getElementById("selectedClientId").value;
    await updateDoc(doc(db, "clients", id), { tampons: 0 });
    selectProClient(id);
}

/* ----------------------------
      PRO : SUPPRESSION
-----------------------------*/
async function deleteClient() {
    let id = document.getElementById("selectedClientId").value;

    if (!confirm("Supprimer cette cliente ?")) return;

    await deleteDoc(doc(db, "clients", id));

    alert("Cliente supprimée.");
    document.getElementById("proClientName").textContent = "";
    document.getElementById("proResults").innerHTML = "";
}
