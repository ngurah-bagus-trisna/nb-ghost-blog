export interface TagMeta {
  slug: string;
  name: string;
  description: string;
  bgImage?: string;
}

export const tagMeta: Record<string, TagMeta> = {
  'daily-notes': {
    slug: 'daily-notes',
    name: 'daily-notes',
    description: 'everyday - consistent',
    bgImage: 'https://photoby.nbtrisna.my.id/b20033d5-91a6-4daf-842c-1ef0007c42f0.jpg',
  },
  'catatan': {
    slug: 'catatan',
    name: 'catatan',
    description: 'test - write',
    bgImage: 'https://photoby.nbtrisna.my.id/5d2de8cf-569e-4274-85ca-77fe1921bea8.jpg',
  },
  'linux': {
    slug: 'linux',
    name: 'linux',
    description: 'Linux tips & troubleshooting',
  },
  'kvm': {
    slug: 'kvm',
    name: 'kvm',
    description: 'Virtualization with KVM',
  },
};

export const pageMeta: Record<string, TagMeta> = {
  'about': {
    slug: 'about',
    name: 'About',
    description: '',
    bgImage: '',
  },
};

export function getTagDescription(tag: string): string {
  return tagMeta[tag]?.description || '';
}

export function getTagBgImage(tag: string): string | undefined {
  return tagMeta[tag]?.bgImage || undefined;
}

export function getPageBgImage(page: string): string | undefined {
  return pageMeta[page]?.bgImage || undefined;
}
