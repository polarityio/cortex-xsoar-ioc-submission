module.exports = {
  name: 'Cortex XSOAR IOC Submission',
  acronym: 'CX+',
  description:
    'Polarity integration that connects to the Cortex XSOAR threat intelligence platform using the IOC Submission interface format.',
  entityTypes: ['IPv4', 'IPv6', 'MD5', 'SHA1', 'SHA256', 'domain', 'email'],
  styles: ['./styles/styles.less'],
  block: {
    component: {
      file: './components/block.js'
    },
    template: {
      file: './templates/block.hbs'
    }
  },
  summary: {
    component: {
      file: './components/summary.js'
    },
    template: {
      file: './templates/summary.hbs'
    }
  },
  onDemandOnly: true,
  defaultColor: 'light-purple',
  request: {
    cert: '',
    key: '',
    passphrase: '',
    ca: '',
    proxy: ''
  },
  logging: {
    level: 'info' //trace, debug, info, warn, error, fatal
  },
  options: [
    {
      key: 'url',
      name: 'Cortex XSOAR URL',
      description:
        'The base URL for the Cortex XSOAR API which should include the protocol (i.e., https://)',
      default: '',
      type: 'text',
      userCanEdit: true,
      adminOnly: false
    },
    {
      key: 'apiKey',
      name: 'API Key',
      description:
        'A valid Cortex XSOAR API Key which can be found in your Cortex XSOAR Dashboard Settings',
      default: '',
      type: 'password',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'allowIndicatorDelete',
      name: 'Allow Indicator Deletion',
      description:
        'If checked, users will be able to delete Indicators from Cortex XSOAR. (this setting must be set to `User can view only`).',
      default: false,
      type: 'boolean',
      userCanEdit: false,
      adminOnly: false
    },
    {
      key: 'allowIncidentDelete',
      name: 'Allow Incident Deletion',
      description:
        'If checked, users will be able to delete Incidents from Cortex XSOAR. (this setting must be set to `User can view only`).',
      default: false,
      type: 'boolean',
      userCanEdit: false,
      adminOnly: false
    }
  ]
};
