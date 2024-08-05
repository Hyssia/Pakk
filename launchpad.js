document.addEventListener('DOMContentLoaded', function () {
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

  const toggleDarkModeButton = document.getElementById('toggleDarkMode');

  toggleDarkModeButton.addEventListener('click', function () {
    // Toggle the dark-mode class on the body element
    document.body.classList.toggle('dark-mode');
  });

  function updateValveChangesIndicator(count) {
    const valveChangesCount = document.getElementById('valveChangesCount');
    const valveChangesIndicator = document.getElementById('valveChangesIndicator');
    if (valveChangesCount && valveChangesIndicator) {
      valveChangesCount.textContent = count;
      if (count > 0) {
        valveChangesIndicator.classList.remove('green');
        valveChangesIndicator.classList.add('red');
      } else {
        valveChangesIndicator.classList.remove('red');
        valveChangesIndicator.classList.add('green');
      }
    }
  }

  db.collection('valveData')
    .doc('currentStatus')
    .onSnapshot(doc => {
      if (doc.exists) {
        const valves = doc.data().valves || [];
        const activeValvesCount = valves.filter(valve => !valve.reset).length;
        updateValveChangesIndicator(activeValvesCount);
      }
    });

  function updateLogChangesIndicator(count) {
    const logChangesCount = document.getElementById('logChangesCount');
    const logChangesIndicator = document.getElementById('logChangesIndicator');
    if (logChangesCount && logChangesIndicator) {
      logChangesCount.textContent = count;
      if (count > 0) {
        logChangesIndicator.classList.remove('green');
        logChangesIndicator.classList.add('red');
      } else {
        logChangesIndicator.classList.remove('red');
        logChangesIndicator.classList.add('green');
      }
    }
  }

  // Assuming 'logs' is the collection where logs are stored
  db.collection('logs')
    .get()
    .then(snapshot => {
      const newLogsCount = snapshot.size; // Total number of logs
      updateLogChangesIndicator(newLogsCount);
    })
    .catch(error => {
      console.error('Error fetching logs:', error);
    });
});
