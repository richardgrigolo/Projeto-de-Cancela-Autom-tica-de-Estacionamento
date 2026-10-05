
import { Cliente } from './Cliente.js';
import { TARIFAS } from './constants.js';
export class Empresa extends Cliente {
  static VALOR_DIARIA=TARIFAS.EMPRESA_VALOR_DIARIA;
  static MULTA_PERNOITE=TARIFAS.EMPRESA_MULTA_PERNOITE;
  #debito=0; #inadimplente=false;
  constructor(id,nome,debitoInicial=0){ super(id,nome); this.#debito=Number(debitoInicial)||0; }
  get debito(){ return this.#debito; }
  get inadimplente(){ return this.#inadimplente; }
  set inadimplente(v){ this.#inadimplente=v; }
  podeEstacionar(){ if (this.#inadimplente) return {permitido:false, motivo:'Empresa inadimplente - boleto em aberto'}; if (this.bloqueado) return {permitido:false, motivo:'Empresa bloqueada'}; return {permitido:true}; }
  calcularCustoDaEntrada(ticket){
    const entrada=new Date(ticket.dataEntrada);
    const saida=new Date(ticket.dataSaida);
    const d1=new Date(entrada); d1.setHours(0,0,0,0);
    const d2=new Date(saida); d2.setHours(0,0,0,0);
    const diffDias=Math.round((d2-d1)/(1000*60*60*24))+1;
    let dias=diffDias; if (dias<1) dias=1;
    let multa=0;
    if (entrada.toDateString()!==saida.toDateString()) multa=(dias-1)*Empresa.MULTA_PERNOITE;
    const valorBruto=(dias*Empresa.VALOR_DIARIA)+multa;
    return { valorBruto, desconto:0, valorFinal:valorBruto, identificadorDesconto:'nenhum', dias, multa };
  }
  acumularDebito(v){ this.#debito+=v; }
  pagarBoleto(v){ this.#debito-=v; if (this.#debito<=0){ this.#debito=0; this.#inadimplente=false; } }
}
