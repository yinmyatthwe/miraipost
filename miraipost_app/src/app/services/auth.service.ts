import { Injectable, inject } from '@angular/core';
import { 
  Auth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
  authState,
  updateProfile,
  updateEmail,
  updatePassword,
  deleteUser,
  sendPasswordResetEmail
} from '@angular/fire/auth';
import { Firestore, doc, setDoc, deleteDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth, { optional: false });
  private firestore = inject(Firestore, { optional: false });

  constructor() {}

  // ========== CREATE ==========
  
  // Register new user (CREATE in both Auth and Firestore)
  async register(name: string, email: string, password: string) {
    try {
      // Create Firebase Auth account
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );

      const uid = userCredential.user.uid;

      // Update display name in Auth
      await updateProfile(userCredential.user, { displayName: name });

      // Save user information in Firestore
      await setDoc(doc(this.firestore, 'users', uid), {
        name,
        email,
        createdAt: Date.now()
      });

      return userCredential;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // ========== READ ==========

  // Login user
  async login(email: string, password: string) {
    try {
      return await signInWithEmailAndPassword(this.auth, email, password);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }

  // Observable for auth state changes (using Angular Fire's authState)
  getAuthState(): Observable<User | null> {
    return authState(this.auth);
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    return this.auth.currentUser !== null;
  }

  // Get user ID
  getUserId(): string | null {
    return this.auth.currentUser?.uid || null;
  }

  // ========== UPDATE ==========

  // Update user display name
  async updateDisplayName(name: string) {
    try {
      const user = this.auth.currentUser;
      if (!user) throw new Error('No user logged in');

      await updateProfile(user, { displayName: name });
      
      // Also update in Firestore
      await setDoc(doc(this.firestore, 'users', user.uid), {
        name,
        updatedAt: Date.now()
      }, { merge: true });

      return true;
    } catch (error) {
      console.error('Error updating display name:', error);
      throw error;
    }
  }

  // Update user email
  async updateUserEmail(newEmail: string) {
    try {
      const user = this.auth.currentUser;
      if (!user) throw new Error('No user logged in');

      await updateEmail(user, newEmail);
      
      // Also update in Firestore
      await setDoc(doc(this.firestore, 'users', user.uid), {
        email: newEmail,
        updatedAt: Date.now()
      }, { merge: true });

      return true;
    } catch (error) {
      console.error('Error updating email:', error);
      throw error;
    }
  }

  // Update user password
  async updateUserPassword(newPassword: string) {
    try {
      const user = this.auth.currentUser;
      if (!user) throw new Error('No user logged in');

      await updatePassword(user, newPassword);
      return true;
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  }

  // Send password reset email
  async resetPassword(email: string) {
    try {
      await sendPasswordResetEmail(this.auth, email);
      return true;
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  }

  // ========== DELETE ==========

  // Delete user account (both Auth and Firestore)
  async deleteAccount() {
    try {
      const user = this.auth.currentUser;
      if (!user) throw new Error('No user logged in');

      const uid = user.uid;

      // Delete from Firestore first
      await deleteDoc(doc(this.firestore, 'users', uid));

      // Delete from Firebase Auth
      await deleteUser(user);

      return true;
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  }

  // Logout user
  async logout() {
    try {
      return await signOut(this.auth);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }
}