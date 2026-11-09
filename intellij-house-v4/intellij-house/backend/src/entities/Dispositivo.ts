/**
 * Dispositivo.ts
 * ENTIDADE do TypeORM: uma classe que representa uma TABELA do banco.
 *
 *  - @Entity("dispositivos")      -> a classe vira a tabela "dispositivos"
 *  - @PrimaryGeneratedColumn()    -> coluna "id" (chave primária, numeração automática)
 *  - @Column(...)                 -> cada atributo vira uma coluna da tabela
 *
 * Cada objeto desta classe é uma LINHA da tabela (um dispositivo da casa).
 */
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("dispositivos")
export class Dispositivo {
  @PrimaryGeneratedColumn()
  id!: number;

  // Nome para exibir ao usuário. Ex.: "Luz da sala"
  @Column({ type: "varchar", length: 60 })
  nome!: string;

  // Tipo padronizado (o mesmo nome que o Python devolve): luz, ventilador, ar_condicionado, tv
  @Column({ type: "varchar", length: 30 })
  tipo!: string;

  // Ambiente padronizado (o mesmo nome que o Python devolve): sala, quarto, cozinha...
  @Column({ type: "varchar", length: 30 })
  ambiente!: string;

  // Estado atual: true = ligado, false = desligado
  @Column({ type: "boolean", default: false })
  ligado!: boolean;
}
