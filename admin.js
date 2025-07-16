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
  const groupByHouse = document.getElementById("toggle-rank-view")?.checked;

  // Daten laden
  const [scoresSnap, groupsSnap] = await Promise.all([
    getDocs(collection(db, "scores")),
    getDocs(collection(db, "groups"))
  ]);

  // Gruppen-Map: groupId → { name, house }
  const groupDocs = {};
  groupsSnap.forEach(doc => {
    groupDocs[doc.id] = doc.data();
  });

  // Score-Map: groupId → Gesamtscore
  const scoreMap = {};
  scoresSnap.forEach(doc => {
    const d = doc.data();
    const gid = d.groupId;
    const sum = (d.points || 0) + (d.bonus || 0);
    scoreMap[gid] = (scoreMap[gid] || 0) + sum;
  });

  // Anzeige der Rangliste
  let rankingsOutput = "";
  if (groupByHouse) {
    const houseScores = {};
    Object.entries(scoreMap).forEach(([gid, score]) => {
      const house = groupDocs[gid]?.house || "Unbekannt";
      houseScores[house] = (houseScores[house] || 0) + score;
    });

    const sorted = Object.entries(houseScores).sort((a, b) => b[1] - a[1]);
    rankingsOutput = "<ol>";
    sorted.forEach(([house, total]) => {
      rankingsOutput += `<li><strong>${house}</strong>: ${total} Punkte</li>`;
    });
    rankingsOutput += "</ol>";
  } else {
    const groupList = Object.entries(scoreMap).map(([gid, score]) => {
      const g = groupDocs[gid];
      return {
        name: g?.name || "Unbekannt",
        house: g?.house || "Unbekannt",
        score
      };
    });

    groupList.sort((a, b) => b.score - a.score);

    rankingsOutput = "<ol>";
    groupList.forEach(g => {
      rankingsOutput += `<li>${g.name} (${g.house}): ${g.score} Punkte</li>`;
    });
    rankingsOutput += "</ol>";
  }

  document.getElementById("rankings").innerHTML = rankingsOutput;

  // Punkteübersicht mit Details
  let overview = "";
  scoresSnap.forEach(doc => {
    const d = doc.data();
    const g = groupDocs[d.groupId];
    const groupName = g?.name || d.groupId;
    const activity = d.activityId || "Unbekannt";
    overview += `<p><strong>${groupName}</strong> bei ${activity}: ${d.points}+${d.bonus} – ${d.comment || ""}</p>`;
  });
  document.getElementById("score-overview").innerHTML = overview;
}

window.loadAdminData = loadAdminData;

