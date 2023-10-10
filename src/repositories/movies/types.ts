import { Director, Franchise, Producer } from '@prisma/client';

export interface CreateMovie {
  title: string;
  openingCrawl: string;
  releaseDate: Date;
  directorsNames: string[];
  producersNames: string[];
  franchiseName: string;
}

export interface EditMovie {
  id: number;
  title?: string;
  openingCrawl?: string;
  releaseDate?: Date;
  directorsNames?: string[];
  producersNames?: string[];
  franchiseName?: string;
}

export interface FindAll {
  skip?: number;
  take?: number;
}
export interface Movie {
  id: number;
  title: string;
  opening_crawl: string;
  release_date: Date | string;
  directors: Director[];
  producers: Producer[];
  franchise: Franchise;
}
