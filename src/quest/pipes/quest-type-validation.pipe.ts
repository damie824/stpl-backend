import {
  ArgumentMetadata,
  BadRequestException,
  PipeTransform,
} from '@nestjs/common';
import { QuestType } from '../quest.enum';

export class QuestTypeValidationPipe implements PipeTransform {
  readonly TypeOptions = [QuestType.MULTIPLE, QuestType.SHORT];

  transform(value: any, metadata: ArgumentMetadata) {
    if (!this.validateQuest(value)) {
      throw new BadRequestException(`Type can't be ${value}`);
    }
  }

  private validateQuest(questType: any) {
    const TypeIndex = this.TypeOptions.indexOf(questType);

    return TypeIndex !== -1;
  }
}
