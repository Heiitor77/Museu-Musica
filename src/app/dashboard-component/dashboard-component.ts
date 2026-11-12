
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, DatePipe, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

interface UsuarioLogado {
  usuario: string;
  nome: string;
  cargo: string;
}

interface ItemAcervo {
  id: number;
  nome: string;
  categoria: string;
  localizacao: string;
  situacao: 'No museu' | 'Fora do museu';
  conservacao: string;
  descricao: string;
}

@Component({
  selector: 'app-dashboard-component',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DatePipe,
    RouterLink
  ],
  templateUrl: './dashboard-component.html',
  styleUrl: './dashboard-component.css'
})
export class DashboardComponent implements OnInit {

  usuario = {
    usuario: '',
    nome: 'Usuário',
    cargo: ''
  };

  dataAtual = new Date();

  itens: ItemAcervo[] = [];

  mostrarFormulario = false;

  novoItem: ItemAcervo = this.criarItemVazio();

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const dados = sessionStorage.getItem('usuarioLogado');

    if (!dados) {
      this.router.navigate(['/login']);
      return;
    }

    try {
      const usuarioLogado: UsuarioLogado = JSON.parse(dados);

      this.usuario = {
        usuario: usuarioLogado.usuario ?? '',
        nome: usuarioLogado.nome ?? 'Usuário',
        cargo: usuarioLogado.cargo ?? ''
      };
    } catch {
      sessionStorage.removeItem('usuarioLogado');
      this.router.navigate(['/login']);
      return;
    }

    const itensSalvos = sessionStorage.getItem('itensAcervo');
    if (itensSalvos) {
      this.itens = JSON.parse(itensSalvos);
    }
  }

  get saudacao(): string {
    const hora = new Date().getHours();

    if (hora < 12) return 'Bom dia';
    if (hora < 18) return 'Boa tarde';

    return 'Boa noite';
  }

  private criarItemVazio(): ItemAcervo {
    return {
      id: 0,
      nome: '',
      categoria: '',
      localizacao: '',
      situacao: 'No museu',
      conservacao: 'Bom',
      descricao: ''
    };
  }

  get totalAcervo(): number {
    return this.itens.length;
  }

  get totalNoMuseu(): number {
    return this.itens.filter(
      item => item.situacao === 'No museu'
    ).length;
  }

  get totalForaMuseu(): number {
    return this.itens.filter(
      item => item.situacao === 'Fora do museu'
    ).length;
  }

  get percentualNoMuseu(): string {
    if (this.totalAcervo === 0) return '0,0';

    return (
      (this.totalNoMuseu / this.totalAcervo) * 100
    ).toFixed(1).replace('.', ',');
  }

  get percentualForaMuseu(): string {
    if (this.totalAcervo === 0) return '0,0';

    return (
      (this.totalForaMuseu / this.totalAcervo) * 100
    ).toFixed(1).replace('.', ',');
  }

  get totalExposicoes(): number {
    return 0;
  }

  private salvarItens(): void {
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.setItem('itensAcervo', JSON.stringify(this.itens));
    }
  }

  // Abre o popup de cadastro
  abrirFormulario(): void {
    this.novoItem = this.criarItemVazio();
    this.mostrarFormulario = true;
  }

  // Fecha o popup e limpa os campos
  cancelarCadastro(): void {
    this.novoItem = this.criarItemVazio();
    this.mostrarFormulario = false;
  }

  // Salva o novo item
  adicionarItem(): void {
    const nome = this.novoItem.nome.trim();
    const categoria = this.novoItem.categoria.trim();
    const localizacao = this.novoItem.localizacao.trim();

    if (!nome || !categoria || !localizacao) {
      return;
    }

    const item: ItemAcervo = {
      ...this.novoItem,
      id: Date.now(),
      nome,
      categoria,
      localizacao,
      descricao: this.novoItem.descricao.trim()
    };

    this.itens = [...this.itens, item];
    this.salvarItens();

    this.cancelarCadastro();
  }

  // Remove um item
  removerItem(id: number): void {
    this.itens = this.itens.filter(
      item => item.id !== id
    );
    this.salvarItens();
  }

  // Altera a situação do item
  alterarSituacao(
    id: number,
    situacao: 'No museu' | 'Fora do museu'
  ): void {
    this.itens = this.itens.map(item =>
      item.id === id ? { ...item, situacao } : item
    );
    this.salvarItens();
  }

  // Encerra a sessão
  sair(): void {
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.removeItem('usuarioLogado');
    }

    this.router.navigate(['/login']);
  }
}
