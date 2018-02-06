import {Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne} from "typeorm";
import {MediaFileEntity} from "./mediafileentity";
import {Survey} from "./survey";

@Entity('marker')
export class Marker {

    @PrimaryGeneratedColumn()
    id: number;

   @ManyToOne(type => Survey, survey => survey.markers, {
        cascadeInsert: true,
        cascadeUpdate: true
    })
    survey: Survey;

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