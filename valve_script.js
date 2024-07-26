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

  const shortStopValveList = document.getElementById('shortStopValveList');
  const longStopValveList = document.getElementById('longStopValveList');
  const clearButton = document.getElementById('clearButton');
  const clearModal = new bootstrap.Modal(document.getElementById('clearModal'));
  const confirmClearButton = document.getElementById('confirmClearButton');
  const customValveInput = document.getElementById('customValveInput');
  const valveSectionSelect = document.getElementById('valveSectionSelect');
  const saveCustomValveButton = document.getElementById('saveCustomValveButton');

  const valveData = {
    shortStop: [
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
    ],
    longStop: [
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
    ],
  };

  let selectedValves = { shortStop: new Set(), longStop: new Set(), custom: new Set() };
  let comments = { shortStop: {}, longStop: {}, custom: {} };
  let lockIds = { shortStop: {}, longStop: {}, custom: {} };

  function renderValves(valveListElement, valves, category) {
    valveListElement.innerHTML = '';
    valves.forEach((valve, index) => {
      const valveId = `${category}-${index}`;
      const valveItem = document.createElement('div');
      valveItem.className = 'valve-item';
      valveItem.textContent = valve;

      const commentField = document.createElement('textarea');
      commentField.className = 'form-control mt-1 valve-comment';
      commentField.placeholder = 'Kommentar';
      commentField.value = comments[category][valveId] || '';

      const lockIdField = document.createElement('input');
      lockIdField.className = 'form-control mt-1 valve-lock-id';
      lockIdField.type = 'number';
      lockIdField.placeholder = 'Lås ID';
      lockIdField.value = lockIds[category][valveId] || '';

      if (selectedValves[category].has(valveId)) {
        valveItem.classList.add('selected');
      }

      valveItem.addEventListener('click', function () {
        if (selectedValves[category].has(valveId)) {
          selectedValves[category].delete(valveId);
          valveItem.classList.remove('selected');
        } else {
          selectedValves[category].add(valveId);
          valveItem.classList.add('selected');
        }
        saveSelectedValves();
      });

      commentField.addEventListener('input', function () {
        comments[category][valveId] = commentField.value;
        saveSelectedValves();
      });

      lockIdField.addEventListener('input', function () {
        lockIds[category][valveId] = lockIdField.value;
        saveSelectedValves();
      });

      const containerDiv = document.createElement('div');
      containerDiv.className = 'valve-container col-12 col-md-6'; // Ensure it takes full width on mobile and half width on larger screens
      containerDiv.appendChild(valveItem);

      const commentLockContainer = document.createElement('div');
      commentLockContainer.className = 'comment-lock-container';
      commentLockContainer.appendChild(commentField);
      commentLockContainer.appendChild(lockIdField);

      containerDiv.appendChild(commentLockContainer);
      valveListElement.appendChild(containerDiv);
    });
  }

  function saveSelectedValves() {
    db.collection('valveStatus')
      .doc('currentStatus')
      .set({
        shortStop: Array.from(selectedValves.shortStop),
        longStop: Array.from(selectedValves.longStop),
        custom: Array.from(selectedValves.custom),
        comments: comments,
        lockIds: lockIds,
      })
      .catch(error => {
        console.error('Error saving selected valves: ', error);
      });
  }

  function loadSelectedValves() {
    db.collection('valveStatus')
      .doc('currentStatus')
      .get()
      .then(doc => {
        if (doc.exists) {
          const data = doc.data();
          selectedValves.shortStop = new Set(data.shortStop || []);
          selectedValves.longStop = new Set(data.longStop || []);
          selectedValves.custom = new Set(data.custom || []);
          comments = data.comments || { shortStop: {}, longStop: {}, custom: {} };
          lockIds = data.lockIds || { shortStop: {}, longStop: {}, custom: {} };
          renderValves(shortStopValveList, valveData.shortStop, 'shortStop');
          renderValves(longStopValveList, valveData.longStop, 'longStop');
          renderValvesFromCustom(data.custom || []);
        }
      })
      .catch(error => {
        console.error('Error loading selected valves: ', error);
      });
  }

  function renderValvesFromCustom(customValves) {
    customValves.forEach(valveId => {
      const [category, ...valveArray] = valveId.split('-');
      const valveName = valveArray.join('-').replace('custom-', ''); // Remove 'custom-' from the valve name
      addCustomValve(valveName, category, valveId);
    });
  }

  function addCustomValve(valveName, category, valveId = null) {
    const valveListElement = category === 'shortStop' ? shortStopValveList : longStopValveList;
    const valveItem = document.createElement('div');
    valveItem.className = 'col-12 col-md-6 valve-item'; // Add col-12 for mobile and col-md-6 for larger screens
    valveItem.textContent = valveName;

    valveId = valveId || `${category}-custom-${valveName}`;
    selectedValves.custom.add(valveId);

    const commentField = document.createElement('textarea');
    commentField.className = 'form-control mt-1 valve-comment';
    commentField.placeholder = 'Kommentar';
    commentField.value = comments[category][valveId] || '';

    const lockIdField = document.createElement('input');
    lockIdField.className = 'form-control mt-1 valve-lock-id';
    lockIdField.type = 'number';
    lockIdField.placeholder = 'Lås ID';
    lockIdField.value = lockIds[category][valveId] || '';

    valveItem.addEventListener('click', function () {
      if (selectedValves.custom.has(valveId)) {
        selectedValves.custom.delete(valveId);
        valveItem.classList.remove('selected');
      } else {
        selectedValves.custom.add(valveId);
        valveItem.classList.add('selected');
      }
      saveSelectedValves();
    });

    commentField.addEventListener('input', function () {
      comments[category][valveId] = commentField.value;
      saveSelectedValves();
    });

    lockIdField.addEventListener('input', function () {
      lockIds[category][valveId] = lockIdField.value;
      saveSelectedValves();
    });

    const containerDiv = document.createElement('div');
    containerDiv.className = 'valve-container';
    containerDiv.appendChild(valveItem);

    const commentLockContainer = document.createElement('div');
    commentLockContainer.className = 'comment-lock-container';
    commentLockContainer.appendChild(commentField);
    commentLockContainer.appendChild(lockIdField);

    containerDiv.appendChild(commentLockContainer);
    valveListElement.appendChild(containerDiv);
    saveSelectedValves();
  }

  if (saveCustomValveButton) {
    saveCustomValveButton.addEventListener('click', function () {
      const customValve = customValveInput.value.trim();
      const category = valveSectionSelect.value;
      if (customValve) {
        addCustomValve(customValve, category);
        customValveInput.value = '';
        $('#customValveModal').modal('hide');
      }
    });
  }

  if (clearButton) {
    clearButton.addEventListener('click', function () {
      clearModal.show();
    });
  }

  if (confirmClearButton) {
    confirmClearButton.addEventListener('click', function () {
      selectedValves = { shortStop: new Set(), longStop: new Set(), custom: new Set() };
      comments = { shortStop: {}, longStop: {}, custom: {} };
      lockIds = { shortStop: {}, longStop: {}, custom: {} };
      saveSelectedValves();
      renderValves(shortStopValveList, valveData.shortStop, 'shortStop');
      renderValves(longStopValveList, valveData.longStop, 'longStop');
      clearModal.hide();
    });
  }

  loadSelectedValves();
});

// CSS for comment box and lock ID input
const style = document.createElement('style');
style.innerHTML = `
 .valve-container {
    display: flex;
    flex-direction: column;
    margin-bottom: 10px;
  }
  .valve-item {
    padding: 10px;
    background-color: #c2c2c2;
    border: 1px solid #ced4da;
    cursor: pointer;
    text-align: center;
  }
  .valve-item.selected {
    background-color: #28a745;
    color: white;
  }
  .comment-lock-container {
    display: flex;
    flex-direction: row;
    width: 100%;
  }
  .valve-comment {
    flex: 1;
    height: 50px;
    margin-top: 5px;
    padding: 5px;
    border: 1px solid #ced4da;
    resize: none;
  }
  .valve-lock-id {
    width: 5rem;
    height: 50px;
    margin-top: 5px;
    margin-left: 5px;
    padding: 5px;
    border: 1px solid #ced4da;
  }
  @media (max-width: 768px) {
    .valve-container {
      flex: 0 0 100%;
    }
    .comment-lock-container {
      flex-direction: column;
    }
    .valve-comment,
    .valve-lock-id {
      width: 100%;
      margin-left: 0;
    }
  }
  `;
document.head.appendChild(style);
