import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './components/home/home.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('miraipost_app');
}
