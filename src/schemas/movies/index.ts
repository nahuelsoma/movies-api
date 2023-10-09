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

export class GetAllMoviesSchema {
  @IsInt()
  @Min(1)
  limit: number = 10;

  @IsInt()
  @Min(0)
  offset: number = 0;
}

export class CreateMovieSchema {
  @MinLength(2)
  @MaxLength(150)
  @IsNotEmpty()
  title: string;

  @MinLength(15)
  @MaxLength(700)
  @IsNotEmpty()
  opening_crawl: string;

  @IsDateString()
  @IsNotEmpty()
  release_date: string;

  @IsArray()
  @ArrayMinSize(1)
  @MinLength(2, { each: true })
  @MaxLength(20, { each: true })
  @IsNotEmpty()
  directors_names: string[];

  @IsArray()
  @ArrayMinSize(1)
  @MinLength(2, { each: true })
  @MaxLength(20, { each: true })
  @IsNotEmpty()
  producers_names: string[];

  @MinLength(2)
  @MaxLength(20)
  franchise_name: string;
}

export class GetMovieSchema {
  @IsInt()
  @Min(1)
  id: number;
}

export class UpdateMovieSchema {
  @IsOptional()
  @MinLength(2)
  @MaxLength(150)
  title?: string;

  @IsOptional()
  @MinLength(15)
  @MaxLength(700)
  opening_crawl?: string;

  @IsOptional()
  @IsDateString()
  release_date?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @MinLength(2, { each: true })
  @MaxLength(20, { each: true })
  directors_names?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @MinLength(2, { each: true })
  @MaxLength(20, { each: true })
  producers_names?: string[];

  @IsOptional()
  @MinLength(2)
  @MaxLength(20)
  franchise_name?: string;
}

export class DeleteMovieSchema {
  @IsInt()
  @Min(1)
  id: number;
}
