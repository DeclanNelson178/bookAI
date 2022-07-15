import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore/lite';
// Follow this pattern to import other Firebase services
// import { } from 'firebase/<service>';

// TODO: Replace the following with your app's Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyCULnAGE9JNsE9vUQ9Nc0HWFj0TKF8nG9M",
    authDomain: "bookai-9f811.firebaseapp.com",
    projectId: "bookai-9f811",
    storageBucket: "bookai-9f811.appspot.com",
    messagingSenderId: "242731802334",
    appId: "1:242731802334:web:c6c3ab6d4197b143432c4f",
    measurementId: "G-DSR6RK8KCS"
}
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default db;