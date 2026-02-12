export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
  description?: string;
  image?: string;
}

export interface Destination {
  id: string;
  name: string;
  image: string;
  description: string;
  listingCount: number;
  popularActivities: string[];
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  author: {
    name: string;
    avatar?: string;
  };
  publishedAt: string;
  readTime: string;
  category: string;
}
