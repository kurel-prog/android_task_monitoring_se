import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { TeamService } from '../services/team.service';
import { TeamDto, TeamNameDto, TeamMemberRole } from '../common/dtos/team.dto';
import { TeamMember } from '../common/dtos/teammember.dto';

@Controller('team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Get('user/:username')
  getTeamsByUsername(@Param('username') username: string) {
    return this.teamService.getTeamsByUsername(username);
  }

  @Get(':team_Id')
  getTeamInformation(@Param('team_Id') team_Id: string) {
    return this.teamService.getTeamInformation(team_Id);
  }

  @Post('/')
  createATeam(@Body() teamDto: TeamDto) {
    // This route creates a team with the username (in DTO) is the Admin (MemberRole)
    return this.teamService.createATeam(teamDto);
  }

  @Post(':team_Id')
  addMember(@Body() teamMember: TeamMember, @Param('team_Id') team_Id: string) {
    return this.teamService.addMember(teamMember, team_Id);
  }

  @Put(':team_Id')
  reName(@Body() teamNameDto: TeamNameDto, @Param('team_Id') team_Id: string) {
    return this.teamService.reName(teamNameDto, team_Id);
  }

  @Put(':team_Id/:username')
  changeMemberRole(
    @Body() teamMemberRole: TeamMemberRole,
    @Param('team_Id') team_Id: string,
    @Param('username') username: string,
  ) {
    return this.teamService.changeMemberRole(teamMemberRole, team_Id, username);
  }

  @Delete(':team_Id/:username/duser/:delusername')
  deleteMember(
    @Param('team_Id') team_Id: string,
    @Param('username') username: string,
    @Param('delusername') delusername: string,
  ) {
    return this.teamService.deleteMember(team_Id, username, delusername);
  }

  @Delete(':teamId/out/:username')
  outTeam(
    @Param('teamId') teamId: string,
    @Param('username') username: string,
  ) {
    return this.teamService.outTeam(teamId, username);
  }
}
