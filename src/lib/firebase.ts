import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  projectId: "gen-lang-client-0163667078",
  appId: "1:638271136518:web:b935de69f34a181b997487",
  apiKey: "AIzaSyB6jUo0n3twSTlo4UOS8EUP5LT5FgGVIP4",
  authDomain: "gen-lang-client-0163667078.firebaseapp.com",
  storageBucket: "gen-lang-client-0163667078.firebasestorage.app",
  messagingSenderId: "638271136518",
  measurementId: ""
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, "ai-studio-digitalgifts-7868b8b9-26f9-4f56-8319-48477379a22a");
export const auth = getAuth(app);
