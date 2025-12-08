import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';

export const authGuard = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  if (auth.currentUser) {
    return true;
  } else {
    // Navigate to login without alert (SSR safe)
    router.navigate(['/login']);
    return false;
  }
};