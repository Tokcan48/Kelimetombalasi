import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, getDocs, query, orderBy, deleteDoc, doc, updateDoc, onSnapshot, serverTimestamp, getDoc, setDoc, increment, where } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyAFPP3wTxwN1J2pQKj63dYATJaXOjsLY40",
  authDomain: "kelimetombalasi.firebaseapp.com",
  projectId: "kelimetombalasi",
  storageBucket: "kelimetombalasi.firebasestorage.app",
  messagingSenderId: "480349863656",
  appId: "1:480349863656:web:3cbf2f8ee814900f4a535d"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)

export { collection, addDoc, getDocs, query, orderBy, deleteDoc, doc, updateDoc, onSnapshot, serverTimestamp, getDoc, setDoc, increment, where }

