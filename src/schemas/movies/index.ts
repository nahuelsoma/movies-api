import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetAllMoviesSchema {
  @ApiProperty()
  @IsInt()
  @Min(1)
  limit: number = 10;

  @ApiProperty()
  @IsInt()
  @Min(0)
  offset: number = 0;
}

export class CreateMovieSchema {
  @ApiProperty()
  @MinLength(2)
  @MaxLength(150)
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @MinLength(15)
  @MaxLength(700)
  @IsNotEmpty()
  opening_crawl: string;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  release_date: string;

  @ApiProperty()
  @IsArray()
  @ArrayMinSize(1)
  @MinLength(2, { each: true })
  @MaxLength(20, { each: true })
  @IsNotEmpty()
  directors_names: string[];

  @ApiProperty()
  @IsArray()
  @ArrayMinSize(1)
  @MinLength(2, { each: true })
  @MaxLength(20, { each: true })
  @IsNotEmpty()
  producers_names: string[];

  @ApiProperty()
  @MinLength(2)
  @MaxLength(20)
  franchise_name: string;
}

export class GetMovieSchema {
  @ApiProperty()
  @IsInt()
  @Min(1)
  id: number;
}

export class UpdateMovieSchema {
  @ApiProperty()
  @IsOptional()
  @MinLength(2)
  @MaxLength(150)
  title?: string;

  @ApiProperty()
  @IsOptional()
  @MinLength(15)
  @MaxLength(700)
  opening_crawl?: string;

  @ApiProperty()
  @IsOptional()
  @IsDateString()
  release_date?: string;

  @ApiProperty()
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @MinLength(2, { each: true })
  @MaxLength(20, { each: true })
  directors_names?: string[];

  @ApiProperty()
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @MinLength(2, { each: true })
  @MaxLength(20, { each: true })
  producers_names?: string[];

  @ApiProperty()
  @IsOptional()
  @MinLength(2)
  @MaxLength(20)
  franchise_name?: string;
}

export class DeleteMovieSchema {
  @ApiProperty()
  @IsInt()
  @Min(1)
  id: number;
}
