// Categorías Principales (Los "Modos" de la App)
export enum MainCategory {
  ESTUDIO = 'Estudio',
  OCIO = 'Ocio',
  EJERCICIO = 'Ejercicio',
  SUENO = 'Sueño',
  GENERAL = 'General'
}

// Subcategorías (Las intenciones dentro de cada modo)
export enum SubCategory {
  // Subcategorías de ESTUDIO
  BANQUEO = 'Banqueo',
  VIDEOS = 'Video',
  APUNTES = 'Apuntes',
  LECTURA = 'Lectura',
  
  // Subcategorías de OCIO (Ejemplo de flexibilidad)
  REDES_SOCIALES = 'Redes Sociales',
  STREAMING = 'Streaming',
  
  // Genérico
  GENERAL = 'General'
}

export interface Segment {
  id: string;
  subCategory: SubCategory;
  startTime: number;
  endTime: number | null;
}

export interface SessionRecord {
  id: string;
  mainCategory: MainCategory;
  startTime: number;
  endTime: number | null;
  duration: number; // segundos totales de la Sesión Madre
  segments: Segment[];
  date: string; // ISO string para agrupamiento y heatmaps
}