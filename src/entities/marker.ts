import {Entity, Column, PrimaryGeneratedColumn, OneToMany} from "typeorm";
import {MediaFileEntity} from "./mediafileentity";

@Entity('marker')
export class Marker {

    @PrimaryGeneratedColumn()
    id: number;

    @Column("int")
    id_survey: number;

    @Column("int")
    creation_date: number;

    @Column("int")
    lat: number;

    @Column("int")
    lng: number;

    @Column("text")
    attributes: string;


    @OneToMany(type => MediaFileEntity, mediafileentity =>  mediafileentity.marker, {
        cascadeInsert: true,
        cascadeUpdate: true
    })
    mediaFiles: MediaFileEntity[];
}