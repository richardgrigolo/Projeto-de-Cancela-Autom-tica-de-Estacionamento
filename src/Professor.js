
import { Cliente } from './Cliente.js';
import { REGRAS } from './constants.js';
export class Professor extends Cliente {
  constructor(id, nome) { super(id, nome); }
  _getLimitePlacas() { return REGRAS.PROFESSOR_MAX_PLACAS; }
  podeEstacionar(registroEntradas) {
    const ativos = registroEntradas.listarAtivosPorCliente(this);
    if (ativos.length >= 1) return { permitido: false, motivo: 'Professor já possui veículo estacionado' };
    return { permitido: true };
  }
  calcularCustoDaEntrada(ticket) { return { valorBruto: 0, desconto: 0, valorFinal: 0, identificadorDesconto: 'nenhum' }; }
}
