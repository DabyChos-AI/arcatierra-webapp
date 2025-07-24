export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  thumbnail: string;
  stock: number;
  environmentalImpact?: {
    waterSaved?: number; // Litros de agua ahorrados
    co2Saved?: number;   // kg de CO2 ahorrados
    soilHealth?: number; // % de mejora en salud del suelo
  };
  traceability?: ProductTraceability;
  seo?: ProductSEO;
}

export interface ProductTraceability {
  origin?: string;
  farmer?: string;
  region?: string;
  practices?: string;
  harvestDate?: string;
  certifications?: string;
  story?: string;
  impact?: string;
}

export interface ProductSEO {
  title?: string;
  description?: string;
  keywords?: string;
  imageAlt?: string;
  url?: string;
  structuredData?: string;
}
