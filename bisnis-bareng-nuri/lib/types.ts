export interface Photo {
  src: string;
  alt: string;
  caption?: string;
  focalPoint?: { x: number; y: number };
}
export interface Settings {
  siteName: string;
  tagline: string;
  whatsappNumber: string;
  whatsappProductMessage: string;
  whatsappBusinessMessage: string;
  instagramUrl: string;
  oriflameStoreUrl: string;
  affiliateDisclosure: string;
  themePreset: "editorial" | "rose";
  seoDescription: string;
}
export interface Profile {
  name: string;
  headline: string;
  shortBio: string;
  fullBio: string;
  portrait: Photo;
  aboutImage: Photo;
}
export interface Block {
  _type: string;
  _key?: string;
  style?: string;
  children?: { _type: string; text: string; marks?: string[] }[];
  image?: Photo;
  caption?: string;
}
export interface Story {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: Photo;
  body: Block[];
  displayDate?: string;
  category: string;
  featured: boolean;
  visible: boolean;
  sortOrder: number;
}
export interface Product {
  id: string;
  name: string;
  category: string;
  image: Photo;
  recommendationNote: string;
  destinationUrl: string;
  affiliate: boolean;
  featured: boolean;
  visible: boolean;
  sortOrder: number;
  productCode?: string;
  displayPrice?: string;
}
export interface Achievement {
  id: string;
  title: string;
  year?: string;
  description: string;
  visible: boolean;
  sortOrder: number;
}
export interface GalleryItem {
  id: string;
  image: Photo;
  caption: string;
  category: string;
  visible: boolean;
  sortOrder: number;
}
export interface Catalogue {
  title: string;
  periodLabel: string;
  coverImage: Photo;
  catalogueUrl: string;
  active: boolean;
}
export type SectionType =
  | "hero"
  | "about"
  | "journey"
  | "gallery"
  | "oriflame"
  | "recommendations"
  | "contact";
export interface Section {
  id: string;
  type: SectionType;
  enabled: boolean;
  title?: string;
  description?: string;
  layout: "default" | "compact";
  selectedIds?: string[];
}
export interface SiteContent {
  publicationId: string;
  demo: boolean;
  settings: Settings;
  profile: Profile;
  stories: Story[];
  achievements: Achievement[];
  gallery: GalleryItem[];
  oriflame: Product[];
  recommendations: Product[];
  catalogue: Catalogue;
  sections: Section[];
}
