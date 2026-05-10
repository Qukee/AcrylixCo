import opentype, { type Font } from 'opentype.js';

const cache = new Map<string, Promise<Font>>();

export async function loadFont(url: string): Promise<Font> {
  let p = cache.get(url);
  if (!p) {
    p = fetch(url)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Failed to load font ${url}: ${res.status} ${res.statusText}`);
        }
        const buf = await res.arrayBuffer();
        return opentype.parse(buf);
      })
      .catch((e) => {
        cache.delete(url);
        throw e;
      });
    cache.set(url, p);
  }
  return p;
}
