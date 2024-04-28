import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCeivfL3ALzPHljPwqd6Kh2a2wgobDM4fM",
  authDomain: "rxroster-9.firebaseapp.com",
  projectId: "rxroster-9",
  storageBucket: "rxroster-9.appspot.com",
  messagingSenderId: "794176961814",
  appId: "1:794176961814:web:a01b9509b1e9a2538ea437",
  measurementId: "G-K72D315QNK"
};

const app = initializeApp(firebaseConfig);
const fireauth = getAuth(app);
export { fireauth };
