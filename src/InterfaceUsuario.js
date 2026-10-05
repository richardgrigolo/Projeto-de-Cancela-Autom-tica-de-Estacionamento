
import readline from 'readline';
import { Estudante } from './Estudante.js';
import { Professor } from './Professor.js';
import { Empresa } from './Empresa.js';

export class InterfaceUsuario {
  constructor(app, persistencia) {
    this.app = app;
    this.persistencia = persistencia;
    this.rl = readline.createInterface({input: process.stdin, output: process.stdout});
  }

  perguntar(q) { return new Promise(res=>this.rl.question(q, ans=>res(ans))); }

  async iniciar() {
    this.app.iniciar();
    console.log('\n=== EstACME - Fase 2 - Menu Principal ===');
    let sair=false;
    while(!sair) {
      console.log(`
1 - Cadastrar Cliente
2 - Registrar Entrada de Veículo
3 - Registrar Saída de Veículo (com pagamento)
4 - Consultar Situação de Cliente
5 - Relatórios Gerenciais
6 - Salvar Dados (CSV)
0 - Sair e Salvar
Vagas ocupadas: ${this.app.relatorios.vagasOcupadasNoMomento()} / 9000
`);
      const op = await this.perguntar('Escolha: ');
      switch(op.trim()) {
        case '1': await this.cadastrarCliente(); break;
        case '2': await this.entradaVeiculo(); break;
        case '3': await this.saidaVeiculo(); break;
        case '4': await this.consultaCliente(); break;
        case '5': await this.menuRelatorios(); break;
        case '6': this.persistencia.salvarTudo(); break;
        case '0': this.persistencia.salvarTudo(); sair=true; break;
        default: console.log('Opção inválida');
      }
    }
    this.rl.close();
  }

  async cadastrarCliente() {
    console.log('\n--- Cadastro ---');
    const id = await this.perguntar('ID/CPF/CNPJ: ');
    const nome = await this.perguntar('Nome: ');
    const tipo = await this.perguntar('Tipo (1-Estudante 2-Professor 3-Empresa): ');
    const saldo = await this.perguntar('Saldo inicial (só estudante/empresa devedora, senão 0): ');
    let cli;
    try {
      if (tipo==='1') cli = new Estudante(id,nome, Number(saldo));
      else if (tipo==='2') cli = new Professor(id,nome);
      else if (tipo==='3') cli = new Empresa(id,nome, Number(saldo));
      else { console.log('Tipo inválido'); return; }
      const placa = await this.perguntar('Placa inicial: ');
      cli.adicionarPlaca(placa);
      this.app.cadastroClientes.cadastrarCliente(cli);
      console.log(`Cliente ${nome} cadastrado!`);
    } catch (e) { console.log('Erro:', e.message); }
  }

  async entradaVeiculo() {
    const placa = await this.perguntar('Placa: ');
    try {
      const {ticket, cliente} = this.app.registroEntradas.registrarEntrada(placa);
      console.log(`Entrada liberada: ${placa} - ${cliente.nome} - ${ticket.tipoCliente} às ${ticket.dataEntrada.toLocaleString()}`);
    } catch (e) { console.log('Entrada NEGADA:', e.message); }
  }

  async saidaVeiculo() {
    const placa = await this.perguntar('Placa: ');
    const pagou = await this.perguntar('Avulso pagou? (S/n) para avulso: ');
    const pago = pagou.toLowerCase()!=='n';
    try {
      const ticket = this.app.registroEntradas.registrarSaida(placa, new Date(), pago);
      console.log(`Saída: ${ticket.placa} | Bruto R$${ticket.valorBruto} | Desconto ${ticket.identificadorDesconto} R$${ticket.desconto} | Pago R$${ticket.valorPago}`);
      if (!pago) console.log('Placa bloqueada por calote avulso');
    } catch (e) { console.log('Erro saída:', e.message); }
  }

  async consultaCliente() {
    const id = await this.perguntar('ID do cliente: ');
    try {
      const sit = this.app.relatorios.situacaoCliente(id);
      console.log(sit);
    } catch (e) { console.log(e.message); }
  }

  async menuRelatorios() {
    console.log(`
--- Relatórios ---
a) Total arrecadado por período
b) Total por período e categoria
c) Registros de cliente por período
d) Registros avulso por período
e) Clientes impedidos
f) Top 10 mais frequentes do ano
`);
    const op = await this.perguntar('Escolha (a-f): ');
    try {
      if (op==='a') {
        const ini = await this.perguntar('Início (YYYY-MM-DD): ');
        const fim = await this.perguntar('Fim (YYYY-MM-DD): ');
        console.log('Total:', this.app.relatorios.totalArrecadadoPorPeriodo(ini,fim));
      } else if (op==='b') {
        const ini = await this.perguntar('Início: ');
        const fim = await this.perguntar('Fim: ');
        const cats = (await this.perguntar('Categorias (ex: Estudante,Professor,Empresa,Avulso) separadas por vírgula ou vazio: ')).split(',').filter(Boolean);
        console.log('Total:', this.app.relatorios.totalArrecadadoPorPeriodoECategoria(ini,fim,cats));
      } else if (op==='c') {
        const id = await this.perguntar('ID: ');
        const ini = await this.perguntar('Início: ');
        const fim = await this.perguntar('Fim: ');
        console.table(this.app.relatorios.registrosDeClientePorPeriodo(id,ini,fim).map(t=>({placa:t.placa, entrada:t.dataEntrada, saida:t.dataSaida, pago:t.valorPago})));
      } else if (op==='d') {
        const placa = await this.perguntar('Placa avulsa: ');
        const ini = await this.perguntar('Início: ');
        const fim = await this.perguntar('Fim: ');
        console.table(this.app.relatorios.registrosAvulsoPorPeriodo(placa,ini,fim).map(t=>({placa:t.placa, entrada:t.dataEntrada, saida:t.dataSaida, pago:t.valorPago})));
      } else if (op==='e') {
        console.table(this.app.relatorios.clientesImpedidos());
      } else if (op==='f') {
        const ano = await this.perguntar('Ano (ex 2025): ');
        console.table(this.app.relatorios.top10ClientesMaisFrequentes(Number(ano)));
      }
    } catch (e) { console.log('Erro relatório:', e.message); }
  }
}
