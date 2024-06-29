document.addEventListener('DOMContentLoaded', function () {
  console.log('Script loaded and DOM fully loaded');

  // Firebase configuration
  //   const firebaseConfig = {
  //     apiKey: 'AIzaSyAvaXLxAX580y8HfF_Vp4blHsm_b1notvU',
  //     authDomain: 'pm5dashboard.firebaseapp.com',
  //     projectId: 'pm5dashboard',
  //     storageBucket: 'pm5dashboard.appspot.com',
  //     messagingSenderId: '319947922125',
  //     appId: '1:319947922125:web:30cb9b06deff8b855d2784',
  //     measurementId: 'G-BSDFEN5ESR',
  //   };
  //   // Initialize Firebase
  //   firebase.initializeApp(firebaseConfig);

  //   const db = firebase.firestore(); // or firebase.database() for Realtime Database

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

  document.getElementById('format').addEventListener('input', function (e) {
    let value = e.target.value.replace(',', ''); // Remove any existing commas
    if (value.length > 2) {
      value = value.slice(0, 2) + ',' + value.slice(2); // Insert comma at the third position
    }
    e.target.value = value;
  });

  function fetchLogs() {
    db.collection('logs')
      .get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          appendLog(doc.data(), doc.id);
        });
      })
      .catch(error => {
        console.error('Error fetching logs: ', error);
      });
  }

  fetchLogs();

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

  sendLog.addEventListener('click', event => {
    event.preventDefault();
    const logData = {
      orderNumber: orderNumber.value,
      format: format.value,
      sum: sumField.value,
      timestamp: new Date().toLocaleString('en-US', {
        year: 'numeric',
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }),
    };

    db.collection('logs')
      .add(logData)
      .then(docRef => {
        console.log('Document written with ID: ', docRef.id);
        // appendLog(logData);
        resetForm();
      })
      .catch(error => {
        console.error('Error adding document: ', error);
      });
  });

  // resetLog.addEventListener('click', resetForm);

  function resetForm() {
    orderNumber.value = '';
    format.value = '';
    remsOut.value = 0;
    sumField.value = 0;
    remsOutValue = 0;
    sumValue = 0;
  }

  function appendLog(logData, docId) {
    if (addedLogs.has(docId)) return;

    addedLogs.add(docId);
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${logData.orderNumber}</td>
      <td>${logData.format}</td>
      <td>${logData.sum}</td>
      <td>${logData.timestamp}</td>
    `;
    logBody.insertBefore(row, logBody.firstChild); // Prepend new log
  }

  //   db.collection('logs').onSnapshot(snapshot => {
  //     snapshot.docChanges().forEach(change => {
  //       if (change.type === 'added') {
  //         appendLog(change.doc.data());
  //       }
  //     });
  //   });

  // db.collection('logs').onSnapshot(snapshot => {
  //   snapshot.docChanges().forEach(change => {
  //     if (change.type === 'added') {
  //       appendLog(change.doc.data(), change.doc.id);
  //     } else if (change.type === 'removed') {
  //       const rows = logBody.getElementsByTagName('tr');
  //       for (let i = 0; i < rows.length; i++) {
  //         const row = rows[i];
  //         if (row.cells[3].innerText === change.doc.data().timestamp) {
  //           logBody.removeChild(row);
  //           addedLogs.delete(change.doc.id); // Remove from the set
  //           break;
  //         }
  //       }
  //     }
  //   });
  // });
  db.collection('logs')
    .orderBy('timestamp', 'desc')
    .onSnapshot(snapshot => {
      snapshot.docChanges().forEach(change => {
        if (change.type === 'added') {
          appendLog(change.doc.data(), change.doc.id);
        } else if (change.type === 'removed') {
          const rows = logBody.getElementsByTagName('tr');
          for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            if (row.cells[3].innerText === change.doc.data().timestamp) {
              logBody.removeChild(row);
              addedLogs.delete(change.doc.id);
              break;
            }
          }
        }
      });
    });

  //   clearLog.addEventListener('click', () => {
  //     console.log('Clear logs button clicked');
  //     db.collection('logs')
  //       .get()
  //       .then(snapshot => {
  //         if (snapshot.empty) {
  //           console.log('No documents found');
  //           return;
  //         }
  //         const deletePromises = [];
  //         snapshot.forEach(doc => {
  //           console.log(`Attempting to delete document ID: ${doc.id}`);
  //           deletePromises.push(
  //             db
  //               .collection('logs')
  //               .doc(doc.id)
  //               .delete()
  //               .then(() => {
  //                 console.log(`Document ID ${doc.id} successfully deleted!`);
  //               })
  //               .catch(error => {
  //                 console.error(`Error removing document ID ${doc.id}: `, error);
  //               })
  //           );
  //         });
  //         return Promise.all(deletePromises); // Ensure all deletions are completed
  //       })
  //       .then(() => {
  //         console.log('All documents deleted, clearing UI');
  //         logBody.innerHTML = '';
  //         addedLogs.clear();
  //       })
  //       .catch(error => {
  //         console.error('Error clearing logs: ', error);
  //       });
  //   });
});
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

const addedLogs = new Set();

function clearLogs() {
  console.log('Clear logs button clicked');
  db.collection('logs')
    .get()
    .then(snapshot => {
      if (snapshot.empty) {
        console.log('No documents found');
        return;
      }
      const deletePromises = [];
      snapshot.forEach(doc => {
        console.log(`Attempting to delete document ID: ${doc.id}`);
        deletePromises.push(
          db
            .collection('logs')
            .doc(doc.id)
            .delete()
            .then(() => {
              console.log(`Document ID ${doc.id} successfully deleted!`);
            })
            .catch(error => {
              console.error(`Error removing document ID ${doc.id}: `, error);
            })
        );
      });
      return Promise.all(deletePromises);
    })
    .then(() => {
      console.log('All documents deleted, clearing UI');
      logBody.innerHTML = '';
      addedLogs.clear();
    })
    .catch(error => {
      console.error('Error clearing logs: ', error);
    });
}

window.clearLogs = clearLogs;
