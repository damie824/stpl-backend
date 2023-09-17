import {
  ArgumentMetadata,
  BadRequestException,
  PipeTransform,
} from '@nestjs/common';
import { QuestStatus } from '../quest.enum';

export class QuestStatusValidationPipe implements PipeTransform {
  readonly StatusOptions = [
    QuestStatus.PRIVATE,
    QuestStatus.PENDING,
    QuestStatus.PUBLIC,
  ];

  transform(value: any, metadata: ArgumentMetadata) {
    if (!this.validateQuest(value)) {
      throw new BadRequestException(`Status can't be ${value}`);
    }
  }

  private validateQuest(status: any) {
    const StatusIndex = this.StatusOptions.indexOf(status);

    return StatusIndex !== -1;
  }
}
