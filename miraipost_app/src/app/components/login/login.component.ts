import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  email: string = '';
  password: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;

  ngOnInit() {
    // Check if redirected from auth guard
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state?.['redirected']) {
      this.errorMessage = 'ログインが必要です';
      this.cdr.markForCheck();
    }
  }

  async onLogin() {
    // Clear previous messages
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.email || !this.password) {
      this.errorMessage = 'メールアドレスとパスワードを入力してください';
      this.cdr.markForCheck();
      return;
    }

    this.isLoading = true;
    this.cdr.markForCheck();

    try {
      await this.authService.login(this.email, this.password);
      this.successMessage = 'ログインに成功しました！';
      this.cdr.markForCheck();
      
      // Wait a moment to show success message
      setTimeout(() => {
        this.router.navigate(['/']);
      }, 500);
    } catch (error: any) {
      console.error('Login failed:', error);
      
      // Handle specific error codes
      if (error.code === 'auth/invalid-credential' || 
          error.code === 'auth/wrong-password' || 
          error.code === 'auth/user-not-found') {
        this.errorMessage = 'メールアドレスまたはパスワードが正しくありません';
      } else if (error.code === 'auth/invalid-email') {
        this.errorMessage = 'メールアドレスの形式が正しくありません';
      } else if (error.code === 'auth/too-many-requests') {
        this.errorMessage = 'ログイン試行回数が多すぎます。しばらく待ってから再試行してください';
      } else {
        this.errorMessage = 'ログインに失敗しました';
      }
      this.cdr.markForCheck();
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }
}