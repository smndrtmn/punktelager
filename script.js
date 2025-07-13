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
const auth = getAuth(app);
signInAnonymously(auth);

async function fetchActivities() {
  const snapshot = await getDocs(collection(db, 'activities'));
  const select = document.getElementById('activity-select');
  select.innerHTML = '';
  snapshot.forEach(doc => {
    const opt = document.createElement('option');
    opt.value = doc.id;
    opt.textContent = doc.data().name;
    select.appendChild(opt);
  });
}

async function fetchGroups() {
  const snapshot = await getDocs(collection(db, 'groups'));
  const container = document.getElementById('groups');
  const list = document.getElementById('group-list');
  container.innerHTML = '';
  list.innerHTML = '';

  snapshot.forEach((doc, index) => {
    const group = doc.data();
    const div = document.createElement('div');
    div.className = 'group-row';
    div.innerHTML = `
      ${group.name}:
      <input type="number" id="group${index + 1}-points" placeholder="Punkte" min="0" max="10" />
      <input type="number" id="group${index + 1}-bonus" placeholder="Bonus" min="0" max="3" />
    `;
    container.appendChild(div);

    const li = document.createElement('li');
    li.textContent = `${group.name} (${group.house})`;
    list.appendChild(li);
  });
}

window.savePoints = async function savePoints() {
  const activityId = document.getElementById('activity-select').value;
  const groupDivs = document.querySelectorAll('.group-row');
  for (let i = 0; i < groupDivs.length; i++) {
    const groupId = `group${i + 1}`;
    const points = parseInt(document.getElementById(`group${i + 1}-points`).value) || 0;
    const bonus = parseInt(document.getElementById(`group${i + 1}-bonus`).value) || 0;
    await setDoc(doc(db, 'scores', `${activityId}_${groupId}`), {
      activityId,
      groupId,
      points,
      bonusPoints: bonus
    });
  }
  alert("Punkte gespeichert!");
}

window.createActivity = async function createActivity() {
  const name = document.getElementById('activity-name').value;
  const date = document.getElementById('activity-date').value;
  const maxPoints = parseInt(document.getElementById('activity-maxpoints').value) || 10;
  const allowBonus = document.getElementById('activity-bonus').checked;
  if (!name || !date) return alert("Bitte Name und Datum eingeben");
  await addDoc(collection(db, 'activities'), {
    name,
    date,
    maxPoints,
    allowBonus
  });
  alert("Aktivität angelegt!");
  await fetchActivities();
}

window.addGroup = async function addGroup() {
  const name = document.getElementById('group-name').value;
  const house = document.getElementById('group-house').value;
  if (!name) return alert("Gruppenname eingeben!");
  await addDoc(collection(db, 'groups'), {
    name,
    house
  });
  alert("Gruppe hinzugefügt!");
  document.getElementById('group-name').value = '';
  await fetchGroups();
}

document.addEventListener('DOMContentLoaded', () => {
  fetchActivities();
  fetchGroups();
});