// Import and configure Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  writeBatch,
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

  clearListButton.addEventListener('click', async function () {
    try {
      // Clear the displayed list of logs
      logList.innerHTML = '';
      console.log('Log list cleared from the page.');

      // Fetch all logs from Firestore and delete them
      const querySnapshot = await getDocs(collection(db, 'logs'));
      const batch = writeBatch(db); // Use writeBatch to create a new batch

      querySnapshot.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      console.log('All logs deleted from Firestore.');
    } catch (error) {
      console.error('Error deleting logs:', error);
    }
  });

  // Handle form submission
  logForm.addEventListener('submit', function (event) {
    event.preventDefault();
    console.log('Form submitted');

    const title = document.getElementById('logTitle').value;
    const description = document.getElementById('logDescription').value;
    const importance = document.getElementById('logImportance').value;

    console.log(`Title: ${title}, Description: ${description}, Importance: ${importance}`);

    if (currentImageFile) {
      compressImage(currentImageFile, 0.7, 800, compressedFile => {
        uploadImageAndSaveLog(compressedFile, title, description, importance);
      });
    } else {
      saveLogToFirestore(title, description, importance, null);
    }

    // Close the modal after submission
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

  function uploadImageAndSaveLog(file, title, description, importance) {
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
        // Get the download URL and save the log in Firestore
        getDownloadURL(uploadTask.snapshot.ref).then(downloadURL => {
          console.log('Image uploaded:', downloadURL);
          saveLogToFirestore(title, description, importance, downloadURL);
        });
      }
    );
  }

  function saveLogToFirestore(title, description, importance, imageUrl) {
    addDoc(collection(db, 'logs'), {
      title,
      description,
      importance,
      imageUrl,
      timestamp: serverTimestamp(),
    })
      .then(docRef => {
        console.log('Log added with ID:', docRef.id);
        // Pass description to the displayLog function
        displayLog(title, description, importance, docRef.id, imageUrl);
      })
      .catch(error => {
        console.error('Error adding log:', error);
      });
  }

  function displayLog(title, description, importance, id, imageUrl) {
    const listItem = document.createElement('li');
    listItem.setAttribute('data-id', id);
    listItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
    listItem.innerHTML = `
        <div class="importance-indicator" style="background-color: ${importance}; width: 10px; height: 10px; border-radius: 50%;"></div>
        <span class="ml-2">${title}</span>
    `;
    // Use an arrow function to pass description correctly
    listItem.addEventListener('click', () => openViewLogModal(title, description, imageUrl));
    logList.appendChild(listItem);
  }

  function openViewLogModal(title, description, imageUrl) {
    const viewLogTitle = document.getElementById('viewLogTitle');
    const viewLogDescription = document.getElementById('viewLogDescription');

    viewLogTitle.textContent = title;
    viewLogDescription.textContent = description;

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
      const querySnapshot = await getDocs(collection(db, 'logs'));
      querySnapshot.forEach(doc => {
        const data = doc.data();
        displayLog(data.title, data.description, data.importance, doc.id, data.imageUrl);
      });
    } catch (error) {
      console.error('Error loading logs:', error);
    }
  }
});
