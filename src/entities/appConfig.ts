import {Entity, Column, PrimaryGeneratedColumn, ManyToOne} from "typeorm";

@Entity('appconfig')
export class AppConfig {

    @PrimaryGeneratedColumn()
    id: number;

    @Column("int", { nullable: true })
    default_form: number;

}