import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, IsString, MinLength } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({ example: 'My first post', minLength: 3 })
  @IsString()
  @MinLength(3)
  title: string;

  @ApiProperty({ example: 'This is the full post content.', minLength: 10 })
  @IsString()
  @MinLength(10)
  content: string;

  @ApiProperty({ example: 4, description: 'ReqRes user ID of the author.' })
  @IsInt()
  @IsPositive()
  authorUserId: number;
}
