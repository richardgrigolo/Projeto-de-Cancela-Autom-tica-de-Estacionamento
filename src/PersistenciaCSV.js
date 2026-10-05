import fs from 'fs';
import path from 'path';
import { Estudante } from './Estudante.js';
import { Professor } from './Professor.js';
import { Empresa } from './Empresa.js';
import { TicketEstacionamento } from './TicketEstacionamento.js';

export class PersistenciaCSV {
  constructor(cadastro, registro, pasta = './data') {
    this.cadastro = cadastro;
    this.registro = registro;
    this.pasta = pasta;
    if (!fs.existsSync(pasta)) fs.mkdirSync(pasta, { recursive: true });
  }

  carregarTudo() {
    this.carregarClientes();
    this.carregarBloqueioAvulso();
    this.carregarRegistros();
  }

  carregarClientes() {
    const file = path.join(this.pasta, 'clientes.csv');
    if (!fs.existsSync(file)) return;

    const linhas = fs.readFileSync(file, 'utf-8').split('\n').filter(l => l.trim());

    for (const linha of linhas) {
      const partes = linha.split(',').map(p => p.trim());
      if (partes.length < 3) continue;

      const id = partes[0];
      const nome = partes[1];
      const campo3 = partes[2];

      try {
        let cli;
        let placas = [];

        if (campo3.toLowerCase() === 'professor') {
          cli = new Professor(id, nome);
          placas = partes.slice(3);
        } else {
          const tipo = partes[3];
          placas = partes.slice(4);

          if (tipo === 'Estudante') {
            cli = new Estudante(id, nome, Number(campo3) || 0);
          } else if (tipo === 'Empresa') {
            cli = new Empresa(id, nome, Number(campo3) || 0);
          } else {
            continue;
          }
        }

        for (const p of placas) {
          if (p) cli.adicionarPlaca(p);
        }

        this.cadastro.cadastrarCliente(cli);
      } catch (e) {
        console.log(`[Carga] Aviso no cliente ${id}: ${e.message}`);
      }
    }
  }

  carregarBloqueioAvulso() {
    const file = path.join(this.pasta, 'bloqueio_avulso.csv');
    if (!fs.existsSync(file)) return;
    const linhas = fs.readFileSync(file, 'utf-8').split('\n').filter(l => l.trim());
    for (const p of linhas) {
      if (p.toLowerCase() !== 'placa') this.cadastro.bloquearAvulso(p.trim());
    }
  }

  carregarRegistros() {
    const file = path.join(this.pasta, 'Registros.csv');
    if (!fs.existsSync(file)) return;

    const linhas = fs.readFileSync(file, 'utf-8').split('\n').filter(l => l.trim());

    for (const linha of linhas) {
      const partes = linha.split(',').map(p => p.trim());
      if (partes.length < 2) continue;

      const [placa, entrada, saida, bruto, desconto, pago] = partes;
      const clienteDono = this.cadastro.buscarPorPlaca(placa);
      const tipoCliente = clienteDono ? clienteDono.getTipo() : 'Avulso';

      try {
        const ticket = new TicketEstacionamento(placa, tipoCliente, entrada);
        
        if (saida && saida.trim() !== '') {
          ticket.finalizar(saida, {
            valorBruto: Number(bruto) || 0,
            desconto: Number(desconto) || 0,
            valorFinal: Number(pago) || 0,
            identificadorDesconto: Number(desconto) > 0 ? 'ClienteFrequente' : 'nenhum'
          });
        } else {
          this.registro.estacionadosAtivos.set(placa.toUpperCase(), ticket);
        }
        
        this.registro.historicoTickets.push(ticket);
      } catch (e) {
        console.log(`[Carga] Erro no registro da placa ${placa}: ${e.message}`);
      }
    }
  }

  salvarTudo() {
    this.salvarClientes();
    this.salvarBloqueioAvulso();
    this.salvarRegistros();
    console.log('[Persistência] Dados salvos com sucesso.');
  }

  salvarClientes() {
    const linhas = [];
    for (const cli of this.cadastro.clientesPorId.values()) {
      const tipo = cli.getTipo();
      const placas = [...cli.placas].join(',');

      if (tipo === 'Professor') {
        linhas.push(`${cli.id},${cli.nome},Professor${placas ? ',' + placas : ''}`);
      } else if (tipo === 'Estudante') {
        linhas.push(`${cli.id},${cli.nome},${cli.saldo},Estudante${placas ? ',' + placas : ''}`);
      } else if (tipo === 'Empresa') {
        linhas.push(`${cli.id},${cli.nome},${cli.debito},Empresa${placas ? ',' + placas : ''}`);
      }
    }
    fs.writeFileSync(path.join(this.pasta, 'clientes.csv'), linhas.join('\n'));
  }

  salvarBloqueioAvulso() {
    const linhas = [...this.cadastro.listarBloqueados()];
    fs.writeFileSync(path.join(this.pasta, 'bloqueio_avulso.csv'), linhas.join('\n'));
  }

  salvarRegistros() {
    const linhas = [];
    for (const t of this.registro.historicoTickets) {
      const entrada = t.dataEntrada ? new Date(t.dataEntrada).toISOString() : '';
      const saida = t.dataSaida ? new Date(t.dataSaida).toISOString() : '';
      const eAtivo = !t.dataSaida || t.status !== 'FINALIZADO';
      
      const bruto = eAtivo ? '' : (t.valorBruto ?? 0);
      const desconto = eAtivo ? '' : (t.desconto ?? 0);
      const pago = eAtivo ? '' : (t.valorPago ?? 0);

      linhas.push(`${t.placa},${entrada},${saida},${bruto},${desconto},${pago}`);
    }
    fs.writeFileSync(path.join(this.pasta, 'Registros.csv'), linhas.join('\n'));
  }
}