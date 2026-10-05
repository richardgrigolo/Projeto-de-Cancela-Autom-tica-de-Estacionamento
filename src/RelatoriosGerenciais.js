export class RelatoriosGerenciais {
  constructor(cadastroClientes, registroEntradas) {
    this.cadastro = cadastroClientes;
    this.registro = registroEntradas;
  }

  _parseFimData(dataFimStr) {
    const f = new Date(dataFimStr);
    f.setHours(23, 59, 59, 999);
    return f;
  }

  totalArrecadadoPorPeriodo(inicio, fim) {
    const ini = new Date(inicio);
    const f = this._parseFimData(fim);
    return this.registro.historicoTickets
      .filter(t => t.status === 'FINALIZADO' && t.dataSaida >= ini && t.dataSaida <= f)
      .reduce((acc, t) => acc + t.valorPago, 0);
  }

  totalArrecadadoPorPeriodoECategoria(inicio, fim, categorias = []) {
    const ini = new Date(inicio);
    const f = this._parseFimData(fim);
    const cats = categorias.map(c => c.toLowerCase().trim());
    return this.registro.historicoTickets.filter(t => {
      if (t.status !== 'FINALIZADO') return false;
      if (t.dataSaida < ini || t.dataSaida > f) return false;
      if (cats.length === 0) return true;
      return cats.includes(t.tipoCliente.toLowerCase());
    }).reduce((acc, t) => acc + t.valorPago, 0);
  }

  situacaoCliente(id) {
    const cli = this.cadastro.buscarPorId(id);
    if (!cli) throw new Error('Cliente não encontrado');
    const ativos = this.registro.listarAtivosPorCliente(cli);
    return {
      id: cli.id,
      nome: cli.nome,
      tipo: cli.getTipo(),
      veiculosAtivos: ativos.map(t => ({ placa: t.placa, entrada: t.dataEntrada })),
      saldoOuDebito: cli.saldo ?? cli.debito ?? 0,
      bloqueado: cli.bloqueado || cli.inadimplente || false
    };
  }

  registrosDeClientePorPeriodo(id, inicio, fim) {
    const cli = this.cadastro.buscarPorId(id);
    if (!cli) throw new Error('Cliente não encontrado');
    const ini = new Date(inicio);
    const f = this._parseFimData(fim);
    const placas = [...cli.placas];
    return this.registro.historicoTickets.filter(t => placas.includes(t.placa) && t.dataEntrada >= ini && t.dataEntrada <= f);
  }

  registrosAvulsoPorPeriodo(placa, inicio, fim) {
    const ini = new Date(inicio);
    const f = this._parseFimData(fim);
    return this.registro.historicoTickets.filter(t => t.placa === placa.toUpperCase() && t.tipoCliente === 'Avulso' && t.dataEntrada >= ini && t.dataEntrada <= f);
  }

  clientesImpedidos() {
    return this.cadastro.listarImpedidos();
  }

  top10ClientesMaisFrequentes(ano) {
    const mapFreq = new Map();
    for (const t of this.registro.historicoTickets) {
      const dataRef = t.dataEntrada || t.dataSaida;
      if (!dataRef || new Date(dataRef).getFullYear() !== ano) continue;
      const cli = this.cadastro.buscarPorPlaca(t.placa);
      const key = cli ? cli.id : `AVULSO_${t.placa}`;
      mapFreq.set(key, (mapFreq.get(key) || 0) + 1);
    }
    return [...mapFreq.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([key, freq]) => {
        const cli = this.cadastro.buscarPorId(key);
        return {
          id: cli ? cli.id : key,
          nome: cli ? cli.nome : `Avulso (${key.replace('AVULSO_', '')})`,
          tipo: cli ? cli.getTipo() : 'Avulso',
          frequencia: freq
        };
      });
  }

  vagasOcupadasNoMomento() {
    return this.registro.estacionadosAtivos.size;
  }
}