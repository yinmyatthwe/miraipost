import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  collectionData,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface EmailData {
  id?: string;
  userId: string;
  recipient: string;        // future, family, friend
  recipientEmail: string;   // actual email address
  title: string;
  message: string;
  paperType: string;        // plain, flower, sky
  imageUrl?: string;        // if image is uploaded
  sendAt: number;           // timestamp (future delivery time)
  createdAt: number;        // timestamp (when created)
  status?: 'pending' | 'sent' | 'draft';
}

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private firestore = inject(Firestore, { optional: false });

  constructor() {}
  
  // CREATE - Add new email/letter
  async addEmail(data: EmailData) {
    if (!data.status) {
      data.status = 'pending';
    }
    const emailsCollection = collection(this.firestore, 'emails');
    return await addDoc(emailsCollection, data);
  }

  // READ - Get single email by ID
  async getEmailById(emailId: string): Promise<EmailData | null> {
    try {
      const docRef = doc(this.firestore, 'emails', emailId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as EmailData;
      }
      return null;
    } catch (error) {
      console.error('Error getting email:', error);
      return null;
    }
  }

  // READ - Get all emails (admin only)
  getEmails(): Observable<EmailData[]> {
    const emailsCollection = collection(this.firestore, 'emails');
    const q = query(emailsCollection, orderBy('createdAt', 'desc'));
    return collectionData(q, { idField: 'id' }) as Observable<EmailData[]>;
  }

  // READ - Get all emails by user
  getEmailsByUser(userId: string): Observable<EmailData[]> {
    const emailsCollection = collection(this.firestore, 'emails');
    const q = query(
      emailsCollection, 
      where('userId', '==', userId)
    );
    return collectionData(q, { idField: 'id' }) as Observable<EmailData[]>;
  }

  // READ - Get pending emails (not yet sent)
  getPendingEmails(userId: string): Observable<EmailData[]> {
    const emailsCollection = collection(this.firestore, 'emails');
    const q = query(
      emailsCollection, 
      where('userId', '==', userId),
      where('status', '==', 'pending'),
      orderBy('sendAt', 'asc')
    );
    return collectionData(q, { idField: 'id' }) as Observable<EmailData[]>;
  }

  // READ - Get draft emails
  getDraftEmails(userId: string): Observable<EmailData[]> {
    const emailsCollection = collection(this.firestore, 'emails');
    const q = query(
      emailsCollection, 
      where('userId', '==', userId),
      where('status', '==', 'draft'),
      orderBy('createdAt', 'desc')
    );
    return collectionData(q, { idField: 'id' }) as Observable<EmailData[]>;
  }

  // READ - Get sent emails
  getSentEmails(userId: string): Observable<EmailData[]> {
    const emailsCollection = collection(this.firestore, 'emails');
    const q = query(
      emailsCollection, 
      where('userId', '==', userId),
      where('status', '==', 'sent'),
      orderBy('sendAt', 'desc')
    );
    return collectionData(q, { idField: 'id' }) as Observable<EmailData[]>;
  }

  // UPDATE - Update email/letter
  async updateEmail(emailId: string, data: Partial<EmailData>) {
    try {
      const docRef = doc(this.firestore, 'emails', emailId);
      await updateDoc(docRef, data);
      return true;
    } catch (error) {
      console.error('Error updating email:', error);
      return false;
    }
  }

  // UPDATE - Mark email as sent
  async markAsSent(emailId: string) {
    return await this.updateEmail(emailId, { status: 'sent' });
  }

  // UPDATE - Mark email as draft
  async markAsDraft(emailId: string) {
    return await this.updateEmail(emailId, { status: 'draft' });
  }

  // DELETE - Delete email/letter
  async deleteEmail(emailId: string) {
    try {
      const docRef = doc(this.firestore, 'emails', emailId);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Error deleting email:', error);
      return false;
    }
  }

  // DELETE - Delete all drafts for a user
  async deleteAllDrafts(userId: string) {
    try {
      const drafts = await this.getDraftEmailsList(userId);
      const deletePromises = drafts.map(draft => this.deleteEmail(draft.id!));
      await Promise.all(deletePromises);
      return true;
    } catch (error) {
      console.error('Error deleting drafts:', error);
      return false;
    }
  }

  // Helper - Get drafts as Promise (for deletion)
  private async getDraftEmailsList(userId: string): Promise<EmailData[]> {
    return new Promise((resolve) => {
      this.getDraftEmails(userId).subscribe(drafts => {
        resolve(drafts);
      });
    });
  }
}