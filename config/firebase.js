import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "DIN_API_KEY",
    authDomain: "chat-aflevering-dfd8c.firebaseapp.com",
    projectId: "chat-aflevering-dfd8c",
    storageBucket: "chat-aflevering-dfd8c.firebasestorage.app",
    messagingSenderId: "141984091635",
    appId: "1:141984091635:web:0606cc9172a5b634ec1686"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Opret og eksporter forbindelsen til Firestore
export const db = getFirestore(app);