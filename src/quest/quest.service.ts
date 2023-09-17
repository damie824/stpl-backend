import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { NewQuestDto } from './dto/new-quest.dto';
import { QuestStatus, QuestType } from './quest.enum';
import { QuestStatusValidationPipe } from './pipes/quest-status-validation.pipe';

@Injectable()
export class QuestService {
  private logger = new Logger('Quest');

  constructor(private readonly PrismaService: PrismaService) {}

  async newQuest(newQuestDto: NewQuestDto) {
    const statusOptions = [
      QuestStatus.PRIVATE,
      QuestStatus.PENDING,
      QuestStatus.PUBLIC,
    ];
    const typeOptions = [QuestType.MULTIPLE, QuestType.SHORT];

    if (statusOptions.indexOf(newQuestDto.status) === -1) {
      throw new BadRequestException(`Status can't be ${newQuestDto.status}`);
    }
    if (typeOptions.indexOf(newQuestDto.type) === -1) {
      throw new BadRequestException(`Status can't be ${newQuestDto.type}`);
    }

    const date = new Date();

    const created = date;
    newQuestDto.createdAt = created;

    try {
      const quest = await this.PrismaService.quest.create({
        data: newQuestDto,
      });

      this.logger.verbose(`Generated new quest : ${quest.title}`);

      return quest;
    } catch (e) {
      this.logger.warn(e.message);
      throw new InternalServerErrorException(e.message);
    }
  }
}
