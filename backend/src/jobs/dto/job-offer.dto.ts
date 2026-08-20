import { IsOptional, IsString, MinLength } from 'class-validator';

export class JobOfferDto {
  @IsString()
  @MinLength(1)
  id!: string;

  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  company!: string | null;

  @IsOptional()
  @IsString()
  location!: string | null;

  @IsString()
  description!: string;

  @IsString()
  url!: string;

  @IsOptional()
  salaryMin!: number | null;

  @IsOptional()
  salaryMax!: number | null;

  @IsString()
  createdAt!: string;
}
