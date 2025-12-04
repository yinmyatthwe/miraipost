import { Injectable, inject } from '@angular/core';
import { 
  Auth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
  onAuthStateChanged
} from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private auth = inject(Auth);
  private firestore = inject(Firestore);

  constructor() {}
  // Register new user
  async register(name: string, email: string, password: string) {
    // Create Firebase Auth account
    const userCredential = await createUserWithEmailAndPassword(
      this.auth,
      email,
      password
    );

    const uid = userCredential.user.uid;

    // Save user information in Firestore under UID
    await setDoc(doc(this.firestore, 'users', uid), {
      name,
      email,
      createdAt: Date.now()
    });

    return userCredential;
  }
  // Login existing user
  async login(email: string, password: string) {
    return await signInWithEmailAndPassword(this.auth, email, password);
  }

  // Logout user
  async logout() {
    return await signOut(this.auth);
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }

  // Observable for auth state changes
  getAuthState(): Observable<User | null> {
    return new Observable((observer) => {
      return onAuthStateChanged(this.auth, (user) => {
        observer.next(user);
      });
    });
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    return this.auth.currentUser !== null;
  }
}
