import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'; // Paso 1: Importar
// 1. Importa RouterLink
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink], // Agregar a imports
  templateUrl: './register.component.html',
  //styleUrl: './register.component.css',
})
export class RegisterComponent implements OnInit {
  // Aquí programaremos la lógica
  registerForm!: FormGroup;

  constructor(private fb: FormBuilder) {}
  // Método para facilitar el acceso a los controles en el HTML
  get f() {
    return this.registerForm.controls;
  }
  ngOnInit(): void {
    // Definimos la estructura del formulario y sus validaciones
    this.registerForm = this.fb.group({
      documento: ['', [Validators.required, Validators.pattern('^[0-9]*$')]], // Solo números
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      apellido: ['', [Validators.required, Validators.minLength(3)]],
      telefono: ['', [Validators.required, Validators.minLength(3)]],
      role: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }
  onSubmit(): void {
    if (this.registerForm.valid) {
      console.log('Datos del registro:', this.registerForm.value);
      // Aquí es donde llamaremos a tu servicio de autenticación más adelante
      alert('Formulario listo para enviar al Backend!');
    } else {
      console.warn('Formulario inválido, revisa los campos.');
    }
  }
}
