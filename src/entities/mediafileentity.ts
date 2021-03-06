import {Entity, Column, PrimaryGeneratedColumn, ManyToOne} from "typeorm";
import {Marker} from "./marker";

@Entity('mediafile')
export class MediaFileEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => Marker, marker => marker.mediaFiles, {
        cascadeInsert: true,
        cascadeUpdate: true,
        cascadeRemove: true,
        eager: true
    })
    marker: Marker;

    @Column("text")
    tipo: string;

    @Column("text")
    path: string;

}