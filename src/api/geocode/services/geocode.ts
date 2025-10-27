import geohash from 'ngeohash';
import { LRUCache } from 'lru-cache';

// Strapi v5 custom service can be a default function returning an object with methods.
// No content-type required here.
const cache = new LRUCache<string, any>({ max: 5000, ttl: 1000 * 60 * 60 }); // 1 hour TTL

type Point = { lat: number; lng: number };

export default ({ strapi }: { strapi: any }) => ({
  async batchReverse(points: Point[]) {
    // Normalize and dedupe by geohash precision=6
    const normalized = points
      .map((p) => ({ ...p, key: geohash.encode(p.lat, p.lng, 6) }))
      .filter((v, i, a) => a.findIndex((x) => x.key === v.key) === i);

    const results: Record<string, any> = {};
    const misses: Array<{ key: string; lat: number; lng: number }> = [];

    for (const p of normalized) {
      const hit = cache.get(p.key);
      if (hit) results[p.key] = hit;
      else misses.push(p);
    }

    // Pace upstream calls gently
    for (const m of misses) {
      const data = await reverseGeocodeProviderCall(m.lat, m.lng);
      results[m.key] = data;
      cache.set(m.key, data);
      await new Promise((r) => setTimeout(r, 100));
    }

    // Map back to input order
    return points.map((p) => {
      const key = geohash.encode(p.lat, p.lng, 6);
      return { lat: p.lat, lng: p.lng, result: results[key] || null };
    });
  },
});

async function reverseGeocodeProviderCall(lat: number, lng: number) {
  // Replace with your provider. Using OpenCage as example.
  const key = process.env.GEOCODE_API_KEY;
  if (!key) {
    return { error: 'Missing GEOCODE_API_KEY', region: null, locality: null, providerMeta: null };
  }

  try {
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${key}&no_annotations=1&language=en`;
    const res = await fetch(url);
    if (!res.ok) {
      return { error: `Upstream ${res.status}`, region: null, locality: null, providerMeta: null };
    }
    const json = await res.json();
    const comp = json?.results?.[0]?.components || {};
    return {
      region: comp.state || comp.region || null,
      locality: comp.town || comp.city || comp.village || comp.municipality || null,
      providerMeta: { confidence: json?.results?.[0]?.confidence ?? null },
    };
  } catch (e) {
    return { error: 'Upstream error', region: null, locality: null, providerMeta: null };
  }
}
