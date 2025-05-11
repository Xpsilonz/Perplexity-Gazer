import { db, ref, set, get, update, auth, signInAnonymously } from './firebase-config.js';

    let gazeTextData = [];
    let gazeCoordinates = [];
    let userId = null;
    let lastUpdateTime = null;

    // Authenticate anonymously
    signInAnonymously(auth)
      .then((userCredential) => {
        userId = userCredential.user.uid;
        console.log(`Authenticated as anonymous user: ${userId}`);
        loadCalibrationData();
        scheduleHourlyUpdate();
      })
      .catch((error) => {
        console.error('Authentication failed:', error);
      });

    // Save gazed text
    function saveGazeText(text) {
      if (typeof text === 'string' && text.trim()) {
        const trimmedText = text.trim().substring(0, 100);
        gazeTextData.push({
          text: trimmedText,
          timestamp: Date.now()
        });
        console.log(`Saved text: ${trimmedText}`);
        if (gazeTextData.length > 1000) {
          gazeTextData.shift();
        }
        saveToFirebase();
      }
    }

    // Save gaze coordinates
    function saveGazeCoordinates(x, y, timestamp) {
      gazeCoordinates.push({ x, y, timestamp });
      if (gazeCoordinates.length > 100) {
        gazeCoordinates = gazeCoordinates.slice(-100);
      }
      saveToFirebase();
    }

    // Save to Firebase
    function saveToFirebase() {
      if (!userId) return;
      const dataRef = ref(db, `users/${userId}`);
      set(dataRef, {
        gazeTextData,
        gazeCoordinates,
        lastUpdateTime: Date.now()
      }).catch((error) => console.error('Firebase save failed:', error));
    }

    // Load calibration data
    function loadCalibrationData() {
      if (!userId) return;
      const dataRef = ref(db, `users/${userId}`);
      get(dataRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            gazeTextData = data.gazeTextData || [];
            gazeCoordinates = data.gazeCoordinates || [];
            lastUpdateTime = data.lastUpdateTime || Date.now();
            console.log('Loaded calibration data:', data);
            if (gazeCoordinates.length > 0) {
              window.dispatchEvent(new CustomEvent('loadCalibrationData', { detail: gazeCoordinates }));
              console.log('Dispatched calibration data');
            }
          }
        })
        .catch((error) => console.error('Firebase load failed:', error));
    }

    // Clear data
    function clearGazeText() {
      gazeTextData = [];
      gazeCoordinates = [];
      if (userId) {
        const dataRef = ref(db, `users/${userId}`);
        set(dataRef, {
          gazeTextData: [],
          gazeCoordinates: [],
          lastUpdateTime: Date.now()
        }).catch((error) => console.error('Firebase clear failed:', error));
      }
      console.log('Gaze text data cleared');
    }

    // Hourly data replacement
    function scheduleHourlyUpdate() {
      setInterval(() => {
        const now = Date.now();
        const oneHour = 60 * 60 * 1000;
        if (!lastUpdateTime || now - lastUpdateTime >= oneHour) {
          console.log('Performing hourly data update');
          if (gazeCoordinates.length > 0) {
            saveToFirebase();
          } else if (userId) {
            const dataRef = ref(db, `users/${userId}`);
            get(dataRef)
              .then((snapshot) => {
                if (snapshot.exists()) {
                  const data = snapshot.val();
                  set(dataRef, {
                    gazeTextData: data.gazeTextData || [],
                    gazeCoordinates: data.gazeCoordinates || [],
                    lastUpdateTime: now
                  }).catch((error) => console.error('Firebase copy failed:', error));
                }
              })
              .catch((error) => console.error('Firebase fetch failed:', error));
          }
          lastUpdateTime = now;
        }
      }, 60 * 1000); // Check every minute
    }

    // Expose saveGazeText
    window.saveGazeText = saveGazeText;

    // Handle messages
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === 'saveText') {
        saveGazeText(message.text);
        sendResponse({ status: 'textSaved' });
      } else if (message.action === 'getText') {
        sendResponse({ data: gazeTextData });
      } else if (message.action === 'clearText' || message.action === 'stopTracking') {
        clearGazeText();
        sendResponse({ status: 'textCleared' });
      }
    });

    // Clear data on tab close
    window.addEventListener('unload', () => {
      clearGazeText();
});