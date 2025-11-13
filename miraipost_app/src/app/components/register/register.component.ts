import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  username: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';

  constructor(private router: Router) {}

  onRegister(): void {
    // Validate passwords match
    if (this.password !== this.confirmPassword) {
      alert('パスワードが一致しません');
      return;
    }

    // Validate password length
    if (this.password.length < 8) {
      alert('パスワードは8文字以上である必要があります');
      return;
    }

    console.log('Register attempt:', {
      username: this.username,
      email: this.email,
      password: this.password
    });
    
    // TODO: Add your registration logic here
    // Example:
    // this.authService.register(this.username, this.email, this.password).subscribe({
    //   next: (response) => {
    //     alert('登録が完了しました！');
    //     this.router.navigate(['/login']);
    //   },
    //   error: (error) => {
    //     console.error('Registration failed:', error);
    //     alert('登録に失敗しました');
    //   }
    // });

    // For now, show success message and navigate to login (mock)
    alert('登録が完了しました！');
    this.router.navigate(['/login']);
  }
}