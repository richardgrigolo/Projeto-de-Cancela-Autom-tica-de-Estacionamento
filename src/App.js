
import { CadastroClientes } from './CadastroClientes.js';
import { RegistroDeEntradas_E_Saidas } from './RegistroEntradas_E_Saidas.js';
import { RelatoriosGerenciais } from './RelatoriosGerenciais.js';
import { PersistenciaCSV } from './PersistenciaCSV.js';
import { Estudante } from './Estudante.js';
import { Professor } from './Professor.js';
import { Empresa } from './Empresa.js';

export class App {
  constructor() {
    this.cadastroClientes = new CadastroClientes();
    this.registroEntradas = new RegistroDeEntradas_E_Saidas(this.cadastroClientes);
    this.relatorios = new RelatoriosGerenciais(this.cadastroClientes, this.registroEntradas);
    this.persistencia = new PersistenciaCSV(this.cadastroClientes, this.registroEntradas);
  }
  iniciar() {
    console.log('=== Sistema EstACME Fase 2 iniciado ===');
    console.log('Capacidade: 9000 vagas | Estruturas: Map e Set');
    this.persistencia.carregarTudo();
    if (this.cadastroClientes.totalClientes===0) this._seedExemplo();
    console.log(`Clientes carregados: ${this.cadastroClientes.totalClientes} | Tickets: ${this.registroEntradas.historicoTickets.length} | Ativos: ${this.registroEntradas.estacionadosAtivos.size}`);
  }
  _seedExemplo() {
    try {
      const e1 = new Estudante('12345678901', 'João Silva', 100); e1.adicionarPlaca('ABC1D23'); this.cadastroClientes.cadastrarCliente(e1);
      const p1 = new Professor('34567890123', 'Carlos Oliveira'); p1.adicionarPlaca('JKL4G56'); p1.adicionarPlaca('GHI3F45'); this.cadastroClientes.cadastrarCliente(p1);
      const emp1 = new Empresa('56789012345', 'Tecnopuc S.A.', 30); emp1.adicionarPlaca('STU7J89'); this.cadastroClientes.cadastrarCliente(emp1);
      console.log('Seed inicial criado');
    } catch(e){ console.log('Seed erro', e.message); }
  }
}
