import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class SearchJobsDto {
  @IsString()
  @MinLength(2)
  what!: string;

  @IsOptional()
  @IsString()
  where?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;
}
