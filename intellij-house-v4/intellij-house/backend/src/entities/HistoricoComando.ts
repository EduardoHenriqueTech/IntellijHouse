/**
 * HistoricoComando.ts
 * Cada vez que alguém liga/desliga um dispositivo, guardamos um registro aqui.
 * É a "memória" da casa: o Python estuda esses registros para APRENDER a rotina do morador.
 */
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("historico_comandos")
export class HistoricoComando {
  @PrimaryGeneratedColumn()
  id!: number;

  // Sem chave estrangeira de propósito: apagar um dispositivo não apaga o histórico.
  @Column({ type: "int" })
  dispositivoId!: number;

  @Column({ type: "varchar", length: 60 })
  dispositivoNome!: string;

  @Column({ type: "varchar", length: 30 })
  tipo!: string;

  // "ligar" ou "desligar"
  @Column({ type: "varchar", length: 10 })
  acao!: string;

  // "painel" (botão), "assistente" (chat) ou "simulado" (dados de demonstração)
  @Column({ type: "varchar", length: 20 })
  origem!: string;

  // Minuto do dia no fuso de São Paulo (0 a 1439). Ex.: 23:30 -> 1410
  @Column({ type: "int" })
  minutoDoDia!: number;

  // 0 = domingo ... 6 = sábado
  @Column({ type: "int" })
  diaSemana!: number;

  @Column({ type: "timestamptz" })
  criadoEm!: Date;
}
