import { Cliente } from './Cliente.js';
import { TARIFAS, REGRAS } from './constants.js';

export class Estudante extends Cliente {
  static VALOR_FIXO = TARIFAS.ESTUDANTE_VALOR_INGRESSO;
  #saldo = 0;

  constructor(id, nome, saldoInicial = 0) {
    super(id, nome);
    this.#saldo = Number(saldoInicial) || 0;
  }

  get saldo() { return this.#saldo; }
  _getLimitePlacas() { return REGRAS.ESTUDANTE_MAX_PLACAS; }

  podeEstacionar() {
    if (this.bloqueado || this.#saldo < 0) {
      return { permitido: false, motivo: 'Saldo negativo - recarregue para estacionar' };
    }
    return { permitido: true };
  }

  // Cobrança fixa por ingresso R$ 15,00 conforme requisito
  calcularCustoDaEntrada(ticket) {
    const custo = Estudante.VALOR_FIXO;
    return {
      valorBruto: custo,
      desconto: 0,
      valorFinal: custo,
      identificadorDesconto: 'nenhum'
    };
  }

  debitar(v) { this.#saldo -= v; }
  carregarSaldo(v) { this.#saldo += v; }
}