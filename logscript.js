import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  writeBatch,
  query, // Import query
  orderBy, // Import orderBy
  doc,
} from 'https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js';
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from 'https://www.gstatic.com/firebasejs/9.21.0/firebase-storage.js';

// Your web app's Firebase configuration
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
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

document.addEventListener('DOMContentLoaded', function () {
  const logForm = document.getElementById('logForm');
  const logList = document.getElementById('logList');
  const addPhotoButton = document.getElementById('addPhotoButton');
  const photoInput = document.getElementById('photoInput');
  const showImageButton = document.getElementById('showImageButton');
  const clearListButton = document.getElementById('clearListButton');
  const logImage = document.getElementById('logImage');
  let currentImageFile = null;

  if (!logForm || !logList || !addPhotoButton || !photoInput || !showImageButton) {
    console.error('Some required DOM elements are missing.');
    return;
  }

  // Load logs from Firestore on page load
  loadLogs();

  // Attach click event to open file input dialog
  addPhotoButton.addEventListener('click', () => {
    photoInput.click();
  });

  // Handle image selection
  photoInput.addEventListener('change', function () {
    const file = this.files[0];
    if (file) {
      currentImageFile = file;
      console.log('Image selected:', file.name);
    }
  });

  // clearListButton.addEventListener('click', async function () {
  //   try {
  //     // Clear the displayed list of logs
  //     logList.innerHTML = '';
  //     console.log('Log list cleared from the page.');

  //     // Fetch all logs from Firestore and delete them
  //     const querySnapshot = await getDocs(collection(db, 'logs'));
  //     const batch = writeBatch(db); // Use writeBatch to create a new batch

  //     querySnapshot.forEach(doc => {
  //       batch.delete(doc.ref);
  //     });

  //     await batch.commit();
  //     console.log('All logs deleted from Firestore.');
  //   } catch (error) {
  //     console.error('Error deleting logs:', error);
  //   }
  // });

  // Handle form submission
  logForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const title = document.getElementById('logTitle').value;
    const description = document.getElementById('logDescription').value;
    const importance = document.getElementById('logImportance').value; // Make sure this is reading correctly
    const signature = document.getElementById('logSignature').value;

    if (currentImageFile) {
      compressImage(currentImageFile, 0.7, 800, compressedFile => {
        uploadImageAndSaveLog(compressedFile, title, description, importance, signature);
      });
    } else {
      saveLogToFirestore(title, description, importance, signature, null);
    }

    $('#addLogModal').modal('hide');
    logForm.reset();
    currentImageFile = null;
  });

  function compressImage(file, quality, maxWidth, callback) {
    const reader = new FileReader();
    reader.onload = function (event) {
      const img = new Image();
      img.onload = function () {
        const canvas = document.createElement('canvas');
        const scaleSize = maxWidth / img.width;
        canvas.width = maxWidth;
        canvas.height = img.height * scaleSize;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          blob => {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            console.log('Image compressed');
            callback(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }

  function uploadImageAndSaveLog(file, title, description, importance, signature) {
    const storageRef = ref(storage, `logs/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      snapshot => {
        // Handle progress (optional)
      },
      error => {
        console.error('Upload failed:', error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then(downloadURL => {
          saveLogToFirestore(title, description, importance, signature, downloadURL);
        });
      }
    );
  }

  function saveLogToFirestore(title, description, importance, signature, imageUrl) {
    addDoc(collection(db, 'logs'), {
      title,
      description,
      importance,
      signature,
      imageUrl,
      timestamp: serverTimestamp(),
    })
      .then(docRef => {
        displayLog(title, description, importance, signature, docRef.id, imageUrl, new Date());

        // Trigger SweetAlert notification
        Swal.fire({
          title: 'Log Added',
          text: 'Your log has been successfully added.',
          icon: 'success',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
      })
      .catch(error => {
        console.error('Error adding log:', error);
      });
  }

  function displayLog(title, description, importance, signature, id, imageUrl, timestamp) {
    const listItem = document.createElement('li');

    const formattedDate = timestamp.toLocaleDateString();

    listItem.setAttribute('data-id', id);
    listItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
    listItem.innerHTML = `
        <div class="d-flex align-items-center">
          <div class="importance-indicator" style="background-color: ${importance}; width: 10px; height: 10px; border-radius: 50%;"></div>
          <span class="ml-2" style="font-size: 0.85rem; margin-left: 2rem;">${formattedDate}</span>
        </div>
        <span class="ml-auto">${title}</span>
    `;
    listItem.addEventListener('click', () => openViewLogModal(title, description, importance, signature, imageUrl, timestamp));
    logList.prepend(listItem); // Add new logs to the top of the list
  }

  function openViewLogModal(title, description, importance, signature, imageUrl, timestamp) {
    const viewLogTitle = document.getElementById('viewLogTitle');
    const viewLogDescription = document.getElementById('viewLogDescription');
    const viewLogSignature = document.getElementById('viewLogSignature');
    const viewLogDate = document.getElementById('viewLogDate');

    viewLogTitle.textContent = title;
    viewLogDescription.textContent = description;
    viewLogSignature.textContent = `Signature: ${signature}`;
    viewLogDate.textContent = `Date: ${timestamp.toLocaleDateString()}`;

    showImageButton.onclick = function () {
      if (imageUrl) {
        logImage.src = imageUrl;
        $('#viewImageModal').modal('show');
      } else {
        alert('No image available');
      }
    };

    $('#viewLogModal').modal('show');
  }

  async function loadLogs() {
    try {
      const logsQuery = query(
        collection(db, 'logs'),
        orderBy('timestamp', 'desc') // Order logs by timestamp in descending order
      );

      const querySnapshot = await getDocs(logsQuery);

      logList.innerHTML = ''; // Clear the list before appending logs

      querySnapshot.forEach(doc => {
        const data = doc.data();
        const timestamp = data.timestamp;
        let date;

        // Check if the timestamp is a Firestore Timestamp object
        if (timestamp && typeof timestamp.toDate === 'function') {
          date = timestamp.toDate();
        } else if (timestamp instanceof Date) {
          date = timestamp; // If it's already a JS Date object
        } else {
          date = new Date(); // Fallback in case it's neither
        }

        displayLog(data.title, data.description, data.importance, data.signature, doc.id, data.imageUrl, date);
      });
    } catch (error) {
      console.error('Error loading logs:', error);
    }
  }

  const adminLogList = document.getElementById('adminLogList');
  const deleteSelectedLogsButton = document.getElementById('deleteSelectedLogs');
  const clearAllLogsButton = document.getElementById('clearAllLogs');
  const hiddenKeyword = 'flæsktambur'; // Secret keyword to trigger admin panel

  document.getElementById('logTitle').addEventListener('input', function (event) {
    if (event.target.value.toLowerCase() === hiddenKeyword) {
      openAdminModal();
    }
  });

  // Load logs for the admin modal
  function openAdminModal() {
    $('#adminLogModal').modal('show');
    $('#addLogModal').modal('hide');
    loadAdminLogs();
  }

  // Load logs into the admin panel
  async function loadAdminLogs() {
    try {
      const logsQuery = query(collection(db, 'logs'), orderBy('timestamp', 'desc'));

      const querySnapshot = await getDocs(logsQuery);
      adminLogList.innerHTML = '';

      querySnapshot.forEach(doc => {
        const data = doc.data();
        const listItem = document.createElement('li');
        listItem.classList.add('list-group-item', 'd-flex', 'align-items-center');
        listItem.innerHTML = `
          <input type="checkbox" class="log-checkbox mr-2" data-id="${doc.id}">
          <span>${data.title}</span>
        `;
        adminLogList.appendChild(listItem);
      });
    } catch (error) {
      console.error('Error loading logs:', error);
    }
  }

  // Delete selected logs
  deleteSelectedLogsButton.addEventListener('click', async function () {
    const checkboxes = document.querySelectorAll('.log-checkbox:checked');

    if (checkboxes.length === 0) {
      alert('No logs selected for deletion.');
      return;
    }

    const batch = writeBatch(db);

    checkboxes.forEach(checkbox => {
      const logId = checkbox.getAttribute('data-id');
      const logRef = doc(db, 'logs', logId);
      batch.delete(logRef);
    });

    try {
      await batch.commit();
      console.log('Selected logs deleted successfully.');
      loadLogs(); // Refresh the log list after deletion
      loadAdminLogs(); // Refresh the admin panel list
      $('#adminLogModal').modal('hide');
    } catch (error) {
      console.error('Error deleting selected logs:', error);
      alert('Failed to delete selected logs. Please try again.');
    }
  });
  // Clear all logs
  clearAllLogsButton.addEventListener('click', async function () {
    if (!confirm('Are you sure you want to delete all logs?')) return;

    const logsQuery = await getDocs(collection(db, 'logs'));
    const batch = writeBatch(db);

    logsQuery.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    loadLogs(); // Refresh the log list
    $('#adminLogModal').modal('hide');
  });
});
