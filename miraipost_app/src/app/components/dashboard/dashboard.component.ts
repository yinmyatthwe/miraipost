import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { EmailService, EmailData } from '../../services/email.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private emailService = inject(EmailService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  
  letters: EmailData[] = [];
  filteredLetters: EmailData[] = [];
  activeFilter: string = 'all';
  
  // Stats
  totalLetters: number = 0;
  pendingCount: number = 0;
  sentCount: number = 0;
  draftCount: number = 0;

  ngOnInit() {
    this.loadLetters();
  }

  loadLetters() {
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    // Subscribe to user's emails
    this.emailService.getEmailsByUser(currentUser.uid).subscribe(emails => {
      this.letters = emails;
      this.filteredLetters = emails;
      this.updateStats();
      this.cdr.markForCheck();
    });
  }

  updateStats() {
    this.totalLetters = this.letters.length;
    this.pendingCount = this.letters.filter(l => l.status === 'pending').length;
    this.sentCount = this.letters.filter(l => l.status === 'sent').length;
    this.draftCount = this.letters.filter(l => l.status === 'draft').length;
  }

  filterLetters(filter: string) {
    this.activeFilter = filter;

    switch (filter) {
      case 'all':
        this.filteredLetters = this.letters;
        break;
      case 'future':
        this.filteredLetters = this.letters.filter(l => l.recipient === 'future');
        break;
      case 'family':
        this.filteredLetters = this.letters.filter(l => l.recipient === 'family');
        break;
      case 'friend':
        this.filteredLetters = this.letters.filter(l => l.recipient === 'friend');
        break;
      default:
        this.filteredLetters = this.letters;
    }
    this.cdr.markForCheck();
  }

  getRecipientText(recipient: string): string {
    switch (recipient) {
      case 'future': return '未来の自分へ';
      case 'family': return '大切な家族へ';
      case 'friend': return '大切な友達へ';
      default: return recipient;
    }
  }

  getStatusText(status?: string): string {
    switch (status) {
      case 'pending': return '送信待ち';
      case 'sent': return '送信済み';
      case 'draft': return '下書き';
      default: return '不明';
    }
  }

  getStatusClass(status?: string): string {
    switch (status) {
      case 'pending': return 'sent';
      case 'sent': return 'received';
      case 'draft': return 'draft';
      default: return '';
    }
  }

  getDaysUntil(timestamp: number): string {
    const now = Date.now();
    const diff = timestamp - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (days < 0) {
      return '配信済み';
    } else if (days === 0) {
      return '今日';
    } else if (days === 1) {
      return '明日';
    } else {
      return `あと${days}日`;
    }
  }

  formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getPreview(message: string): string {
    return message.length > 50 ? message.substring(0, 50) + '...' : message;
  }

  async deleteLetter(letterId: string, event: Event) {
    event.stopPropagation();
    
    if (confirm('この手紙を削除しますか？')) {
      try {
        await this.emailService.deleteEmail(letterId);
        alert('手紙を削除しました');
      } catch (error) {
        console.error('Error deleting letter:', error);
        alert('削除に失敗しました');
      }
    }
  }

  viewLetter(letter: EmailData) {
    // TODO: Navigate to letter detail page
    console.log('View letter:', letter);
  }
}