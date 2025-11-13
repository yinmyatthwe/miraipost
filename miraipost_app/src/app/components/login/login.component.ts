import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

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

  constructor(private router: Router) {}

  onLogin(): void {
    console.log('Login attempt:', { email: this.email, password: this.password });
    
    // TODO: Add your authentication logic here
    // Example:
    // this.authService.login(this.email, this.password).subscribe({
    //   next: (response) => {
    //     this.router.navigate(['/']);
    //   },
    //   error: (error) => {
    //     console.error('Login failed:', error);
    //   }
    // });

    // For now, just navigate to home (mock)
    this.router.navigate(['/']);
  }
}