import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	CreateDateColumn,
	BaseEntity,
	OneToMany,
	UpdateDateColumn
} from 'typeorm';
import { UserMovieEntity } from 'src/entities/user_movie.entity';

@Entity()
export class MovieEntity extends BaseEntity {
	@PrimaryGeneratedColumn() id: number;

	@Column()
	title: string;

	@Column()
	subtitle: string;

	@Column({length: '255', type: 'varchar'})
	cover: string;

	@Column({ type: 'varchar' })
	linkId: number;

	@OneToMany(() => UserMovieEntity, (userMovie) => userMovie.movieid)
	userMovies: UserMovieEntity[];

	@CreateDateColumn() create_at: Date;

	@UpdateDateColumn() updated_at: Date;
}
