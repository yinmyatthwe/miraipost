import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private firestore = inject(Firestore);
  private cdr = inject(ChangeDetectorRef);

  currentUser: User | null = null;
  userName: string = '';

  ngOnInit() {
    // Subscribe to auth state changes
    this.authService.getAuthState().subscribe(async (user) => {
      this.currentUser = user;
      if (user) {
        // Try to get the actual name from Firestore
        try {
          const userDoc = doc(this.firestore, 'users', user.uid);
          const userSnapshot = await getDoc(userDoc);
          
          if (userSnapshot.exists()) {
            const userData = userSnapshot.data();
            this.userName = userData['name'] || user.email?.split('@')[0] || 'ユーザー';
          } else {
            this.userName = user.displayName || user.email?.split('@')[0] || 'ユーザー';
          }
        } catch (error) {
          console.error('Error fetching user name:', error);
          this.userName = user.displayName || user.email?.split('@')[0] || 'ユーザー';
        }
      } else {
        this.userName = '';
      }
      this.cdr.markForCheck();
    });
  }

  async onLogout() {
    if (confirm('ログアウトしますか？')) {
      try {
        await this.authService.logout();
        alert('ログアウトしました');
        this.cdr.markForCheck();
        this.router.navigate(['/']);
      } catch (error) {
        console.error('Logout failed:', error);
        alert('ログアウトに失敗しました');
        this.cdr.markForCheck();
      }
    }
  }
}