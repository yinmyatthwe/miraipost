import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent {
  openSection: string | null = null;

  toggleSection(section: string) {
    if (this.openSection === section) {
      this.openSection = null;
    } else {
      this.openSection = section;
    }
  }
}