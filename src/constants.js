const IGNORED_IPS = new Set(['127.0.0.1', '255.255.255.255', '0.0.0.0']);

const RELEVANT_INDICATOR_SEARCH_RESULT_KEYS = [
  'id',
  'type',
  'name',
  'reason',
  'created',
  'severity',
  'labels',
  'details',
  'owner',
  'category',
  'pbHistory'
];

const PLAYBOOK_SEARCH_TERMS = {
  ip: 'ip address',
  hash: 'file hash',
  domain: 'domain',
  email: 'email'
};

const HUMAN_READABLE_SEVERITY_LEVELS = {
  0: 'Unknown',
  0.5: 'Informational',
  1: 'Low',
  2: 'Medium',
  3: 'High',
  4: 'Critical'
};

const INDICATOR_TYPE_DEFAULTS = {
  ip: 'IP',
  domain: 'Domain',
  email: 'Email',
  md5: 'File MD5',
  sha1: 'File SHA-1',
  sha256: 'File SHA-256',
  otherHash: 'File'
};

const ENTITY_DISPLAY_TYPES = {
  domain: 'domain',
  IPv4: 'ip',
  IPv6: 'ip',
  email: 'email',
  MD5: 'md5',
  SHA1: 'sha1',
  SHA256: 'sha256',
  hash: 'hash'
};

module.exports = {
  IGNORED_IPS,
  ENTITY_DISPLAY_TYPES,
  RELEVANT_INDICATOR_SEARCH_RESULT_KEYS,
  PLAYBOOK_SEARCH_TERMS,
  HUMAN_READABLE_SEVERITY_LEVELS,
  INDICATOR_TYPE_DEFAULTS,
};
