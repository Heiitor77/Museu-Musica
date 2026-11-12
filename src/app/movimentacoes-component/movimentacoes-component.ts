
import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

interface ItemAcervo {
  id: number;
  nome: string;
  categoria: string;
  localizacao: string;
  situacao: 'No museu' | 'Fora do museu';
  conservacao: string;
  descricao: string;
}

interface ItemMovimentacao {
  idItem: number;
  nomeItem: string;
  categoria: string;
  estadoNaSaida: string;
  estadoNoRetorno: string;
}

interface Movimentacao {
  id: number;
  codigo: string;
  tipo: string;
  destino: string;
  responsavel: string;
  dataSaida: string;
  dataRetornoPrevista: string;
  dataRetornoReal: string;
  observacao: string;
  situacao: 'Em andamento' | 'Concluída';
  itens: ItemMovimentacao[];
}

@Component({
  selector: 'app-movimentacoes-component',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DatePipe,
    RouterLink
  ],
  templateUrl: './movimentacoes-component.html',
  styleUrl: './movimentacoes-component.css'
})
export class MovimentacoesComponent implements OnInit {

  usuario = {
    nome: 'Usuário',
    cargo: ''
  };

  dataAtual = new Date();

  movimentacoes: Movimentacao[] = [];
  itensAcervo: ItemAcervo[] = [];

  mostrarFormulario = false;
  mostrarRetorno = false;

  movimentacaoSelecionada: Movimentacao | null = null;

  pesquisa = '';
  filtroSituacao = 'Todas';
  filtroTipo = 'Todos';

  novaMovimentacao = this.criarMovimentacaoVazia();

  estadosConservacao = [
    'Excelente',
    'Bom',
    'Regular',
    'Restauração necessária'
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.carregarUsuario();
    this.carregarDados();
  }

  // -----------------------------------------
  // USUÁRIO
  // -----------------------------------------

  carregarUsuario(): void {
    const dados = sessionStorage.getItem('usuarioLogado');

    if (!dados) {
      this.router.navigate(['/login']);
      return;
    }

    try {
      const usuario = JSON.parse(dados);

      this.usuario = {
        nome: usuario.nome ?? 'Usuário',
        cargo: usuario.cargo ?? ''
      };
    } catch {
      sessionStorage.removeItem('usuarioLogado');
      this.router.navigate(['/login']);
    }
  }

  sair(): void {
    sessionStorage.removeItem('usuarioLogado');
    this.router.navigate(['/login']);
  }

  // -----------------------------------------
  // ARMAZENAMENTO
  // -----------------------------------------

  carregarDados(): void {
    const itensSalvos = sessionStorage.getItem('itensAcervo');
    const movimentacoesSalvas = sessionStorage.getItem('movimentacoes');

    if (itensSalvos) {
      this.itensAcervo = JSON.parse(itensSalvos);
    }

    if (movimentacoesSalvas) {
      this.movimentacoes = JSON.parse(movimentacoesSalvas);
    }
  }

  salvarItens(): void {
    sessionStorage.setItem(
      'itensAcervo',
      JSON.stringify(this.itensAcervo)
    );
  }

  salvarMovimentacoes(): void {
    sessionStorage.setItem(
      'movimentacoes',
      JSON.stringify(this.movimentacoes)
    );
  }

  // -----------------------------------------
  // INDICADORES
  // -----------------------------------------

  get totalMovimentacoes(): number {
    return this.movimentacoes.length;
  }

  get totalSaidas(): number {
    return this.movimentacoes.length;
  }

  get totalEmAndamento(): number {
    return this.movimentacoes.filter(
      m => m.situacao === 'Em andamento'
    ).length;
  }

  get totalConcluidas(): number {
    return this.movimentacoes.filter(
      m => m.situacao === 'Concluída'
    ).length;
  }

  // -----------------------------------------
  // FILTROS
  // -----------------------------------------

  get movimentacoesFiltradas(): Movimentacao[] {
    const termo = this.pesquisa.toLowerCase().trim();

    return this.movimentacoes.filter(m => {
      const correspondePesquisa =
        m.codigo.toLowerCase().includes(termo) ||
        m.destino.toLowerCase().includes(termo) ||
        m.responsavel.toLowerCase().includes(termo) ||
        m.itens.some(item =>
          item.nomeItem.toLowerCase().includes(termo)
        );

      const correspondeSituacao =
        this.filtroSituacao === 'Todas' ||
        m.situacao === this.filtroSituacao;

      const correspondeTipo =
        this.filtroTipo === 'Todos' ||
        m.tipo === this.filtroTipo;

      return correspondePesquisa &&
        correspondeSituacao &&
        correspondeTipo;
    });
  }

  // -----------------------------------------
  // FORMULÁRIO
  // -----------------------------------------

  private criarMovimentacaoVazia() {
    return {
      tipo: '',
      destino: '',
      responsavel: '',
      dataSaida: this.dataHoje(),
      dataRetornoPrevista: '',
      observacao: '',
      itensSelecionados: [] as number[],
      estadosSaida: {} as { [id: number]: string }
    };
  }

  private dataHoje(): string {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');

    return `${ano}-${mes}-${dia}`;
  }

  abrirFormulario(): void {
    this.novaMovimentacao = this.criarMovimentacaoVazia();
    this.mostrarFormulario = true;
  }

  cancelarCadastro(): void {
    this.mostrarFormulario = false;
    this.novaMovimentacao = this.criarMovimentacaoVazia();
  }

  // -----------------------------------------
  // SELEÇÃO DE ITENS
  // -----------------------------------------

  get itensDisponiveis(): ItemAcervo[] {
    return this.itensAcervo.filter(
      item => item.situacao === 'No museu'
    );
  }

  alternarItem(id: number, selecionado: boolean): void {
    const selecionados = this.novaMovimentacao.itensSelecionados;

    if (selecionado && !selecionados.includes(id)) {
      selecionados.push(id);

      const item = this.itensAcervo.find(i => i.id === id);

      if (item) {
        this.novaMovimentacao.estadosSaida[id] =
          item.conservacao || 'Bom';
      }
    } else {
      this.novaMovimentacao.itensSelecionados =
        selecionados.filter(itemId => itemId !== id);

      delete this.novaMovimentacao.estadosSaida[id];
    }
  }

  itemSelecionado(id: number): boolean {
    return this.novaMovimentacao.itensSelecionados.includes(id);
  }

  // -----------------------------------------
  // CADASTRO DE MOVIMENTAÇÃO
  // -----------------------------------------

  adicionarMovimentacao(): void {
    const dados = this.novaMovimentacao;

    if (
      !dados.tipo ||
      !dados.destino.trim() ||
      !dados.responsavel.trim() ||
      !dados.dataSaida ||
      !dados.itensSelecionados.length
    ) {
      return;
    }

    if (
      dados.dataRetornoPrevista &&
      dados.dataRetornoPrevista < dados.dataSaida
    ) {
      return;
    }

    const itensSelecionados = this.itensAcervo.filter(
      item => dados.itensSelecionados.includes(item.id)
    );

    if (itensSelecionados.length !== dados.itensSelecionados.length) {
      return;
    }

    const id = Date.now();

    const nova: Movimentacao = {
      id,
      codigo: `MOV-${String(id).slice(-6)}`,
      tipo: dados.tipo,
      destino: dados.destino.trim(),
      responsavel: dados.responsavel.trim(),
      dataSaida: dados.dataSaida,
      dataRetornoPrevista: dados.dataRetornoPrevista,
      dataRetornoReal: '',
      observacao: dados.observacao.trim(),
      situacao: 'Em andamento',
      itens: itensSelecionados.map(item => ({
        idItem: item.id,
        nomeItem: item.nome,
        categoria: item.categoria,
        estadoNaSaida:
          dados.estadosSaida[item.id] || item.conservacao,
        estadoNoRetorno: ''
      }))
    };

    // Atualiza a situação dos itens
    this.itensAcervo = this.itensAcervo.map(item =>
      dados.itensSelecionados.includes(item.id)
        ? { ...item, situacao: 'Fora do museu' }
        : item
    );

    this.movimentacoes = [nova, ...this.movimentacoes];

    this.salvarItens();
    this.salvarMovimentacoes();

    this.cancelarCadastro();
  }

  // -----------------------------------------
  // RETORNO DOS ITENS
  // -----------------------------------------

  abrirRetorno(movimentacao: Movimentacao): void {
    this.movimentacaoSelecionada = movimentacao;
    this.mostrarRetorno = true;
  }

  cancelarRetorno(): void {
    this.mostrarRetorno = false;
    this.movimentacaoSelecionada = null;
  }

  registrarRetorno(): void {
    const movimentacao = this.movimentacaoSelecionada;

    if (!movimentacao) {
      return;
    }

    const atualizada: Movimentacao = {
      ...movimentacao,
      situacao: 'Concluída',
      dataRetornoReal: this.dataHoje(),
      itens: movimentacao.itens.map(item => ({
        ...item,
        estadoNoRetorno: item.estadoNoRetorno || item.estadoNaSaida
      }))
    };

    this.movimentacoes = this.movimentacoes.map(m =>
      m.id === movimentacao.id ? atualizada : m
    );

    const idsItens = movimentacao.itens.map(item => item.idItem);

    this.itensAcervo = this.itensAcervo.map(item =>
      idsItens.includes(item.id)
        ? { ...item, situacao: 'No museu' }
        : item
    );

    this.salvarItens();
    this.salvarMovimentacoes();

    this.cancelarRetorno();
  }

  // -----------------------------------------
  // LOGOUT
  // -----------------------------------------

}
