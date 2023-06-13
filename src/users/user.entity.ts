import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

// By convention, we should name the classes as their type, except for the User
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  password: string;
}
