export interface StarwarsMovie {
  title: string;
  opening_crawl: string;
  director: string;
  producer: string;
  release_date: string;
}

export interface StarwarsMovies {
  count: number;
  results: StarwarsMovie[];
}
