
import { Cliente } from './Cliente.js';
import { TARIFAS } from './constants.js';
export class ClienteAvulso extends Cliente {
  constructor(placa){ super(placa.toUpperCase(), 'Avulso-'+placa.toUpperCase()); this.adicionarPlaca(placa); }
  podeEstacionar(){ return { permitido:true }; }
  calcularCustoDaEntrada(ticket, historico, calculadoraDesconto){
    const entrada=new Date(ticket.dataEntrada);
    const saida=new Date(ticket.dataSaida);
    const horas=(saida-entrada)/(1000*60*60);
    let valorBruto=0;
    if (horas<=TARIFAS.AVULSO_LIMITE_HORAS_DIARIA){
      if (entrada.toDateString()===saida.toDateString()) valorBruto=Math.ceil(horas)*TARIFAS.AVULSO_VALOR_HORA;
      else valorBruto=2*TARIFAS.AVULSO_VALOR_DIARIA;
    } else {
      let dias=Math.ceil(horas/24);
      if (entrada.toDateString()!==saida.toDateString() && dias<2) dias=2;
      valorBruto=dias*TARIFAS.AVULSO_VALOR_DIARIA;
    }
    let res={ valorDesconto:0, identificador:'nenhum' };
    if (calculadoraDesconto) res=calculadoraDesconto.aplicarDesconto(ticket,historico,valorBruto);
    return { valorBruto, desconto:res.valorDesconto, valorFinal:valorBruto-res.valorDesconto, identificadorDesconto:res.identificador };
  }
}
