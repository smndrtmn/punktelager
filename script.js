import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js';
import { getFirestore, collection, getDocs, setDoc, doc, addDoc } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';
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

const activitySelect = document.getElementById("activity-select");
const pointsForm = document.getElementById("points-form");

async function loadData() {
  const activities = await getDocs(collection(db, "activities"));
  activitySelect.innerHTML = "";
  activities.forEach(a => {
    const opt = document.createElement("option");
    opt.value = a.id;
    opt.textContent = a.data().name;
    activitySelect.appendChild(opt);
  });

  const groups = await getDocs(collection(db, "groups"));
  pointsForm.innerHTML = "";
  groups.forEach(g => {
    const d = document.createElement("div");
    d.className = "group-row";
    d.innerHTML = `
      <strong>${g.data().name}</strong><br/>
      <label>Punkte: <input type="number" id="points-${g.id}" min="0" max="100" /></label><br/>
      <label>Bonus: <input type="number" id="bonus-${g.id}" min="0" max="3" /></label><br/>
      <label>Kommentar:<br/><textarea id="comment-${g.id}" rows="2"></textarea></label>
    `;
    pointsForm.appendChild(d);
  });
}
window.submitScores = async function () {
  const act = activitySelect.value;
  const groups = await getDocs(collection(db, "groups"));
  groups.forEach(async g => {
    const id = g.id;
    const data = {
      activityId: act,
      groupId: id,
      points: parseInt(document.getElementById(`points-${id}`).value) || 0,
      bonus: parseInt(document.getElementById(`bonus-${id}`).value) || 0,
      comment: document.getElementById(`comment-${id}`).value || ""
    };
    await setDoc(doc(db, "scores", `${act}_${id}`), data);
  });
  alert("Punkte gespeichert!");
};
document.addEventListener("DOMContentLoaded", loadData);