import { db, auth } from './src/lib/firebase';
import { getDoc, doc } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';

async function check() {
  await signInAnonymously(auth);
  const snap = await getDoc(doc(db, 'gifts', 'gift-4'));
  if (snap.exists()) {
    console.log("Goal King exists in DB:", snap.data());
  } else {
    console.log("Goal King NOT found in DB!");
  }
  process.exit(0);
}
check().catch(console.error);
