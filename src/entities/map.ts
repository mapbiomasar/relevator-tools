import {Entity, Column, PrimaryGeneratedColumn, OneToMany} from "typeorm";
import {Survey} from "./survey";

@Entity('map')
export class Map {

    @PrimaryGeneratedColumn()
    id: number;

    @Column("int")
    user: number;

    @Column("text")
    name: string;

    @Column("text")
    description: string;

    @Column("int")
    creation_date: number;

    @Column("text")
    config:string;

    @OneToMany(type => Survey, survey => survey.map)
    surveys: Survey[];
}