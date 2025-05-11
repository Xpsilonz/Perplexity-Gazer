import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
     import { getDatabase, ref, set, get, update } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js';
     import { getAuth, signInAnonymously } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

     const firebaseConfig = {
        apiKey: "AIzaSyCBdBKKCSVnxiHY2nTkwrN4_NCryFf0lVo",
        authDomain: "perplexity-gazer.firebaseapp.com",
        databaseURL: "https://perplexity-gazer-default-rtdb.firebaseio.com",
        projectId: "perplexity-gazer",
        storageBucket: "perplexity-gazer.firebasestorage.app",
        messagingSenderId: "194796717410",
        appId: "1:194796717410:web:38ceeabeae676c812cd83b",
        measurementId: "G-MFHWS2TX0D"
        };

     const app = initializeApp(firebaseConfig);
     const db = getDatabase(app);
     const auth = getAuth(app);

     export { db, ref, set, get, update, auth, signInAnonymously };