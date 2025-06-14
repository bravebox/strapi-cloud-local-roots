/**
 * TypeScript definition for user_meta structure
 */

export interface UserMeta {
  app: {
    locale: string;
    skipOnboarding: boolean;
    lastLogin: string;
    lastUpdate: string;
  };
  favorites: {
    ingredients: string[];
    recipes: string[];
    local_heroes: string[];
  };
}
