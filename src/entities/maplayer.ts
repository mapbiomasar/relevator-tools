import {Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne} from "typeorm";
import {Map} from "./map";

@Entity('maplayer')
export class MapLayer {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => Map, map => map.layers, {
        cascadeInsert: true,
        cascadeUpdate: true
    })
    map: Map;

    @Column("text")
    name: string;

    @Column("text")
    tipo: string;  // kml, geojson

    @Column("text")
    path: string;

    @Column("int")
    visible: number;

}