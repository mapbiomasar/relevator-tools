import {Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne} from "typeorm";
import {Map} from "./map";
import {Marker} from "./marker";

@Entity('survey')
export class Survey {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => Map, map => map.surveys, {
        cascadeInsert: true,
        cascadeUpdate: true
    })
    map: Map;

    @Column("text")
    name: string;

    @Column("text")
    description: string;

    @Column("text")
    author_name: string;

    @Column("int")
    creation_date: number;

    @OneToMany(type => Marker, marker => marker.survey, {
        cascadeInsert: true,
        cascadeUpdate: true
    })
    markers: Marker[];

}