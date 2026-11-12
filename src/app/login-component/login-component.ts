import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface Usuario {
  usuario: string;
  senha: string;
  nome: string;
  cargo: string;
}

@Component({
  selector: 'app-login-component',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login-component.html',
  styleUrl: './login-component.css'
})
export class LoginComponent {
  usuario = '';
  senha = '';
  mostrarSenha = false;
  erro = '';

  private usuarios: Usuario[] = [
    {
      usuario: 'admin',
      senha: '1234',
      nome: 'Administrador',
      cargo: 'Administrador'
    },
    {
      usuario: 'funcionario',
      senha: '1234',
      nome: 'Funcionário do Museu',
      cargo: 'Funcionário'
    },
    {
      usuario: 'bello',
      senha: '1234',
      nome: 'Bellão',
      cargo: 'Dono da porra toda'
    }
  ];

  constructor(private router: Router) {}

  entrar(): void {
    this.erro = '';

    const encontrado = this.usuarios.find(
      u =>
        u.usuario === this.usuario.trim() &&
        u.senha === this.senha
    );

    if (!encontrado) {
      this.erro = 'Usuário ou senha incorretos.';
      return;
    }

    sessionStorage.setItem(
      'usuarioLogado',
      JSON.stringify({
        usuario: encontrado.usuario,
        nome: encontrado.nome,
        cargo: encontrado.cargo
      })
    );

    this.router.navigate(['/dashboard']);
  }
}
