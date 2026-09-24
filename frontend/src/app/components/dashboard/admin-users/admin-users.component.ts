import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

// Importación del servicio actualizado a la carpeta 'user'
import { UserService, User } from '../../../services/user/user.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.css',
})
export class AdminUsersComponent implements OnInit, OnDestroy {
  currentUserRole: string = 'EMPLOYED';
  userForm!: FormGroup;
  listaOriginal: User[] = [];
  listaFiltrada: User[] = [];
  isLoading: boolean = true;
  isEditing: boolean = false;
  userIdToEdit: number | null = null;
  // Historial estático (se mantiene nombre como propiedad visual del log)
  historialOriginal = [
    {
      fecha: '08/03/2026 07:13:22',
      nombre: 'Natalia Taborda',
      evento: 'ENTRADA',
      coords: '6.1440, -75.6150',
      validacion: true,
    },
    {
      fecha: '08/03/2026 08:05:45',
      nombre: 'Jhon Mendoza',
      evento: 'RECHAZADO',
      coords: '6.1520, -75.6200',
      validacion: false,
    },
  ];
  historialFiltrado = [...this.historialOriginal];

  totalUsuarios: number = 0; // Ajustado de totalUsuarios
  alertasGeovalla: number = 0;
  mostrarAlerta: boolean = false;
  mensajeAlerta: string = '';
  tipoAlerta: 'success' | 'danger' = 'success';
  claseAlerta: string = '';

  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private userService: UserService,
    private cdr: ChangeDetectorRef,
  ) {
    // Definición de validaciones según los campos exactos de User.java
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      lastName: ['', Validators.required],
      document: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      userName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['EMPLOYED', Validators.required],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      password: ['', this.isEditing ? [] : [Validators.required, Validators.minLength(6)]],
      status: [true],
    });
  }
  ngOnInit(): void {
    // Limpiamos cualquier rastro anterior para forzar la lectura fresca
    const dataSesion = localStorage.getItem('usuariosSesion');

    if (dataSesion) {
      try {
        const user = JSON.parse(dataSesion);
        // Validamos que el rol venga del JSON que vimos en tu Postman
        this.currentUserRole = user.role ? user.role.toUpperCase() : 'EMPLOYED';
      } catch (e) {
        this.currentUserRole = 'EMPLOYED';
      }
    }

    console.log('--- SISTEMA DE PERMISOS ---');
    console.log('Rol detectado en tabla:', this.currentUserRole);

    this.cargarUsuarios();
    this.alertasGeovalla = 2;
  }

  cargarUsuarios(): void {
    this.isLoading = true;
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.listaOriginal = data;
        this.listaFiltrada = [...this.listaOriginal];
        this.totalUsuarios = this.listaOriginal.length;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.lanzarAlerta('Error al conectar con el servidor', 'danger'); // 👈 Alerta de error
        this.cdr.detectChanges();
      },
    });
  }
  // --- MÉTODO CENTRAL DE ALERTAS ---
  // --- Variables de apoyo ---
  userSeleccionado: User | null = null;

  async lanzarAlerta(mensaje: string, tipo: 'success' | 'danger' | 'warning') {
    // 1. Limpieza total inmediata
    this.mostrarAlerta = false;
    this.mensajeAlerta = '';
    this.cdr.detectChanges();

    // 2. Solo disparamos si hay un mensaje real
    if (!mensaje) return;

    setTimeout(() => {
      this.mensajeAlerta = mensaje;

      // Asignamos color
      if (tipo === 'success') this.claseAlerta = 'bg-success';
      else if (tipo === 'warning') this.claseAlerta = 'bg-warning';
      else if (tipo === 'danger') this.claseAlerta = 'bg-danger';

      this.mostrarAlerta = true;
      this.cdr.detectChanges();
    }, 150);

    // 3. Auto-ocultar
    setTimeout(() => {
      this.mostrarAlerta = false;
      this.cdr.detectChanges();
    }, 3500);
  }

  filtrarUsuarios(event: any) {
    const valor = event.target.value.toLowerCase();
    this.listaFiltrada = this.listaOriginal.filter(
      (user) =>
        user.name.toLowerCase().includes(valor) ||
        user.lastName.toLowerCase().includes(valor) ||
        user.userName.toLowerCase().includes(valor),
    );
    this.historialFiltrado = this.historialOriginal.filter((hist) =>
      hist.nombre.toLowerCase().includes(valor),
    );
  }

  abrirModalNuevo(content: any) {
    this.isEditing = false;
    this.userIdToEdit = null;

    // Al ser nuevo, el password es obligatorio
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);

    this.userForm.reset({
      role: '',
      status: true,
      name: '',
      lastName: '',
      document: '',
      phone: '',
      email: '',
      userName: '',
      password: '',
    });

    this.userForm.get('document')?.enable();
    this.userForm.get('userName')?.enable();

    // Permisos de Supervisor
    if (this.currentUserRole === 'SUPERVISOR') {
      this.userForm.get('role')?.disable();
    } else {
      this.userForm.get('role')?.enable();
    }

    this.modalService.open(content, { centered: true, size: 'lg' });
  }

  abrirModalEditar(user: any, content: any) {
    if (this.currentUserRole === 'EMPLOYED') {
      alert('No tienes permisos para editar usuarios');
      return;
    }
    this.isEditing = true;
    this.userIdToEdit = user.id;

    // Al editar, quitamos la obligatoriedad del password para no sobreescribirlo vacío
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();

    this.userForm.patchValue(user);
    this.userForm.get('document')?.disable();
    this.userForm.get('userName')?.disable();

    if (this.currentUserRole === 'SUPERVISOR') {
      this.userForm.get('role')?.disable();
    }

    this.modalService.open(content, { centered: true, size: 'lg' });
  }

  onSubmit() {
    if (this.userForm.invalid) return;
    const userData = this.userForm.getRawValue();

    if (this.isEditing && this.userIdToEdit) {
      this.userService.updateUser(this.userIdToEdit, userData).subscribe({
        next: () => {
          this.modalService.dismissAll();
          this.cargarUsuarios();
          this.lanzarAlerta('¡Usuario actualizado exitosamente!', 'success'); // 👈 Usa solo este
        },
        error: () => this.lanzarAlerta('No se pudo actualizar el usuario', 'danger'),
      });
    } else {
      this.userService.createUser(userData).subscribe({
        next: () => {
          this.modalService.dismissAll();
          this.cargarUsuarios();
          this.lanzarAlerta('¡Nuevo usuario creado con éxito!', 'success'); // 👈 Usa solo este
        },
        error: () => this.lanzarAlerta('Error al crear el usuario', 'danger'),
      });
    }
  }



 // 1. Cambia la variable de apoyo para que guarde el objeto completo
  eliminarUsuario(user: User, content: any) {
    if (!user || user.id === undefined) return;

    this.userSeleccionado = user;

    this.modalService.open(content, { centered: true, size: 'sm' }).result.then(
      async (result) => {
        if (result === 'confirmar' && this.userSeleccionado?.id !== undefined) {
          this.userService.deleteUser(this.userSeleccionado.id).subscribe({
            next: async () => {
              // Refrescamos la tabla
              this.cargarUsuarios();

              // Esperamos a que el modal desaparezca visualmente
              await new Promise((resolve) => setTimeout(resolve, 300));

              // Lógica de mensajes y colores dinámicos
              if (this.userSeleccionado?.status) {
                // Estaba activo -> Lo desactivamos (Amarillo)
                this.lanzarAlerta('¡Usuario desactivado correctamente!', 'warning');
              } else {
                // Estaba inactivo -> Lo activamos (Verde)
                this.lanzarAlerta('¡Usuario activado correctamente!', 'success');
              }
            },
            error: (err) => {
              console.error('Error:', err);
              this.lanzarAlerta('Error al procesar la solicitud', 'danger');
            },
          });
        }
      },
      () => {
        /* Cancelado */
      },
    );
  }
  gestionarGeovalla(user: User) {
    console.log(`Geovalla para: ${user.userName}`);
  }
ngOnDestroy(): void {
  this.mostrarAlerta = false;
  this.mensajeAlerta = '';
  this.claseAlerta = '';
  this.cdr.detach(); //
}
}
