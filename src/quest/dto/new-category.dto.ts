import { IsNotEmpty } from 'class-validator';

export class NewCategoryDto {
  @IsNotEmpty()
  title: string;
  @IsNotEmpty()
  thumbnail: string;
  @IsNotEmpty()
  desc: string;
  @IsNotEmpty()
  grade: number;

  commentary: string;
}
