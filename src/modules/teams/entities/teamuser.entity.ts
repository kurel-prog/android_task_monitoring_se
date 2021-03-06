import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { MemberRole } from '../common/enum/teamrole.enum';
import { TeamEntity } from './team.entity';
import { UserEntity } from '../../users/entities/user.entity';

@Entity('TeamUser')
export class TeamUserEntity {
  @PrimaryGeneratedColumn({
    name: 'teamUserId',
  })
  teamUserId: number;

  @Column({
    name: 'MemberRole',
    type: 'enum',
    enum: MemberRole,
    nullable: false,
  })
  memberRole: MemberRole;

  @ManyToOne(() => TeamEntity, (team) => team.teamuser)
  team: TeamEntity;

  @ManyToOne(() => UserEntity, (user) => user.teamuser)
  user: UserEntity;
}
