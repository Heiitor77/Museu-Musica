import { ComponentFixture, TestBed } from '@angular/core/testing';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { provideRouter } from '@angular/router';

import { DashboardComponent } from './dashboard-component';

registerLocaleData(localePt);

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async () => {
    sessionStorage.setItem('usuarioLogado', JSON.stringify({
      usuario: 'admin',
      nome: 'Administrador',
      cargo: 'Administrador'
    }));
    sessionStorage.removeItem('itensAcervo');

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
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

  it('persists new collection items for the movements page', () => {
    component.novoItem = {
      id: 0,
      nome: 'Violino',
      categoria: 'Instrumento de corda',
      localizacao: 'Sala A',
      situacao: 'No museu',
      conservacao: 'Bom',
      descricao: ''
    };

    component.adicionarItem();

    expect(JSON.parse(sessionStorage.getItem('itensAcervo') ?? '[]')).toEqual(
      component.itens
    );
  });
});
