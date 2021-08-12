import { firebase } from '@firebase/app';
import '@firebase/firestore'


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBfPcMzaY75upoOPAnsaGuKi-YlU0z2WZU",
  authDomain: "svelte-todo-c24cc.firebaseapp.com",
  projectId: "svelte-todo-c24cc",
  storageBucket: "svelte-todo-c24cc.appspot.com",
  messagingSenderId: "142732551713",
  appId: "1:142732551713:web:3fda2ebccaaf4c913e2560"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig)

export const db = firebase.firestore();