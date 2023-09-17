import { IsNotEmpty } from 'class-validator';
import { QuestStatus, QuestType } from '../quest.enum';

export class NewQuestDto {
  @IsNotEmpty()
  title: string;
  @IsNotEmpty()
  type: QuestType;
  @IsNotEmpty()
  status: QuestStatus;
  @IsNotEmpty()
  thumbnail: string;
  @IsNotEmpty()
  difficulty: number;
  @IsNotEmpty()
  hashtag: string[];
  @IsNotEmpty()
  contents: string;
  @IsNotEmpty()
  categoryId: number;
  @IsNotEmpty()
  answer: string;

  createdAt: Date;
  commentary: string;
}
