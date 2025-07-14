export type LyricsflipModelName = 'Round' | 'RoundPlayer' | 'RoundsCount';

/**
 * Resolve a model from a Dojo entity regardless of whether the project is using
 * the old "flattened" key (e.g. `lyricsflip-Round`) or the modern namespaced
 * structure (e.g. `models.lyricsflip.Round`).
 *
 * Returns `undefined` if the model does not exist.
 */
export function getModel<T = any>(entity: any, name: LyricsflipModelName): T | undefined {
  if (!entity?.models) return undefined;

  // 1️⃣ legacy flat key created by older versions of the indexer
  const flat = entity.models[`lyricsflip-${name}`];
  if (flat) return flat as T;

  // 2️⃣ current namespaced structure introduced in Dojo ≥ 0.4
  return entity.models.lyricsflip?.[name] as T | undefined;
}

/**
 * Write or mutate a model on an entity using the *nested* structure. This keeps
 * optimistic-updates consistent with what Torii will write later.
 */
export function ensureNestedModel<T = any>(
  entity: any,
  name: LyricsflipModelName,
  factory: () => T
): T {
  if (!entity.models) entity.models = {};
  if (!entity.models.lyricsflip) entity.models.lyricsflip = {};

  if (!entity.models.lyricsflip[name]) {
    entity.models.lyricsflip[name] = factory();
  }
  return entity.models.lyricsflip[name] as T;
} 