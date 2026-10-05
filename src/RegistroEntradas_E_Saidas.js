
import { TicketEstacionamento } from './TicketEstacionamento.js';
import { ClienteAvulso } from './ClienteAvulso.js';
import { CalculadoraDesconto } from './CalculadoraDesconto.js';

export class RegistroDeEntradas_E_Saidas {
  #estacionadosAtivos = new Map();
  #historicoTickets = [];
  #cadastroClientes;
  #calculadoraDesconto;
  #CAPACIDADE_MAX = 9000;

  constructor(cadastroClientes) {
    this.#cadastroClientes = cadastroClientes;
    this.#calculadoraDesconto = new CalculadoraDesconto();
  }

  get estacionadosAtivos() { return this.#estacionadosAtivos; }
  get historicoTickets() { return this.#historicoTickets; }

  listarAtivosPorCliente(cliente) {
    const res = [];
    for (const ticket of this.#estacionadosAtivos.values()) {
      const dono = this.#cadastroClientes.buscarPorPlaca(ticket.placa);
      if (dono && dono.id === cliente.id) res.push(ticket);
    }
    return res;
  }

  registrarEntrada(placa, dataEntrada = new Date()) {
    const p = placa.toUpperCase();
    if (this.#estacionadosAtivos.size >= this.#CAPACIDADE_MAX) throw new Error('Estacionamento lotado - capacidade máxima de 9000 atingida');
    if (this.#estacionadosAtivos.has(p)) throw new Error(`Veículo ${p} já está no estacionamento`);
    let cliente = this.#cadastroClientes.buscarPorPlaca(p);
    let tipoCliente = 'Avulso';
    if (cliente) {
      tipoCliente = cliente.getTipo();
      const permissao = cliente.podeEstacionar(this);
      if (!permissao.permitido) throw new Error(`Entrada negada para ${p} (${cliente.nome}): ${permissao.motivo}`);
    } else {
      if (this.#cadastroClientes.isAvulsoBloqueado(p)) throw new Error(`Placa ${p} bloqueada por inadimplência avulsa`);
      cliente = new ClienteAvulso(p);
      tipoCliente = 'Avulso';
    }
    const ticket = new TicketEstacionamento(p, tipoCliente, dataEntrada);
    this.#estacionadosAtivos.set(p, ticket);
    this.#historicoTickets.push(ticket);
    return { ticket, cliente };
  }

  registrarSaida(placa, dataSaida = new Date(), pago = true) {
    const p = placa.toUpperCase();
    const ticket = this.#estacionadosAtivos.get(p);
    if (!ticket) throw new Error(`Veículo ${p} não encontrado no pátio`);
    const cliente = this.#cadastroClientes.buscarPorPlaca(p);
    let calculo;
    if (cliente) {
      const tempTicket = { dataEntrada: ticket.dataEntrada, dataSaida, placa: p };
      calculo = cliente.calcularCustoDaEntrada(tempTicket, this.#historicoTickets, this.#calculadoraDesconto);
      if (cliente.getTipo() === 'Estudante') cliente.debitar(calculo.valorFinal);
      else if (cliente.getTipo() === 'Empresa') cliente.acumularDebito(calculo.valorFinal);
    } else {
      const avulso = new ClienteAvulso(p);
      const tempTicket = { placa: p, dataEntrada: ticket.dataEntrada, dataSaida };
      calculo = avulso.calcularCustoDaEntrada(tempTicket, this.#historicoTickets, this.#calculadoraDesconto);
      if (!pago) { this.#cadastroClientes.bloquearAvulso(p); calculo.valorFinal = 0; }
    }
    ticket.finalizar(dataSaida, calculo);
    this.#estacionadosAtivos.delete(p);
    return ticket;
  }
}
