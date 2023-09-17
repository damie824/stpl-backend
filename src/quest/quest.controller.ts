import {
  Body,
  Controller,
  Get,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { QuestService } from './quest.service';
import { NewQuestDto } from './dto/new-quest.dto';
import { JwtAccessAuthGuard } from 'src/guard/jwt-access.guard';

@Controller('quest')
export class QuestController {
  constructor(private readonly questService: QuestService) {}

  @Get('new')
  @UseGuards(JwtAccessAuthGuard)
  async newQuest(@Body(ValidationPipe) NewQuestDto: NewQuestDto) {
    return this.questService.newQuest(NewQuestDto);
  }
}
