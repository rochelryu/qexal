import { DemandeEntity } from '../demande/demande.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  BaseEntity,
  OneToMany,
  UpdateDateColumn,
  OneToOne,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from 'src/users/user.entity';
import { MovieEntity } from './movie.entity';

@Entity()
export class UserMovieEntity extends BaseEntity {
  @PrimaryGeneratedColumn() id: number;

  @Column({ type: 'int' })
  movieid: number;

  @Column({ type: 'int' })
  userid: number;

  @ManyToOne(() => MovieEntity, (movie) => movie.userMovies)
  @JoinColumn({ name: 'movieid' })
  movie: MovieEntity;

  @ManyToOne(() => UserEntity, (user) => user.userMovies)
  @JoinColumn({ name: 'userid' })
  user: UserEntity;

  @CreateDateColumn() create_at: Date;

  @UpdateDateColumn() updated_at: Date;
}
