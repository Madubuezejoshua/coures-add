import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyDSFqXyPA3Pp6fIouX6vdN94LqmiglqDxc',
  authDomain: 'jonal-project.firebaseapp.com',
  projectId: 'jonal-project',
  storageBucket: 'jonal-project.firebasestorage.app',
  messagingSenderId: '247752568666',
  appId: '1:247752568666:web:6388769e6ee580ed600d63',
  measurementId: 'G-2TDN5C6QQ5',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
