import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { JobOfferDto } from './job-offer.dto';

export class MatchJobsDto {
  @IsString()
  @MinLength(10)
  profile!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => JobOfferDto)
  jobs!: JobOfferDto[];
}
