interface Movie {
  title: string;
  opening_crawl: string;
  director: string;
  producer: string;
  release_date: string;
}

interface Movies {
  count: number;
  results: Movie[];
}
