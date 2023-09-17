import { IsNotEmpty } from 'class-validator';
import { QuestStatus, QuestType } from '../quest.enum';

export class NewQuestDto {
  title: string;
  type: QuestType;
  status: QuestStatus;
  thumbnail: string;
  difficulty: number;
  hashtag: string[];
  contents: string;
  categoryId: number;
  answer: string;

  createdAt: Date;
  commentary: string;
}
