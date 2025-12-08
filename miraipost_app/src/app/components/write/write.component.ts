import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { EmailService, EmailData } from '../../services/email.service';

interface LetterData {
  recipient: string;
  email: string;
  deliveryDate: string;
  title: string;
  paperType: string;
  content: string;
  image?: File;
}

@Component({
  selector: 'app-write-letter',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './write.component.html',
  styleUrls: ['./write.component.css']
})
export class WriteComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private emailService = inject(EmailService);
  private cdr = inject(ChangeDetectorRef);

  letterData: LetterData = {
    recipient: 'future',
    email: '',
    deliveryDate: '',
    title: '',
    paperType: 'plain',
    content: ''
  };

  selectedFileName: string = '';
  
  // Edit mode
  isEditMode: boolean = false;
  editingEmailId: string | null = null;
  
  // UI states
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  ngOnInit() {
    // Subscribe to query params to detect edit mode
    this.route.queryParams.subscribe(async params => {
      const emailId = params['id'];
      if (emailId) {
        this.isEditMode = true;
        this.editingEmailId = emailId;
        await this.loadEmailForEdit(emailId);
      }
    });
  }

  async loadEmailForEdit(emailId: string) {
    this.isLoading = true;
    this.errorMessage = '';
    
    try {
      const email = await this.emailService.getEmailById(emailId);
      
      if (!email) {
        this.errorMessage = '手紙が見つかりませんでした';
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 2000);
        return;
      }

      // Check if current user owns this email
      const currentUser = this.authService.getCurrentUser();
      if (email.userId !== currentUser?.uid) {
        this.errorMessage = 'この手紙を編集する権限がありません';
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 2000);
        return;
      }

      // Convert timestamp to date string (YYYY-MM-DD)
      const deliveryDate = new Date(email.sendAt);
      const dateString = deliveryDate.toISOString().split('T')[0];

      // Load data into form
      this.letterData = {
        recipient: email.recipient,
        email: email.recipientEmail,
        deliveryDate: dateString,
        title: email.title,
        paperType: email.paperType,
        content: email.message
      };

      console.log('Loaded email data:', this.letterData);
      console.log('Form should now show:', {
        title: this.letterData.title,
        content: this.letterData.content,
        recipient: this.letterData.recipient
      });

      // Force change detection
      this.cdr.detectChanges();

    } catch (error) {
      console.error('Error loading email:', error);
      this.errorMessage = '手紙の読み込みに失敗しました';
    } finally {
      this.isLoading = false;
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.letterData.image = file;
      this.selectedFileName = file.name;
    }
  }
  
  async onSaveDraft(): Promise<void> {
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser) {
      this.errorMessage = 'ログインが必要です';
      this.router.navigate(['/login']);
      return;
    }

    if (!this.letterData.title || !this.letterData.content) {
      this.errorMessage = 'タイトルと内容を入力してください';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      if (this.isEditMode && this.editingEmailId) {
        // Update existing email
        await this.emailService.updateEmail(this.editingEmailId, {
          recipient: this.letterData.recipient,
          recipientEmail: this.letterData.email || currentUser.email || '',
          title: this.letterData.title,
          message: this.letterData.content,
          paperType: this.letterData.paperType,
          sendAt: this.letterData.deliveryDate 
            ? new Date(this.letterData.deliveryDate).getTime() 
            : Date.now() + 86400000,
          status: 'draft'
        });
        this.successMessage = '下書きを更新しました！';
      } else {
        // Create new email
        const emailData: EmailData = {
          userId: currentUser.uid,
          recipient: this.letterData.recipient,
          recipientEmail: this.letterData.email || currentUser.email || '',
          title: this.letterData.title,
          message: this.letterData.content,
          paperType: this.letterData.paperType,
          sendAt: this.letterData.deliveryDate 
            ? new Date(this.letterData.deliveryDate).getTime() 
            : Date.now() + 86400000,
          createdAt: Date.now(),
          status: 'draft'
        };

        await this.emailService.addEmail(emailData);
        this.successMessage = '下書きを保存しました！';
      }

      setTimeout(() => {
        this.router.navigate(['/dashboard']);
      }, 1000);
    } catch (error) {
      console.error('Error saving draft:', error);
      this.errorMessage = '保存に失敗しました';
    } finally {
      this.isLoading = false;
    }
  }

  async onSubmit(): Promise<void> {
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser) {
      this.errorMessage = 'ログインが必要です';
      this.router.navigate(['/login']);
      return;
    }

    // Validation
    if (!this.letterData.email) {
      this.errorMessage = '宛先メールアドレスを入力してください';
      return;
    }

    if (!this.letterData.deliveryDate) {
      this.errorMessage = 'お届け日を選択してください';
      return;
    }

    if (!this.letterData.title || !this.letterData.content) {
      this.errorMessage = 'タイトルと内容を入力してください';
      return;
    }

    // Check if delivery date is in the future
    const deliveryTimestamp = new Date(this.letterData.deliveryDate).getTime();
    if (deliveryTimestamp <= Date.now()) {
      this.errorMessage = 'お届け日は未来の日付を選択してください';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      if (this.isEditMode && this.editingEmailId) {
        // Update existing email
        await this.emailService.updateEmail(this.editingEmailId, {
          recipient: this.letterData.recipient,
          recipientEmail: this.letterData.email,
          title: this.letterData.title,
          message: this.letterData.content,
          paperType: this.letterData.paperType,
          sendAt: deliveryTimestamp,
          status: 'pending'
        });
        this.successMessage = '手紙を更新しました！';
      } else {
        // Create new email
        const emailData: EmailData = {
          userId: currentUser.uid,
          recipient: this.letterData.recipient,
          recipientEmail: this.letterData.email,
          title: this.letterData.title,
          message: this.letterData.content,
          paperType: this.letterData.paperType,
          sendAt: deliveryTimestamp,
          createdAt: Date.now(),
          status: 'pending'
        };

        await this.emailService.addEmail(emailData);
        this.successMessage = '手紙を送信しました！';
      }

      setTimeout(() => {
        this.router.navigate(['/dashboard']);
      }, 1000);
    } catch (error) {
      console.error('Error sending letter:', error);
      this.errorMessage = '送信に失敗しました';
    } finally {
      this.isLoading = false;
    }
  }

  async onDelete(): Promise<void> {
    if (!this.isEditMode || !this.editingEmailId) {
      return;
    }

    const confirmation = confirm('この手紙を削除しますか？');
    if (!confirmation) return;

    this.isLoading = true;
    this.errorMessage = '';

    try {
      await this.emailService.deleteEmail(this.editingEmailId);
      this.successMessage = '手紙を削除しました';
      
      setTimeout(() => {
        this.router.navigate(['/dashboard']);
      }, 500);
    } catch (error) {
      console.error('Error deleting letter:', error);
      this.errorMessage = '削除に失敗しました';
    } finally {
      this.isLoading = false;
    }
  }
}