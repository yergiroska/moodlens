import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import { MoodEntry } from '../types/mood';

export async function saveEntry(entry: Omit<MoodEntry, 'id'>): Promise<string> {
    const entriesRef = collection(db, 'users', entry.uid, 'entries');
    const docRef = await addDoc(entriesRef, {
        ...entry,
        createdAt: new Date(),
    });
    return docRef.id;
}

export async function getEntries(uid: string): Promise<MoodEntry[]> {
    const entriesRef = collection(db, 'users', uid, 'entries');
    const q = query(entriesRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
    })) as MoodEntry[];
}