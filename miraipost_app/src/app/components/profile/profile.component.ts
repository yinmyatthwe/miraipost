import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserService, UserData } from '../../services/user.service';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private firestore = inject(Firestore);
  private cdr = inject(ChangeDetectorRef);

  user: UserData | null = null;

  async ngOnInit() {
    await this.loadUserProfile();
  }

  async loadUserProfile() {
    try {
      const currentUser = this.authService.getCurrentUser();
      
      if (currentUser) {
        const userDoc = doc(this.firestore, 'users', currentUser.uid);
        const userSnapshot = await getDoc(userDoc);
        
        if (userSnapshot.exists()) {
          this.user = {
            id: currentUser.uid,
            ...userSnapshot.data()
          } as UserData;
          this.cdr.markForCheck();
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      alert('プロフィールの読み込みに失敗しました');
      this.cdr.markForCheck();
    }
  }
}