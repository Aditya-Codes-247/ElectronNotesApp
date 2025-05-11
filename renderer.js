const { ipcRenderer } = require('electron');

let notes = [];
let selectedId = null;

const notesList = document.getElementById('notes-list');
const noteContent = document.getElementById('note-content');
const newNoteBtn = document.getElementById('new-note');
const deleteNoteBtn = document.getElementById('delete-note');
const exportNoteBtn = document.getElementById('export-note');
const pinNoteBtn = document.getElementById('pin-note');
const wordCount = document.getElementById('word-count');
const noteTimestamp = document.getElementById('note-timestamp');
const searchInput = document.getElementById('search-notes');
const welcomeOverlay = document.getElementById('welcome-overlay');
const welcomeBtn = document.getElementById('welcome-btn');
const appDiv = document.getElementById('app');
const darkSwitch = document.getElementById('dm-switch');
const body = document.body;

let isDarkMode = true;
function setDarkMode(dark) {
  isDarkMode = dark;
  if (dark) {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
}
darkSwitch.addEventListener('change', (e) => setDarkMode(!e.target.checked));
setDarkMode(true);

function runWelcome3D() {
  let canvas = document.getElementById('welcome-3d');
  if (canvas) canvas.innerHTML = '';
  const width = window.innerWidth, height = window.innerHeight;
  const renderer = new THREE.WebGLRenderer({canvas: canvas, alpha: true, antialias: true});
  renderer.setSize(width, height);
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, width/height, 0.1, 1000);
  camera.position.z = 8;
  const light = new THREE.DirectionalLight(0x9fd7fe, 1);
  light.position.set(3,4,5);
  scene.add(light);

  const geometry = new THREE.IcosahedronGeometry(2.4, 2);
  const material = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0.22,
    roughness: 0.06,
    transmission: 0.90,
    transparent: true,
    opacity: 0.80,
    thickness: 0.5,
    reflectivity: 0.8,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
    envMapIntensity: 0.5
  });
  const sphere = new THREE.Mesh(geometry, material);
  sphere.position.set(0,0,0);
  scene.add(sphere);

  let animId;
  function animate() {
    animId = requestAnimationFrame(animate);
    sphere.rotation.y += 0.0125;
    sphere.rotation.x += 0.004;
    renderer.render(scene, camera);
  }
  animate();
  window.addEventListener('resize', function() {
    const nw=window.innerWidth, nh=window.innerHeight;
    camera.aspect = nw/nh;
    camera.updateProjectionMatrix();
    renderer.setSize(nw, nh);
  });
}

window.addEventListener('DOMContentLoaded', async () => {
  runWelcome3D();
  appDiv.style.opacity = '0';
  await loadNotesFromDisk();
});
welcomeBtn.addEventListener('click', () => {
  welcomeOverlay.classList.add('hide');
  setTimeout(() => {
    welcomeOverlay.style.display = 'none';
    appDiv.style.opacity = '1';
  }, 840);
});

// Enhanced Notes Model: pinned, timestamp
function newNoteObj() {
  return {
    id: String(Date.now()),
    content: '',
    pinned: false,
    updated: Date.now()
  };
}

// List filtering & rendering
let filterText = '';
function applyFilter(notesArr) {
  if (!filterText) return notesArr;
  return notesArr.filter(n => n.content.toLowerCase().includes(filterText));
}
function sortNotes(narr) {
  // pinned first, then recency
  return narr.slice().sort((a, b) =>
    (b.pinned - a.pinned) || (b.updated - a.updated)
  );
}
function renderNotes() {
  const filtered = sortNotes(applyFilter(notes));
  notesList.innerHTML = '';
  filtered.forEach((note) => {
    const li = document.createElement('li');
    li.dataset.id = note.id;
    if (note.pinned) {
      li.classList.add('pinned');
      const pin = document.createElement('span');
      pin.classList.add('pin-indicator');
      pin.innerHTML = '&#9733;';
      li.appendChild(pin);
    }
    li.appendChild(document.createTextNode(
      note.content.length > 0 ? note.content.slice(0, 32) : 'Untitled note'
    ));
    li.classList.toggle('selected', note.id === selectedId);
    li.onclick = () => selectNote(note.id);
    notesList.appendChild(li);
  });
}

function selectNote(id) {
  selectedId = id;
  const note = notes.find(n => n.id === id);
  noteContent.value = note ? note.content : '';
  noteContent.disabled = !note;
  deleteNoteBtn.disabled = !note;
  exportNoteBtn.disabled = !note;
  pinNoteBtn.disabled = !note;
  updateToolbar(note);
  updateWordCount(note ? note.content : '');
  renderNotes();
}
function updateToolbar(note) {
  if (!note) {
    pinNoteBtn.classList.remove('pinned');
    pinNoteBtn.innerHTML = '&#9734;';
    noteTimestamp.textContent = '';
    return;
  }
  pinNoteBtn.classList.toggle('pinned', !!note.pinned);
  pinNoteBtn.innerHTML = note.pinned ? '&#9733;' : '&#9734;';
  noteTimestamp.textContent = 'Last edited: ' + (new Date(note.updated)).toLocaleString();
}
function updateWordCount(content) {
  const words = content ? content.trim().split(/\s+/).filter(Boolean).length : 0;
  wordCount.textContent = `${words} word${words===1?'':'s'}`;
}

// IPC Storage
async function saveNotesToDisk() { await ipcRenderer.invoke('notes:save', notes);}
async function loadNotesFromDisk() {
  notes = await ipcRenderer.invoke('notes:load') || [];
  if (notes.length > 0) {
    selectedId = sortNotes(notes)[0].id;
    selectNote(selectedId);
  } else {
    noteContent.value = '';
    noteContent.disabled = true;
    deleteNoteBtn.disabled = true;
    exportNoteBtn.disabled = true;
    pinNoteBtn.disabled = true;
    updateWordCount('');
    noteTimestamp.textContent = '';
  }
  renderNotes();
}

function updateCurrentNote(content) {
  const idx = notes.findIndex(n => n.id === selectedId);
  if (idx >= 0) {
    notes[idx].content = content;
    notes[idx].updated = Date.now();
    saveNotesToDisk();
    updateWordCount(content);
    updateToolbar(notes[idx]);
    renderNotes();
  }
}
function addNote() {
  const note = newNoteObj();
  notes.unshift(note);
  selectedId = note.id;
  saveNotesToDisk();
  renderNotes();
  selectNote(note.id);
}
function deleteCurrentNote() {
  const idx = notes.findIndex(n => n.id === selectedId);
  if (idx >= 0) {
    notes.splice(idx, 1);
    saveNotesToDisk();
    renderNotes();
    setTimeout(() => {
      const sorted = sortNotes(notes);
      selectedId = sorted[0] ? sorted[0].id : null;
      if (selectedId) selectNote(selectedId);
      else {
        noteContent.value = '';
        noteContent.disabled = true;
        deleteNoteBtn.disabled = true;
        exportNoteBtn.disabled = true;
        pinNoteBtn.disabled = true;
        updateWordCount('');
        noteTimestamp.textContent = '';
      }
    }, 420);
  }
}
function togglePinCurrentNote() {
  const idx = notes.findIndex(n => n.id === selectedId);
  if (idx >= 0) {
    notes[idx].pinned = !notes[idx].pinned;
    notes[idx].updated = Date.now();
    saveNotesToDisk();
    renderNotes();
    selectNote(notes[idx].id);
  }
}
function exportCurrentNoteAsPDF() {
  const note = notes.find(n => n.id === selectedId);
  if (!note) return;
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFont('helvetica','bold');
  doc.setFontSize(18);
  doc.text("Electron Note", 10, 18);
  doc.setFont('helvetica','normal');
  doc.setFontSize(14);
  const splitContent = doc.splitTextToSize(note.content, 175);
  doc.text(splitContent, 10, 32);
  doc.text(`\n\nLast edited: ${(new Date(note.updated)).toLocaleString()}`, 10, doc.lastAutoTable ? (doc.lastAutoTable.finalY + 10) : 80);
  doc.save('note.pdf');
}

noteContent.addEventListener('input', (e) => updateCurrentNote(e.target.value));
newNoteBtn.addEventListener('click', addNote);
deleteNoteBtn.addEventListener('click', deleteCurrentNote);
exportNoteBtn.addEventListener('click', exportCurrentNoteAsPDF);
pinNoteBtn.addEventListener('click', togglePinCurrentNote);
searchInput.addEventListener('input', (e) => {
  filterText = e.target.value.toLowerCase();
  renderNotes();
});