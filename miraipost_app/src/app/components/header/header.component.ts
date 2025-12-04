import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '@angular/fire/auth';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  currentUser: User | null = null;
  userName: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Subscribe to auth state changes
    this.authService.getAuthState().subscribe((user) => {
      this.currentUser = user;
      if (user) {
        // Get user name from displayName or email
        this.userName = user.displayName || user.email?.split('@')[0] || 'ユーザー';
      }
    });
  }

  async onLogout() {
    if (confirm('ログアウトしますか？')) {
      try {
        await this.authService.logout();
        alert('ログアウトしました');
        this.router.navigate(['/']);
      } catch (error) {
        console.error('Logout failed:', error);
        alert('ログアウトに失敗しました');
      }
    }
  }
}