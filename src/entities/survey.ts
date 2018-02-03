import {Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne} from "typeorm";
import {Map} from "./map";

@Entity('survey')
export class Survey {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => Map, map => map.surveys, {
      cascadeInsert: true
    })
    map: Map;

    @Column("text")
    name: string;

    @Column("text")
    description: string;

    @Column("int")
    creation_date: number;
}