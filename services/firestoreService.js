
import {
    collection,
    getDocs,
    addDoc,
    doc,
    getDoc,
    updateDoc,
    deleteDoc
} from 'firebase/firestore';

import { db } from '../config/firebase.js';

// Hent alle dokumenter
export async function hentAlleDokumenter(collectionNavn) {
    const snapshot = await getDocs(collection(db, collectionNavn));

    return snapshot.docs.map(dokument => ({
        ...dokument.data(),
        id: dokument.id
    }));
}

// Hent ét dokument
export async function hentDokument(collectionNavn, id) {
    const dokumentRef = doc(db, collectionNavn, String(id));
    const snapshot = await getDoc(dokumentRef);

    if (!snapshot.exists()) return null;

    return {
        ...snapshot.data(),
        id: snapshot.id
    };
}

// Opret dokument
export async function opretDokument(collectionNavn, data) {
    const dokumentRef = await addDoc(collection(db, collectionNavn), data);
    return dokumentRef.id;
}

// Opdater dokument
export async function opdaterDokument(collectionNavn, id, data) {
    const dokumentRef = doc(db, collectionNavn, String(id));
    const snapshot = await getDoc(dokumentRef);

    if (!snapshot.exists()) return false;

    await updateDoc(dokumentRef, data);
    return true;
}

// Slet dokument
export async function sletDokument(collectionNavn, id) {
    const dokumentRef = doc(db, collectionNavn, String(id));
    const snapshot = await getDoc(dokumentRef);

    if (!snapshot.exists()) return false;

    await deleteDoc(dokumentRef);
    return true;
}
