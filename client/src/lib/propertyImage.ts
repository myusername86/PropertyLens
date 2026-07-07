/**
 * Placeholder property photos (Unsplash CDN, free-license stock).
 * Each deal is deterministically mapped to one image via a hash of its id,
 * so a deal keeps the same photo across renders and sessions.
 * A real deployment would replace this with tenant-uploaded photos
 * stored in Azure Blob Storage.
 */

const HOUSE_PHOTOS = [
  'photo-1568605114967-8130f3a36994',
  'photo-1570129477492-45c003edd2be',
  'photo-1564013799919-ab600027ffc6',
  'photo-1512917774080-9991f1c4c750',
  'photo-1600596542815-ffad4c1539a9',
  'photo-1600585154340-be6161a56a0c',
  'photo-1580587771525-78b9dba3b914',
  'photo-1583608205776-bfd35f0d9f83',
] as const;

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function propertyImageUrl(dealId: string, width = 640): string {
  const photo = HOUSE_PHOTOS[hashString(dealId) % HOUSE_PHOTOS.length];
  return `https://images.unsplash.com/${photo}?auto=format&fit=crop&w=${width}&q=60`;
}
