import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
  imports: [CommonModule, FormsModule],
  templateUrl: './write.component.html',
  styleUrls: ['./write.component.css']
})
export class WriteComponent {
  private router = inject(Router);
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

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.letterData.image = file;
      this.selectedFileName = file.name;
      this.cdr.markForCheck();
    }
  }
  
  async onSaveDraft(): Promise<void> {
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser) {
      alert('ログインが必要です');
      this.router.navigate(['/login']);
      return;
    }

    if (!this.letterData.title || !this.letterData.content) {
      alert('タイトルと内容を入力してください');
      return;
    }

    try {
      const emailData: EmailData = {
        userId: currentUser.uid,
        recipient: this.letterData.recipient,
        recipientEmail: this.letterData.email || currentUser.email || '',
        title: this.letterData.title,
        message: this.letterData.content,
        paperType: this.letterData.paperType,
        sendAt: this.letterData.deliveryDate 
          ? new Date(this.letterData.deliveryDate).getTime() 
          : Date.now() + 86400000, // Default: 24 hours from now
        createdAt: Date.now(),
        status: 'draft'
      };

      // TODO: Handle image upload if needed
      if (this.selectedFileName) {
        // emailData.imageUrl = await this.uploadImage(this.letterData.image);
      }

      await this.emailService.addEmail(emailData);
      alert('下書きを保存しました！');
      this.cdr.markForCheck();
    } catch (error) {
      console.error('Error saving draft:', error);
      alert('保存に失敗しました');
      this.cdr.markForCheck();
    }
  }

  async onSubmit(): Promise<void> {
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser) {
      alert('ログインが必要です');
      this.router.navigate(['/login']);
      return;
    }

    // Validation
    if (!this.letterData.email) {
      alert('宛先メールアドレスを入力してください');
      return;
    }

    if (!this.letterData.deliveryDate) {
      alert('お届け日を選択してください');
      return;
    }

    if (!this.letterData.title || !this.letterData.content) {
      alert('タイトルと内容を入力してください');
      return;
    }

    // Check if delivery date is in the future
    const deliveryTimestamp = new Date(this.letterData.deliveryDate).getTime();
    if (deliveryTimestamp <= Date.now()) {
      alert('お届け日は未来の日付を選択してください');
      return;
    }

    try {
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

      // TODO: Handle image upload if needed
      if (this.selectedFileName) {
        // emailData.imageUrl = await this.uploadImage(this.letterData.image);
      }

      await this.emailService.addEmail(emailData);
      alert('手紙を送信しました！指定された日時に配信されます。');
      this.cdr.markForCheck();
      this.router.navigate(['/dashboard']);
    } catch (error) {
      console.error('Error sending letter:', error);
      alert('送信に失敗しました');
      this.cdr.markForCheck();
    }
  }

  // TODO: Implement image upload to Firebase Storage
  // private async uploadImage(file: File): Promise<string> {
  //   // Upload to Firebase Storage and return URL
  //   return '';
  // }
}