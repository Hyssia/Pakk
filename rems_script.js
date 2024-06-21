document.addEventListener('DOMContentLoaded', function () {
  const addedLogs = new Set();

  // Firebase configuration
  const firebaseConfig = {
    apiKey: 'AIzaSyAvaXLxAX580y8HfF_Vp4blHsm_b1notvU',
    authDomain: 'pm5dashboard.firebaseapp.com',
    projectId: 'pm5dashboard',
    storageBucket: 'pm5dashboard.appspot.com',
    messagingSenderId: '319947922125',
    appId: '1:319947922125:web:30cb9b06deff8b855d2784',
    measurementId: 'G-BSDFEN5ESR',
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  const db = firebase.firestore(); // or firebase.database() for Realtime Database

  const orderNumber = document.getElementById('orderNumber');
  const format = document.getElementById('format');
  const remsOut = document.getElementById('remsOut');
  const increment = document.getElementById('increment');
  const decrement = document.getElementById('decrement');
  const nextSet = document.getElementById('nextSet');
  const sendLog = document.getElementById('sendLog');
  const resetLog = document.getElementById('resetLog');
  const logBody = document.getElementById('logBody');
  const sumField = document.getElementById('sum');
  const clearLog = document.getElementById('clearLog');

  let remsOutValue = 0;
  let sumValue = 0;

  increment.addEventListener('click', () => {
    remsOutValue++;
    remsOut.value = remsOutValue;
  });

  decrement.addEventListener('click', () => {
    if (remsOutValue > 0) {
      remsOutValue--;
      remsOut.value = remsOutValue;
    }
  });

  nextSet.addEventListener('click', () => {
    sumValue += remsOutValue;
    sumField.value = sumValue;
    remsOutValue = 0;
    remsOut.value = remsOutValue;
  });

  sendLog.addEventListener('click', () => {
    event.preventDefault();
    const logData = {
      orderNumber: orderNumber.value,
      format: format.value,
      sum: sumField.value,
      timestamp: new Date().toISOString(),
    };

    db.collection('logs')
      .add(logData)
      .then(docRef => {
        console.log('Document written with ID: ', docRef.id);
        appendLog(logData);
        resetForm();
      })
      .catch(error => {
        console.error('Error adding document: ', error);
      });
  });

  resetLog.addEventListener('click', resetForm);

  function resetForm() {
    orderNumber.value = '';
    format.value = '';
    remsOut.value = 0;
    sumField.value = 0;
    remsOutValue = 0;
    sumValue = 0;
  }

  function appendLog(logData, docId) {
    const row = document.createElement('tr');
    addedlogs.add(docId);
    row.innerHTML = `
        <td>${logData.orderNumber}</td>
        <td>${logData.format}</td>
        <td>${logData.sum}</td>
        <td>${logData.timestamp}</td>
      `;
    logBody.appendChild(row);
  }

  //   db.collection('logs').onSnapshot(snapshot => {
  //     snapshot.docChanges().forEach(change => {
  //       if (change.type === 'added') {
  //         appendLog(change.doc.data());
  //       }
  //     });
  //   });

  db.collection('logs').onSnapshot(snapshot => {
    snapshot.docChanges().forEach(change => {
      if (change.type === 'added') {
        appendLog(change.doc.data(), change.doc.id);
      } else if (change.type === 'removed') {
        const rows = logBody.getElementsByTagName('tr');
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          if (row.cells[3].innerText === change.doc.data().timestamp) {
            logBody.removeChild(row);
            addedLogs.delete(change.doc.id); // Remove from the set
            break;
          }
        }
      }
    });
  });

  function fetchLogs() {
    db.collection('logs').get().then(snapshot => {
      snapshot.forEach(doc => {
        appendog(doc.data(), doc.id);
      });
    }).catch(error => {
      console.error('Error fetching logs: ',error);
    });
  }

  fetchLogs();

  clearLog.addEventListener('click', () => {
    db.collection('logs')
      .get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          db.collection('logs')
            .doc(doc.id)
            .delete()
            .then(() => {
              console.log('Document successfully deleted!');
            })
            .catch(error => {
              console.error('Error removing document: ', error);
            });
        });
      });
    logBody.innerHTML = '';
  });
});
