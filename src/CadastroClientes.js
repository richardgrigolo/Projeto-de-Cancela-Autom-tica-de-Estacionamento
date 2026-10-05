
export class CadastroClientes {
  #clientesPorId = new Map();
  #placasRegistradas = new Map();
  #bloqueioAvulso = new Set();
  constructor() {}
  get clientesPorId() { return this.#clientesPorId; }
  get placasRegistradas() { return this.#placasRegistradas; }
  cadastrarCliente(cliente) {
    if (this.#clientesPorId.has(cliente.id)) throw new Error(`Cliente ${cliente.id} já existe`);
    for (const placa of cliente.placas) {
      if (this.#placasRegistradas.has(placa)) throw new Error(`Placa ${placa} já cadastrada em outro cliente`);
    }
    this.#clientesPorId.set(cliente.id, cliente);
    for (const placa of cliente.placas) {
      this.#placasRegistradas.set(placa, cliente);
    }
    return cliente;
  }
  removerCliente(id) {
    const cli = this.#clientesPorId.get(id);
    if (!cli) return false;
    for (const placa of cli.placas) this.#placasRegistradas.delete(placa);
    this.#clientesPorId.delete(id);
    return true;
  }
  adicionarPlaca(id, placa) {
    const cli = this.#clientesPorId.get(id);
    if (!cli) throw new Error('Cliente não encontrado');
    const p = placa.toUpperCase();
    if (this.#placasRegistradas.has(p)) throw new Error(`Placa ${p} já cadastrada`);
    cli.adicionarPlaca(p);
    this.#placasRegistradas.set(p, cli);
  }
  removerPlaca(id, placa) {
    const cli = this.#clientesPorId.get(id);
    if (!cli) throw new Error('Cliente não encontrado');
    const p = placa.toUpperCase();
    cli.removerPlaca(p);
    this.#placasRegistradas.delete(p);
  }
  buscarPorPlaca(placa) {
    return this.#placasRegistradas.get(placa.toUpperCase()) || null;
  }
  buscarPorId(id) {
    return this.#clientesPorId.get(id) || null;
  }
  bloquearAvulso(placa) { this.#bloqueioAvulso.add(placa.toUpperCase()); }
  isAvulsoBloqueado(placa) { return this.#bloqueioAvulso.has(placa.toUpperCase()); }
  listarBloqueados() { return [...this.#bloqueioAvulso]; }
  listarImpedidos(){
    const impedidos=[];
    for (const cli of this.#clientesPorId.values()){
      let motivo=null;
      if (cli.bloqueado) motivo='Bloqueado';
      else if (cli.getTipo()==='Estudante' && cli.saldo<0) motivo=`Saldo negativo R$${cli.saldo}`;
      else if (cli.getTipo()==='Empresa' && (cli.inadimplente || cli.debito>0)) motivo=`Inadimplente débito R$${cli.debito}`;
      if (motivo) impedidos.push({ ID: cli.id, Nome: cli.nome, Tipo: cli.getTipo(), Motivo: motivo, Placas: [...cli.placas].join(';') });
    }
    return impedidos;
  }
  get totalClientes() { return this.#clientesPorId.size; }
}
