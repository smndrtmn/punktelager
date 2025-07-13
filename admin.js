import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js';
import { getFirestore, collection, getDocs, addDoc, doc } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';
import { getAuth, signInAnonymously } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js';

const firebaseConfig = {
    apiKey: "AIzaSyCwCC4f0gehJcwVQUrAy543eVrQS2LRjeo",
    authDomain: "punktelager.firebaseapp.com",
    projectId: "punktelager",
    storageBucket: "punktelager.firebasestorage.app",
    messagingSenderId: "115411096712",
    appId: "1:115411096712:web:aa04cf1c698538966abb3d",
    measurementId: "G-BEBNMK8KM1"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
signInAnonymously(getAuth(app));

const PASS = "lageradmin";

window.checkLogin = function () {
  const pass = document.getElementById("admin-pass").value;
  if (pass === PASS) {
    document.getElementById("login-section").style.display = "none";
    document.getElementById("admin-panel").style.display = "block";
    loadAdminData();
  } else {
    alert("Falsches Passwort");
  }
};

window.addActivity = async function () {
  const name = document.getElementById("activity-name").value;
  const date = document.getElementById("activity-date").value;
  await addDoc(collection(db, "activities"), { name, date });
  alert("Aktivität hinzugefügt");
  loadAdminData();
};

window.addGroup = async function () {
  const name = document.getElementById("group-name").value;
  const house = document.getElementById("group-house").value;
  await addDoc(collection(db, "groups"), { name, house });
  alert("Gruppe hinzugefügt");
  loadAdminData();
};

async function loadAdminData() {
  const scores = await getDocs(collection(db, "scores"));
  const scoreMap = {};
  scores.forEach(doc => {
    const d = doc.data();
    if (!scoreMap[d.groupId]) scoreMap[d.groupId] = 0;
    scoreMap[d.groupId] += d.points + d.bonus;
  });

  const groups = await getDocs(collection(db, "groups"));
  let out = "<ol>";
  const houses = {};
  groups.forEach(g => {
    const d = g.data();
    const score = scoreMap[g.id] || 0;
    out += `<li>${d.name} (${d.house}): ${score} Punkte</li>`;
    houses[d.house] = (houses[d.house] || 0) + score;
  });
  out += "</ol>";
  document.getElementById("rankings").innerHTML = out;

  let overview = "";
  scores.forEach(doc => {
    const d = doc.data();
    overview += `<p><strong>${d.groupId}</strong> bei ${d.activityId}: ${d.points}+${d.bonus} – ${d.comment}</p>`;
  });
  document.getElementById("score-overview").innerHTML = overview;
}
