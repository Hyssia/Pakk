document.addEventListener('DOMContentLoaded', function () {
  // Initialize Firebase
  const firebaseConfig = {
    apiKey: 'AIzaSyAvaXLxAX580y8HfF_Vp4blHsm_b1notvU',
    authDomain: 'pm5dashboard.firebaseapp.com',
    projectId: 'pm5dashboard',
    storageBucket: 'pm5dashboard.appspot.com',
    messagingSenderId: '319947922125',
    appId: '1:319947922125:web:30cb9b06deff8b855d2784',
    measurementId: 'G-BSDFEN5ESR',
  };
  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();

  const addValveButton = document.getElementById('addValveButton');
  const clearListButton = document.getElementById('clearListButton');
  const confirmClearButton = document.getElementById('confirmClearButton');
  const valveList = document.getElementById('valveList');
  const valveForm = document.getElementById('valveForm');
  const addValveModal = new bootstrap.Modal(document.getElementById('addValveModal'));
  const clearListModal = new bootstrap.Modal(document.getElementById('clearListModal'));
  const resetModal = new bootstrap.Modal(document.getElementById('resetModal'));
  const undoButton = document.getElementById('undoButton');

  let valves = [];
  let resetIndex = null;
  let valvesBackup = [];

  addValveButton.addEventListener('click', function () {
    addValveModal.show();
  });

  valveForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const valveName = document.getElementById('valveName').value;
    // const dateField = document.getElementById('dateField').value;
    const lockIdField = document.getElementById('lockIdField').value;
    const noteIdField = document.getElementById('noteIdField').value;
    const commentField = document.getElementById('commentField').value;
    const signatureField = document.getElementById('signatureField').value;

    const today = new Date();
    const currentDate = `${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${today.getFullYear()}`;

    const openCheckbox = document.getElementById('openCheckbox').checked;
    const closeCheckbox = document.getElementById('closeCheckbox').checked;
    const startedCheckbox = document.getElementById('startedCheckbox').checked;
    const stoppedCheckbox = document.getElementById('stoppedCheckbox').checked;

    let state = [];
    if (openCheckbox) {
      state.push('Åpen');
    } else if (closeCheckbox) {
      state.push('Stengt');
    }

    if (startedCheckbox) {
      state.push('Startet');
    } else if (stoppedCheckbox) {
      state.push('Stoppet');
    }

    if (state.length === 0) {
      valve.state = '';
    }

    const valve = {
      valveName,
      dateField: currentDate,
      lockIdField,
      noteIdField,
      commentField,
      state: state.length > 0 ? state.join(' ') : '',
      signatureField,
      reset: false,
    };

    valves.push(valve);
    saveToFirebase();
    renderValves();
    addValveModal.hide();
    valveForm.reset();
  });

  clearListButton.addEventListener('click', function () {
    clearListModal.show();
  });

  confirmClearButton.addEventListener('click', function () {
    valvesBackup = [...valves];
    valves = [];
    saveToFirebase();
    renderValves();

    undoButton.style.display = 'block';
    clearListModal.hide();
  });

  undoButton.addEventListener('click', function () {
    valves = [...valvesBackup];
    saveToFirebase();
    renderValves();

    undoButton.style.display = 'none';
  });

  function renderValves() {
    valveList.innerHTML = '';
    valves.forEach((valve, index) => {
      const valveItem = document.createElement('div');
      valveItem.className = 'valve-item col-12 col-md-4 mb-3';
      valveItem.innerHTML = `
        <div class="card-body">
          <h5 class="card-title">${valve.valveName}</h5>
          <p class="card-text"><strong>Date:</strong> ${valve.dateField}</p>
          <p class="card-text"><strong>Hengelås:</strong> ${valve.lockIdField} / <strong>Gul Lapp:</strong> ${
        valve.noteIdField
      }</p>
          <p class="card-text"><strong>Comment:</strong> ${valve.commentField}</p>
          <p class="card-text"><strong>State:</strong> ${valve.state}</p>
          <p class="card-text"><strong>Signature:</strong> ${valve.signatureField}</p>
          ${
            valve.reset
              ? `<p class="text-reset"><span class="text-success"><strong>Tilbakestilt</strong></span> av ${valve.resetSignature}</p>`
              : '<button class="btn btn-warning btn-sm" onclick="openResetModal(' + index + ')">Reset</button>'
          }
        </div>
      `;
      valveList.appendChild(valveItem);
    });
    updateValveChangesIndicator();
  }

  window.openResetModal = function (index) {
    resetIndex = index;
    resetModal.show();
  };

  document.getElementById('confirmResetButton').addEventListener('click', function () {
    const signature = document.getElementById('resetSignatureField').value;
    valves[resetIndex].reset = true;
    valves[resetIndex].resetSignature = signature.toUpperCase();
    saveToFirebase();
    renderValves();
    resetModal.hide();
    resetIndex = null;
    document.getElementById('resetSignatureField').value = '';
  });

  function saveToFirebase() {
    db.collection('valveData')
      .doc('currentStatus')
      .set({
        valves: valves,
      })
      .catch(error => {
        console.error('Error saving to Firebase: ', error);
      });
  }

  function loadFromFirebase() {
    db.collection('valveData')
      .doc('currentStatus')
      .get()
      .then(doc => {
        if (doc.exists) {
          valves = doc.data().valves || [];
          renderValves();
        }
      })
      .catch(error => {
        console.error('Error loading from Firebase: ', error);
      });
  }

  const valveOptions = [
    'Vakumpumper',
    'Tettningsvann mantel 1.Press og Gusk',
    'Oljepumpe Mølle',
    'Pressparti Pressløst',
    '3-Pressfilt slakket',
    'Vann Kantlinjaler',
    'Polymin Dosering',
    'Drenering spraystivelselinje ved masserør',
    'Viredrift',
    '3. Press sprits',
    'HT-Spritsvannpumpe',
    'Kondensatpumpe til kantskjærspritsene',
    '3- Tørk satt i auto',
    'Skumdemperpumpe viregrop',
    'Pressparti hevet og låst',
    'Hydralikkpumpe Pressparti',
    '3.pressfilt Slakket',
    'Tettningsvann 1.press og guskmantel',
    'Vakuum pumper',
    'Hovedventil dampsystem',
    'Hovedventil Gastrain',
    'Drenering Damp og Kondensatsystem',
    'Kondensatpumper',
    'HT-Spritsvannpumpe',
    'Spritsvann Kantlinjaler',
    'Spritsvann Innløpskasse',
    'Tettningsvann Mølle',
    'Drenering Mølle',
    'Bunnsluser PH-Kasse',
    'Sikkerhetsbryter Trykksil / Sil 1',
    'Sikkerhetsbryter Sil 2',
    'Bunnventil Polymintank',
    'Fortynningsvann Polymin',
    'Tilførselsluft vifte Calcoil',
    'Vifter IR',
    'Ventilasjonsvifter Sør-vegg',
    'Guskpress Hevet',
    'Dampkasse Hevet',
    'Overwire Hevet',
    'Puter Overwire',
  ];

  const valveNameInput = document.getElementById('valveName');
  const suggestionsContainer = document.getElementById('suggestions');

  valveNameInput.addEventListener('focus', function () {
    suggestionsContainer.innerHTML = ''; // Clear existing suggestions
    valveOptions.forEach(option => {
      const suggestionItem = document.createElement('div');
      suggestionItem.className = 'dropdown-item';
      suggestionItem.textContent = option;
      suggestionItem.addEventListener('click', function () {
        valveNameInput.value = option;
        suggestionsContainer.innerHTML = '';
        suggestionsContainer.style.display = 'none';
      });
      suggestionsContainer.appendChild(suggestionItem);
    });
    suggestionsContainer.style.display = 'block';
  });

  valveNameInput.addEventListener('input', function () {
    const input = valveNameInput.value.toLowerCase();
    suggestionsContainer.innerHTML = ''; // Clear existing suggestions

    if (input.length > 0) {
      const filteredOptions = valveOptions.filter(option => option.toLowerCase().includes(input));

      filteredOptions.forEach(option => {
        const suggestionItem = document.createElement('div');
        suggestionItem.className = 'dropdown-item';
        suggestionItem.textContent = option;
        suggestionItem.addEventListener('click', function () {
          valveNameInput.value = option;
          suggestionsContainer.innerHTML = '';
          suggestionsContainer.style.display = 'none';
        });
        suggestionsContainer.appendChild(suggestionItem);
      });

      if (filteredOptions.length > 0) {
        suggestionsContainer.style.display = 'block';
      } else {
        suggestionsContainer.style.display = 'none';
      }
    } else {
      suggestionsContainer.style.display = 'none';
    }
  });

  document.addEventListener('click', function (event) {
    if (!valveNameInput.contains(event.target) && !suggestionsContainer.contains(event.target)) {
      suggestionsContainer.style.display = 'none';
    }
  });

  function updateValveChangesIndicator() {
    const valveChangesCount = document.getElementById('valveChangesCount');
    const valveChangesIndicator = document.getElementById('valveChangesIndicator');

    if (valveChangesCount && valveChangesIndicator) {
      // Count only non-reset valves
      const activeValvesCount = valves.filter(valve => !valve.reset).length;
      valveChangesCount.textContent = activeValvesCount;

      if (activeValvesCount > 0) {
        valveChangesIndicator.classList.remove('green');
        valveChangesIndicator.classList.add('red');
      } else {
        valveChangesIndicator.classList.remove('red');
        valveChangesIndicator.classList.add('green');
      }
    }
  }

  function saveToFirebase() {
    db.collection('valveData')
      .doc('currentStatus')
      .set({
        valves: valves,
      })
      .catch(error => {
        console.error('Error saving to Firebase: ', error);
      });

    // Update valve changes count
    db.collection('valveData')
      .doc('valveChanges')
      .onSnapshot(doc => {
        if (doc.exists) {
          const count = doc.data().count;
          updateValveChangesIndicator(count);
        }
      });
  }

  function loadFromFirebase() {
    db.collection('valveData')
      .doc('currentStatus')
      .get()
      .then(doc => {
        if (doc.exists) {
          valves = doc.data().valves || [];
          renderValves();
        }
      })
      .catch(error => {
        console.error('Error loading from Firebase: ', error);
      });
  }

  loadFromFirebase();
});
