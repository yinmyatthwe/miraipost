import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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
  letterData: LetterData = {
    recipient: 'future',
    email: '',
    deliveryDate: '',
    title: '',
    paperType: 'plain',
    content: ''
  };

  selectedFileName: string = '';

  constructor(private router: Router) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.letterData.image = file;
      this.selectedFileName = file.name;
    }
  }
  
  onSaveDraft(): void {
    console.log('Saving draft:', this.letterData);
    // TODO: Add API call to save draft
    alert('下書きを保存しました！');
  }

  onSubmit(): void {
    console.log('Sending letter:', this.letterData);
    // TODO: Add API call to send letter
    alert('手紙を送信しました！');
    this.router.navigate(['/']);
  }
}