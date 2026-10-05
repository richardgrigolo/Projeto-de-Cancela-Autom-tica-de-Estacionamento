
export class TicketEstacionamento {
  #placa;
  #tipoCliente;
  #dataEntrada;
  #dataSaida = null;
  #valorPago = 0;
  #valorBruto = 0;
  #desconto = 0;
  #identificadorDesconto = 'nenhum';
  #status = 'ATIVO';
  constructor(placa, tipoCliente, dataEntrada = new Date()) {
    this.#placa = placa.toUpperCase();
    this.#tipoCliente = tipoCliente;
    this.#dataEntrada = new Date(dataEntrada);
  }
  get placa() { return this.#placa; }
  get tipoCliente() { return this.#tipoCliente; }
  get dataEntrada() { return this.#dataEntrada; }
  get dataSaida() { return this.#dataSaida; }
  get valorPago() { return this.#valorPago; }
  get valorBruto() { return this.#valorBruto; }
  get desconto() { return this.#desconto; }
  get identificadorDesconto() { return this.#identificadorDesconto; }
  get status() { return this.#status; }
  finalizar(saida, calculo) {
    this.#dataSaida = new Date(saida);
    this.#valorBruto = calculo.valorBruto;
    this.#desconto = calculo.desconto;
    this.#valorPago = calculo.valorFinal;
    this.#identificadorDesconto = calculo.identificadorDesconto;
    this.#status = 'FINALIZADO';
  }
  toCSV() {
    const entrada = this.#dataEntrada.toISOString();
    const saida = this.#dataSaida ? this.#dataSaida.toISOString() : '';
    return `${this.#placa},${entrada},${saida},${this.#valorBruto},${this.#desconto},${this.#valorPago},${this.#identificadorDesconto}`;
  }
}
