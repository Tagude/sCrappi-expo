import { Component, signal } from '@angular/core';
import { NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,NgbAlertModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('sCrappi');
  // Creamos una señal para saber si la alerta debe mostrarse
  show = signal(true);

  // Método para cerrar la alerta
  close() {
    this.show.set(false);
  }
}
