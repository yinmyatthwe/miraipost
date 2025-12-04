import { Component } from '@angular/core';
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
export class LoginComponent {
  email: string = '';
  password: string = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  async onLogin() {
    if (!this.email || !this.password) {
      alert('メールアドレスとパスワードを入力してください');
      return;
    }

    try {
      await this.authService.login(this.email, this.password);
      alert('ログインに成功しました！');
      this.router.navigate(['/']);
    } catch (error: any) {
      console.error('Login failed:', error);
      
      // Handle specific error codes
      let errorMessage = 'ログインに失敗しました';
      
      if (error.code === 'auth/invalid-credential' || 
          error.code === 'auth/wrong-password' || 
          error.code === 'auth/user-not-found') {
        errorMessage = 'メールアドレスまたはパスワードが正しくありません';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'メールアドレスの形式が正しくありません';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'ログイン試行回数が多すぎます。しばらく待ってから再試行してください';
      }
      
      alert(errorMessage);
    }
  }
}