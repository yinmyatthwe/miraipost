import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  collectionData,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface EmailData {
  id?: string;
  userId: string;
  title: string;
  message: string;
  sendAt: number;     // timestamp (future)
  createdAt: number;  // timestamp
}

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private firestore = inject(Firestore);
  // Collection reference
  private emailCollection = collection(this.firestore, 'emails');
  constructor() {}
  
  // CREATE
  addEmail(data: EmailData) {
    return addDoc(this.emailCollection, data);
  }

  // READ: All emails
  getEmails(): Observable<EmailData[]> {
    return collectionData(this.emailCollection, { idField: 'id' }) as Observable<EmailData[]>;
  }

  // READ: Filter by userId (FIXED)
  getEmailsByUser(userId: string): Observable<EmailData[]> {
    const q = query(this.emailCollection, where('userId', '==', userId));
    return collectionData(q, { idField: 'id' }) as Observable<EmailData[]>;
  }

  // UPDATE
  updateEmail(emailId: string, data: Partial<EmailData>) {
    const docRef = doc(this.firestore, `emails/${emailId}`);
    return updateDoc(docRef, data);
  }

  // DELETE
  deleteEmail(emailId: string) {
    const docRef = doc(this.firestore, `emails/${emailId}`);
    return deleteDoc(docRef);
  }
}
