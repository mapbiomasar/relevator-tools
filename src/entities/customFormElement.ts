import {Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne} from "typeorm";
import {CustomForm} from "./customForm";

@Entity('customFormElement')
export class CustomFormElement {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => CustomForm, customForm => customForm.form_elements, {
        cascadeInsert: true,
        cascadeUpdate: true
    })
    form: CustomForm;
    
    @Column("text")
    name: string;
    
    @Column("text")
    label: string;

    @Column("text")
    tipo: string;  // input, select


    @Column("text")
    options: string;

}