import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

export interface HomepageSectionVisibility {
  hero: boolean;
  flashDeals: boolean;
  specialOffers: boolean;
  trendingListings: boolean;
  browseCategories: boolean;
  featuredDestinations: boolean;
  popularServices: boolean;
  seasonalPackages: boolean;
  testimonials: boolean;
  blogPreview: boolean;
  faq: boolean;
  newsletter: boolean;
}

export interface HomepageConfig {
  heroTitle: string;
  heroSubtitle: string;
  sectionVisibility: HomepageSectionVisibility;
  updatedAt: string;
  updatedBy: string | null;
}

const defaultConfig: HomepageConfig = {
  heroTitle: 'Discover Bangladesh With Verified Travel Packages',
  heroSubtitle:
    'Compare real offers, filter instantly, and book with confidence through trusted sellers.',
  sectionVisibility: {
    hero: true,
    flashDeals: true,
    specialOffers: true,
    trendingListings: true,
    browseCategories: true,
    featuredDestinations: true,
    popularServices: true,
    seasonalPackages: true,
    testimonials: true,
    blogPreview: true,
    faq: true,
    newsletter: true,
  },
  updatedAt: new Date().toISOString(),
  updatedBy: null,
};

function getHomepageConfigPath(): string {
  const candidates = [
    path.resolve(process.cwd(), 'apps/server/homepage-config.json'),
    path.resolve(process.cwd(), 'homepage-config.json'),
  ];

  const existing = candidates.find((candidate) => existsSync(candidate));
  return existing || candidates[0];
}

async function ensureConfigFileExists(configPath: string): Promise<void> {
  if (existsSync(configPath)) {
    return;
  }

  await mkdir(path.dirname(configPath), { recursive: true });
  await writeFile(configPath, JSON.stringify(defaultConfig, null, 2), 'utf-8');
}

function mergeConfig(
  current: HomepageConfig,
  updates: Partial<Omit<HomepageConfig, 'updatedAt' | 'updatedBy'>>,
  updatedBy: string | null
): HomepageConfig {
  return {
    ...current,
    ...updates,
    sectionVisibility: {
      ...current.sectionVisibility,
      ...(updates.sectionVisibility || {}),
    },
    updatedAt: new Date().toISOString(),
    updatedBy,
  };
}

export async function getHomepageConfig(): Promise<HomepageConfig> {
  const configPath = getHomepageConfigPath();
  await ensureConfigFileExists(configPath);

  try {
    const raw = await readFile(configPath, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<HomepageConfig>;

    return {
      ...defaultConfig,
      ...parsed,
      sectionVisibility: {
        ...defaultConfig.sectionVisibility,
        ...(parsed.sectionVisibility || {}),
      },
      updatedAt: parsed.updatedAt || defaultConfig.updatedAt,
      updatedBy: parsed.updatedBy ?? null,
    };
  } catch (error) {
    console.error('Failed to read homepage config, using defaults:', error);
    return defaultConfig;
  }
}

export async function updateHomepageConfig(
  updates: Partial<Omit<HomepageConfig, 'updatedAt' | 'updatedBy'>>,
  updatedBy: string | null
): Promise<HomepageConfig> {
  const configPath = getHomepageConfigPath();
  const current = await getHomepageConfig();
  const merged = mergeConfig(current, updates, updatedBy);

  await mkdir(path.dirname(configPath), { recursive: true });
  await writeFile(configPath, JSON.stringify(merged, null, 2), 'utf-8');

  return merged;
}
