export interface TagMeta {
  slug: string;
  name: string;
  description: string;
}

export const tagMeta: Record<string, TagMeta> = {
  'daily-notes': {
    slug: 'daily-notes',
    name: 'daily-notes',
    description: 'everyday - consistent',
  },
  'catatan': {
    slug: 'catatan',
    name: 'catatan',
    description: 'test - write',
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
  'about': {
    slug: 'about',
    name: 'about',
    description: '',
  },
};

export function getTagDescription(tag: string): string {
  return tagMeta[tag]?.description || '';
}

export function getTagName(tag: string): string {
  return tagMeta[tag]?.name || tag;
}
