import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  private router = inject(Router);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  username: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';

  async onRegister() {
    // Password match check
    if (this.password !== this.confirmPassword) {
      alert('パスワードが一致しません');
      return;
    }

    if (this.password.length < 8) {
      alert('パスワードは8文字以上である必要があります');
      return;
    }

    try {
      const result = await this.authService.register(
        this.username,
        this.email,
        this.password
      );

      alert('登録が完了しました！');
      this.cdr.markForCheck();
      this.router.navigate(['/login']);
      
    } catch (error: any) {
      console.error('Registration failed:', error);
      alert('登録に失敗しました: ' + error.message);
      this.cdr.markForCheck();
    }
  }
}
