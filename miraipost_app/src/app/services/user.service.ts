import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  collectionData,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface UserData {
  id?: string;
  email: string;
  name: string;
  createdAt: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  // Firestore injected first (prevents initialization errors)
  private firestore = inject(Firestore);

  // Users collection
  private userCollection = collection(this.firestore, 'users');

  constructor() {}

  // CREATE (auto ID)
  addUser(data: UserData) {
    return addDoc(this.userCollection, data);
  }

  // CREATE / UPDATE with custom ID (e.g., Firebase Auth UID)
  setUser(uid: string, data: UserData) {
    const userDoc = doc(this.firestore, `users/${uid}`);
    return setDoc(userDoc, data, { merge: true });
  }

  // READ: all users
  getUsers(): Observable<UserData[]> {
    return collectionData(this.userCollection, { idField: 'id' }) as Observable<UserData[]>;
  }

  // READ: user by email
  getUserByEmail(email: string): Observable<UserData[]> {
    const q = query(this.userCollection, where('email', '==', email));
    return collectionData(q, { idField: 'id' }) as Observable<UserData[]>;
  }

  // READ: user by ID
  getUserById(uid: string): Observable<UserData[]> {
    const q = query(this.userCollection, where('__name__', '==', uid));
    return collectionData(q, { idField: 'id' }) as Observable<UserData[]>;
  }

  // UPDATE user
  updateUser(uid: string, data: Partial<UserData>) {
    const userDoc = doc(this.firestore, `users/${uid}`);
    return updateDoc(userDoc, data);
  }

  // DELETE user
  deleteUser(uid: string) {
    const userDoc = doc(this.firestore, `users/${uid}`);
    return deleteDoc(userDoc);
  }
}
