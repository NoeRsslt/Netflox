export interface Movie {
  id: string;
  title: string;
  year: number | null;
  runtime: number | null;
  overview: string;
  poster: string; // chemin relatif ou URL de l'affiche
  filename: string;
}