import {Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne} from "typeorm";
import {Survey} from "./survey";
import {CustomFormElement} from "./customFormElement";

@Entity('customForm')
export class CustomForm {

    @PrimaryGeneratedColumn()
    id: number;

    @Column("text")
    name: string;


    @ManyToOne(type => CustomForm, customform => customform.child_forms, {
        cascadeInsert: true,
        cascadeUpdate: true
    })
    parent_form: CustomForm;

    @OneToMany(type => CustomForm, customform => customform.parent_form, {
        cascadeInsert: true,
        cascadeUpdate: true
    })
    child_forms: CustomForm[];

    @OneToMany(type => CustomFormElement, customformelement => customformelement.form, {
        cascadeInsert: true,
        cascadeUpdate: true
    })
    form_elements: CustomFormElement[];
}