
export class Cliente {
  #id; #nome; #placas; #bloqueado;
  constructor(id, nome) {
    if (new.target === Cliente) throw new Error('Cliente é abstrata e não pode ser instanciada diretamente');
    this.#id = id; this.#nome = nome; this.#placas = new Set(); this.#bloqueado = false;
  }
  get id() { return this.#id; }
  get nome() { return this.#nome; }
  get placas() { return this.#placas; }
  get bloqueado() { return this.#bloqueado; }
  set bloqueado(v) { this.#bloqueado = v; }
  adicionarPlaca(placa) {
    const p = placa.toUpperCase().trim();
    if (this.#placas.has(p)) throw new Error(`Placa ${p} já cadastrada para ${this.#nome}`);
    this._checarLimite();
    this.#placas.add(p); return true;
  }
  removerPlaca(placa) { return this.#placas.delete(placa.toUpperCase().trim()); }
  possuiPlaca(placa) { return this.#placas.has(placa.toUpperCase().trim()); }
  podeEstacionar(registroEntradas) { throw new Error('podeEstacionar deve ser sobrescrito'); }
  calcularCustoDaEntrada(ticket, historico) { throw new Error('calcularCustoDaEntrada deve ser sobrescrito'); }
  getTipo() { return this.constructor.name; }
  _getLimitePlacas() { return Infinity; }
  _checarLimite() {
    if (this.#placas.size >= this._getLimitePlacas()) {
      throw new Error(`${this.getTipo()} ${this.#nome} atingiu limite de ${this._getLimitePlacas()} placa(s)`);
    }
  }
}
