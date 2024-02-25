import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ unique: true, type: 'varchar' })
	username: string;

	@Column({ type: 'varchar' })
	passwordHash: string;

	@Column({ type: 'varchar' })
	firstName: string;

	@Column({ type: 'varchar' })
	lastName: string;
}
