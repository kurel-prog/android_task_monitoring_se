import { Injectable, BadRequestException } from '@nestjs/common';
import { BaseTaskCreateDto } from '../common/dtos/task.dto';
import { UserRepository } from '../../users/repositories/user.repository';
import { plainToClass } from 'class-transformer';
import {
  PersonalTaskEntity,
  TaskEntity,
  TeamTaskEntity,
} from '../entities/task.entity';
import {
  PersonalTaskRepository,
  TeamTaskRepository,
} from '../repositories/task.repositories';
import { TaskEntityType } from '../common/enum/taskentitytype.enum';
import { TaskResponseDto } from '../common/dtos/task-response.dto';
import { DeleteResult } from 'typeorm';
import { TeamRepository } from '../../teams/repositories/team.repositories';
import { TeamUserRepository } from '../../teams/repositories/team-user.repository';
import { MemberRole } from '../../teams/common/enum/teamrole.enum';

@Injectable()
export class TaskService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly personalTaskRepository: PersonalTaskRepository,
    private readonly teamTaskRepository: TeamTaskRepository,
    private readonly teamRepository: TeamRepository,
    private readonly teamUserRepository: TeamUserRepository,
  ) {}

  // PERSONAL
  async createAPersonalTask(
    username: string,
    baseTaskCreateDto: BaseTaskCreateDto,
  ): Promise<TaskResponseDto> {
    if (baseTaskCreateDto.taskType !== TaskEntityType.Personal) {
      throw new BadRequestException('Invalid Route');
    }
    const userQuery = await this.userRepository.userQueryByUsername(username);
    if (!userQuery) {
      throw new BadRequestException('Not Found User');
    }
    const personalTaskPlain = plainToClass(
      PersonalTaskEntity,
      baseTaskCreateDto,
    );
    const personalTaskCreate =
      this.personalTaskRepository.create(personalTaskPlain);
    personalTaskCreate.user = userQuery;
    this.personalTaskRepository.save(personalTaskCreate);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { user, ...res } = personalTaskCreate;
    return res;
  }

  async getAllPersonalTask(username: string): Promise<TaskEntity[]> {
    const userQuery = await this.userRepository.userQueryByUsername(username);
    const tasksQuery = await this.personalTaskRepository.getAllPersonalTask(
      userQuery,
    );
    return tasksQuery;
  }

  async getAPersonalTask(taskId: number): Promise<TaskEntity> {
    const taskQuery = await this.personalTaskRepository.findOne({
      where: {
        pkTask_Id: taskId,
      },
    });
    return taskQuery;
  }

  async editAPersonalTask(
    taskId: number,
    baseTaskCreateDto: BaseTaskCreateDto,
  ) {
    const taskQuery = await this.personalTaskRepository.findOne({
      where: {
        pkTask_Id: taskId,
      },
    });
    const updateTask = plainToClass(PersonalTaskEntity, baseTaskCreateDto);
    return this.personalTaskRepository.save({
      ...taskQuery,
      ...updateTask,
    });
  }

  async deleteAPersonalTask(taskId: number): Promise<DeleteResult> {
    const taskQueryDel = await this.personalTaskRepository.findOne({
      where: {
        pkTask_Id: taskId,
      },
    });
    return this.personalTaskRepository.delete(taskQueryDel);
  }

  // TEAM
  async createATeamTask(
    teamId: string,
    baseTaskCreateDto: BaseTaskCreateDto,
  ): Promise<TeamTaskEntity> {
    const teamQuery = await this.teamRepository.findOne({
      where: { pkTeam_Id: teamId },
    });
    if (!teamQuery) {
      throw new BadRequestException('Not Found Team');
    }
    const teamTaskPlain = plainToClass(TeamTaskEntity, baseTaskCreateDto);
    teamTaskPlain.team = teamQuery;
    return this.teamTaskRepository.save(teamTaskPlain);
  }

  async getAllTeamTasksByTeamId(teamId: string): Promise<TeamTaskEntity[]> {
    const teamQuery = await this.teamRepository.findOne({
      where: { pkTeam_Id: teamId },
    });
    if (!teamQuery) {
      throw new BadRequestException('Not Found Team');
    }
    return this.teamTaskRepository.find({
      where: {
        team: teamQuery,
      },
    });
  }

  async getATeamTask(teamTaskId: string): Promise<TeamTaskEntity> {
    const teamTask = await this.teamTaskRepository.findOne({
      where: {
        pkTask_Id: teamTaskId,
      },
    });
    if (!teamTask) {
      throw new BadRequestException('Not Found Team Task');
    }
    return teamTask;
  }

  async editATeamTask(
    teamTaskId: string,
    username: string,
    baseTaskCreateDto: BaseTaskCreateDto,
  ): Promise<TeamTaskEntity> {
    const teamTask = await this.teamTaskRepository.findOne({
      where: {
        pkTask_Id: teamTaskId,
      },
    });
    if (!teamTask) {
      throw new BadRequestException('Not Found Team Task');
    }
    const userQuery = await this.userRepository.userQueryByUsername(username);
    if (!userQuery) {
      throw new BadRequestException('Not Found User');
    }
    const userTeam = await this.teamUserRepository.findOne({
      where: {
        user: userQuery,
        team: teamTask.team,
      },
    });
    if (!userTeam) {
      throw new BadRequestException('Not Allow');
    }
    return this.teamTaskRepository.save({
      ...teamTask,
      ...baseTaskCreateDto,
    });
  }

  async deleteATeamTask(
    teamTaskId: string,
    username: string,
  ): Promise<DeleteResult> {
    const teamTask = await this.teamTaskRepository.findOne({
      where: {
        pkTask_Id: teamTaskId,
      },
    });
    if (!teamTask) {
      throw new BadRequestException('Not Found Team Task');
    }
    const userQuery = await this.userRepository.userQueryByUsername(username);
    if (!userQuery) {
      throw new BadRequestException('Not Found User');
    }
    const userTeam = await this.teamUserRepository.findOne({
      where: {
        user: userQuery,
        team: teamTask.team,
      },
    });
    if (!userTeam || userTeam.memberRole !== MemberRole.Admin) {
      throw new BadRequestException('Not Allow');
    }
    return this.teamTaskRepository.delete(teamTask);
  }
}
