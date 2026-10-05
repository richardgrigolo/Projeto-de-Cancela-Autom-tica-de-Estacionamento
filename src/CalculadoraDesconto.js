
import { REGRAS } from './constants.js';
export class CalculadoraDesconto {
  constructor() { this.estrategias = [new DescontoClienteFrequente()]; }
  aplicarDesconto(ticket, historico, valorBruto) {
    for (const est of this.estrategias) {
      const res = est.calcular(ticket, historico, valorBruto);
      if (res && res.valorDesconto > 0) return res;
    }
    return { valorDesconto: 0, identificador: 'nenhum' };
  }
  adicionarEstrategia(estrategia) { this.estrategias.push(estrategia); }
}
class DescontoClienteFrequente {
  calcular(ticket, historico, valorBruto) {
    const placa = ticket.placa;
    const agora = new Date(ticket.dataEntrada);
    const limite = new Date(agora);
    limite.setDate(limite.getDate() - REGRAS.CLIENTE_FREQUENTE_JANELA_DIAS);
    const usos = historico.filter(t => t.placa === placa && t.status === 'FINALIZADO' && new Date(t.dataEntrada) >= limite && new Date(t.dataEntrada) < agora).length;
    if (usos >= REGRAS.CLIENTE_FREQUENTE_MIN_USOS) {
      const desconto = valorBruto * REGRAS.CLIENTE_FREQUENTE_DESCONTO;
      return { valorDesconto: desconto, identificador: 'ClienteFrequente' };
    }
    return { valorDesconto: 0, identificador: 'nenhum' };
  }
}
