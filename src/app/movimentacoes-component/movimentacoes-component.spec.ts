import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { MovimentacoesComponent } from './movimentacoes-component';

describe('MovimentacoesComponent', () => {
  let component: MovimentacoesComponent;
  let fixture: ComponentFixture<MovimentacoesComponent>;

  beforeEach(async () => {
    sessionStorage.setItem('usuarioLogado', JSON.stringify({
      usuario: 'admin',
      nome: 'Administrador',
      cargo: 'Administrador'
    }));

    await TestBed.configureTestingModule({
      imports: [MovimentacoesComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(MovimentacoesComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  afterEach(() => {
    sessionStorage.removeItem('usuarioLogado');
    sessionStorage.removeItem('itensAcervo');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads collection items saved by the dashboard', () => {
    const item = {
      id: 1,
      nome: 'Violino',
      categoria: 'Instrumento de corda',
      localizacao: 'Sala A',
      situacao: 'No museu' as const,
      conservacao: 'Bom',
      descricao: ''
    };
    sessionStorage.setItem('itensAcervo', JSON.stringify([item]));

    component.carregarDados();

    expect(component.itensDisponiveis).toEqual([item]);
  });
});
