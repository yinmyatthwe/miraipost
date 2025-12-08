import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UserService, UserData } from '../../services/user.service';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css']
})
export class EditProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private firestore = inject(Firestore);
  private router = inject(Router);
  
  user: UserData | null = null;
  
  // Edit form data
  editName: string = '';
  editEmail: string = '';
  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  
  // UI states
  editingName: boolean = false;
  editingEmail: boolean = false;
  editingPassword: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  ngOnInit() {
    // Get current user immediately
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    // Set initial values from auth immediately
    this.editName = currentUser.displayName || currentUser.email?.split('@')[0] || '';
    this.editEmail = currentUser.email || '';

    // Then load full profile data from Firestore
    this.loadUserProfile();
  }

  async loadUserProfile() {
    try {
      const currentUser = this.authService.getCurrentUser();
      
      if (!currentUser) {
        this.router.navigate(['/login']);
        return;
      }

      const userDoc = doc(this.firestore, 'users', currentUser.uid);
      const userSnapshot = await getDoc(userDoc);
      
      if (userSnapshot.exists()) {
        this.user = {
          id: currentUser.uid,
          ...userSnapshot.data()
        } as UserData;
        
        // Update with Firestore data
        this.editName = this.user.name;
        this.editEmail = this.user.email;
      } else {
        // Use auth data if Firestore data doesn't exist
        this.user = {
          id: currentUser.uid,
          name: this.editName,
          email: this.editEmail,
          createdAt: Date.now()
        };
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      this.errorMessage = 'プロフィールの読み込みに失敗しました';
    }
  }

  // Update Name
  async updateName() {
    if (!this.editName.trim()) {
      this.errorMessage = '名前を入力してください';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      await this.authService.updateDisplayName(this.editName);
      this.successMessage = '名前を更新しました';
      this.editingName = false;
      if (this.user) this.user.name = this.editName;
    } catch (error) {
      console.error('Error updating name:', error);
      this.errorMessage = '名前の更新に失敗しました';
    } finally {
      this.isLoading = false;
    }
  }

  // Update Email
  async updateEmail() {
    if (!this.editEmail.trim()) {
      this.errorMessage = 'メールアドレスを入力してください';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      await this.authService.updateUserEmail(this.editEmail);
      this.successMessage = 'メールアドレスを更新しました';
      this.editingEmail = false;
      if (this.user) this.user.email = this.editEmail;
    } catch (error: any) {
      console.error('Error updating email:', error);
      if (error.code === 'auth/requires-recent-login') {
        this.errorMessage = 'セキュリティのため、再ログインが必要です';
      } else {
        this.errorMessage = 'メールアドレスの更新に失敗しました';
      }
    } finally {
      this.isLoading = false;
    }
  }

  // Update Password
  async updatePassword() {
    if (!this.newPassword || this.newPassword.length < 8) {
      this.errorMessage = 'パスワードは8文字以上である必要があります';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'パスワードが一致しません';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      await this.authService.updateUserPassword(this.newPassword);
      this.successMessage = 'パスワードを更新しました';
      this.editingPassword = false;
      this.currentPassword = '';
      this.newPassword = '';
      this.confirmPassword = '';
    } catch (error: any) {
      console.error('Error updating password:', error);
      if (error.code === 'auth/requires-recent-login') {
        this.errorMessage = 'セキュリティのため、再ログインが必要です';
      } else {
        this.errorMessage = 'パスワードの更新に失敗しました';
      }
    } finally {
      this.isLoading = false;
    }
  }

  // Delete Account
  async deleteAccount() {
    const confirmation = confirm(
      'アカウントを削除すると、すべてのデータが失われます。本当に削除しますか？'
    );

    if (!confirmation) return;

    const doubleConfirmation = confirm(
      '本当によろしいですか？この操作は取り消せません。'
    );

    if (!doubleConfirmation) return;

    this.isLoading = true;
    this.errorMessage = '';

    try {
      await this.authService.deleteAccount();
      alert('アカウントを削除しました');
      this.router.navigate(['/']);
    } catch (error: any) {
      console.error('Error deleting account:', error);
      if (error.code === 'auth/requires-recent-login') {
        this.errorMessage = 'セキュリティのため、再ログインしてからもう一度お試しください';
      } else {
        this.errorMessage = 'アカウントの削除に失敗しました';
      }
    } finally {
      this.isLoading = false;
    }
  }

  cancelEdit() {
    this.editingName = false;
    this.editingEmail = false;
    this.editingPassword = false;
    this.errorMessage = '';
    this.successMessage = '';
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    if (this.user) {
      this.editName = this.user.name;
      this.editEmail = this.user.email;
    }
  }
}