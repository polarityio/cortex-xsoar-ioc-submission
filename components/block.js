polarity.export = PolarityComponent.extend({
  details: Ember.computed.alias('block.data.details'),
  maxUniqueKeyNumber: Ember.computed.alias('details.maxUniqueKeyNumber'),
  url: Ember.computed.alias('details.url'),
  incidents: Ember.computed.alias('details.incidents'),
  indicators: Ember.computed.alias('details.indicators'),
  playbooks: Ember.computed.alias('details.playbooks'),
  activeTab: 'incidents',
  indicatorComment: '',
  reputation: 0,
  submissionDetails: '',
  severity: 0,

  incidentMessage: '',
  incidentErrorMessage: '',
  incidentPlaybookId: null,
  foundIncidentEntities: [],
  newIncidentIocs: [],
  newIncidentIocsToSubmit: [],
  incidentDeleteMessage: '',
  incidentDeleteErrorMessage: '',
  incidentDeleteIsRunning: false,
  incidentIsDeleting: false,
  incidentToDelete: {},
  createIncidentMessage: '',
  createIncidentErrorMessage: '',
  createIncidentsIsRunning: false,

  incidentMessage: '',
  incidentErrorMessage: '',
  foundIndicatorEntities: [],
  newIndicatorIocs: [],
  newIndicatorIocsToSubmit: [],
  indicatorDeleteMessage: '',
  indicatorDeleteErrorMessage: '',
  indicatorDeleteIsRunning: false,
  indicatorIsDeleting: false,
  indicatorToDelete: {},
  createIndicatorMessage: '',
  createIndicatorErrorMessage: '',
  createIndicatorsIsRunning: false,
  interactionDisabled: Ember.computed(
    'indicatorIsDeleting',
    'createIndicatorsIsRunning',
    'incidentIsDeleting',
    'createIncidentsIsRunning',
    function () {
      return (
        this.get('incidentIsDeleting') ||
        this.get('createIncidentsIsRunning') ||
        this.get('indicatorIsDeleting') ||
        this.get('createIndicatorsIsRunning')
      );
    }
  ),
  init() {
    this.set(
      'newIndicatorIocs',
      this.get(`details.notFoundIndicatorEntities${this.get('maxUniqueKeyNumber')}`)
    );

    this.set(
      'foundIndicatorEntities',
      this.get(`details.foundIndicatorEntities${this.get('maxUniqueKeyNumber')}`)
    );

    this.set(
      'newIncidentIocs',
      this.get(`details.notFoundIncidentEntities${this.get('maxUniqueKeyNumber')}`)
    );

    this.set(
      'foundIncidentEntities',
      this.get(`details.foundIncidentEntities${this.get('maxUniqueKeyNumber')}`)
    );

    this.set('playbooks', this.get(`details.playbooks${this.get('maxUniqueKeyNumber')}`));

    this._super(...arguments);
  },
  observer: Ember.on(
    'willUpdate',
    Ember.observer('details.maxUniqueKeyNumber', function () {
      if (this.get('maxUniqueKeyNumber') !== this.get('_maxUniqueKeyNumber')) {
        this.set('_maxUniqueKeyNumber', this.get('maxUniqueKeyNumber'));

        this.set(
          'newIndicatorIocs',
          this.get(`details.notFoundIndicatorEntities${this.get('maxUniqueKeyNumber')}`)
        );

        this.set(
          'foundIndicatorEntities',
          this.get(`details.foundIndicatorEntities${this.get('maxUniqueKeyNumber')}`)
        );

        this.set('newIndicatorIocsToSubmit', []);

        this.set(
          'newIncidentIocs',
          this.get(`details.notFoundIncidentEntities${this.get('maxUniqueKeyNumber')}`)
        );

        this.set(
          'foundIncidentEntities',
          this.get(`details.foundIncidentEntities${this.get('maxUniqueKeyNumber')}`)
        );
        
        this.set(
          'playbooks',
          this.get(`details.playbooks${this.get('maxUniqueKeyNumber')}`)
        );

        this.set('newIncidentIocsToSubmit', []);
      }
    })
  ),
  searchIncidentTypes: function (term, resolve, reject) {
    const outerThis = this;
    outerThis.set('createIncidentMessage', '');
    outerThis.set('createIncidentErrorMessage', '');
    outerThis.get('block').notifyPropertyChange('data');

    outerThis
      .sendIntegrationMessage({
        data: {
          action: 'SEARCH_INCIDENT_TYPES',
          selectedIncidentType: outerThis.get('selectedIncidentType'),
          term
        }
      })
      .then(({ types }) => {
        outerThis.set('foundIncidentTypes', types);
      })
      .catch((err) => {
        outerThis.set(
          'createIncidentErrorMessage',
          'Search Incident Types Failed: ' +
            (err &&
              (err.detail || err.err || err.message || err.title || err.description)) ||
            'Unknown Reason'
        );
      })
      .finally(() => {
        outerThis.get('block').notifyPropertyChange('data');
        setTimeout(() => {
          outerThis.set('createIncidentMessage', '');
          outerThis.set('createIncidentErrorMessage', '');
          outerThis.get('block').notifyPropertyChange('data');
        }, 5000);
        resolve();
      });
  },
  searchIndicatorTypes: function (term, resolve, reject) {
    const outerThis = this;
    outerThis.set('createIndicatorMessage', '');
    outerThis.set('createIndicatorErrorMessage', '');
    outerThis.get('block').notifyPropertyChange('data');

    outerThis
      .sendIntegrationMessage({
        data: {
          action: 'SEARCH_INDICATOR_TYPES',
          selectedIndicatorType: outerThis.get('selectedIndicatorType'),
          term
        }
      })
      .then(({ types }) => {
        outerThis.set('foundIndicatorTypes', types);
      })
      .catch((err) => {
        outerThis.set(
          'createIndicatorErrorMessage',
          'Search Indicator Types Failed: ' +
            (err &&
              (err.detail || err.err || err.message || err.title || err.description)) ||
            'Unknown Reason'
        );
      })
      .finally(() => {
        outerThis.get('block').notifyPropertyChange('data');
        setTimeout(() => {
          outerThis.set('createIndicatorMessage', '');
          outerThis.set('createIndicatorErrorMessage', '');
          outerThis.get('block').notifyPropertyChange('data');
        }, 5000);
        resolve();
      });
  },
  actions: {
    changeTab: function (tabName) {
      this.set('activeTab', tabName);
    },

    // Incident Actions
    searchIncidentTypes: function (term) {
      return new Ember.RSVP.Promise((resolve, reject) => {
        Ember.run.debounce(this, this.searchIncidentTypes, term, resolve, reject, 500);
      });
    },
    initiateIncidentDeletion: function (entity) {
      this.set('incidentIsDeleting', true);
      this.set('incidentToDelete', entity);
    },
    cancelIncidentDeletion: function () {
      this.set('incidentIsDeleting', false);
      this.set('incidentToDelete', {});
    },
    confirmIncidentDelete: function () {
      const outerThis = this;
      outerThis.set('incidentDeleteMessage', '');
      outerThis.set('incidentDeleteErrorMessage', '');
      outerThis.set('incidentDeleteIsRunning', true);
      outerThis.get('block').notifyPropertyChange('data');

      outerThis
        .sendIntegrationMessage({
          data: {
            action: 'DELETE_INCIDENT',
            entity: outerThis.get('incidentToDelete'),
            newIncidentIocs: outerThis.get('newIncidentIocs'),
            foundIncidentEntities: outerThis.get('foundIncidentEntities')
          }
        })
        .then(({ newIncidentIocs, newList, playbooks }) => {
          outerThis.set('newIncidentIocs', newIncidentIocs);
          outerThis.set('foundIncidentEntities', newList);
          outerThis.set('playbooks', playbooks);
          outerThis.set('incidentDeleteMessage', 'Successfully Deleted Incident');
        })
        .catch((err) => {
          outerThis.set(
            'incidentDeleteErrorMessage',
            'Failed to Delete IOC: ' +
              (err &&
                (err.detail || err.err || err.message || err.title || err.description)) ||
              'Unknown Reason'
          );
        })
        .finally(() => {
          this.set('incidentIsDeleting', false);
          this.set('incidentToDelete', {});
          outerThis.set('incidentDeleteIsRunning', false);
          outerThis.get('block').notifyPropertyChange('data');
          setTimeout(() => {
            outerThis.set('incidentDeleteMessage', '');
            outerThis.set('incidentDeleteErrorMessage', '');
            outerThis.get('block').notifyPropertyChange('data');
          }, 5000);
        });
    },
    removeAllSubmitIncidents: function () {
      const allIOCs = this.get('newIncidentIocs').concat(
        this.get('newIncidentIocsToSubmit')
      );

      this.set('newIncidentIocs', allIOCs);
      this.set('newIncidentIocsToSubmit', []);

      this.get('block').notifyPropertyChange('data');
    },
    addAllSubmitIncidents: function () {
      const allIOCs = this.get('newIncidentIocs').concat(
        this.get('newIncidentIocsToSubmit')
      );

      this.set('newIncidentIocs', []);
      this.set('newIncidentIocsToSubmit', allIOCs);
      this.get('block').notifyPropertyChange('data');
    },
    removeSubmitIncident: function (entity) {
      this.set('newIncidentIocs', this.get('newIncidentIocs').concat(entity));

      this.set(
        'newIncidentIocsToSubmit',
        this.get('newIncidentIocsToSubmit').filter(({ value }) => value !== entity.value)
      );

      this.get('block').notifyPropertyChange('data');
    },
    addSubmitIncident: function (entity) {
      this.set(
        'newIncidentIocs',
        this.get('newIncidentIocs').filter(({ value }) => value !== entity.value)
      );
      const updatedNewIncidentIocsToSubmit = this.get('newIncidentIocsToSubmit').concat(
        entity
      );

      this.set('newIncidentIocsToSubmit', updatedNewIncidentIocsToSubmit);

      this.get('block').notifyPropertyChange('data');
    },
    submitIncidents: function () {
      const outerThis = this;
      const possibleParamErrors = [
        {
          condition: () => !outerThis.get('newIncidentIocsToSubmit').length,
          message: 'No Items to Submit...'
        },
        {
          condition: () => !outerThis.get('selectedIncidentType'),
          message: 'Incident Type Required'
        }
      ];

      const paramErrorMessages = possibleParamErrors.reduce(
        (agg, possibleParamError) =>
          possibleParamError.condition() ? agg.concat(possibleParamError.message) : agg,
        []
      );

      if (paramErrorMessages.length) {
        outerThis.set('createIncidentErrorMessage', paramErrorMessages[0]);
        outerThis.get('block').notifyPropertyChange('data');
        setTimeout(() => {
          outerThis.set('createIncidentErrorMessage', '');
          outerThis.get('block').notifyPropertyChange('data');
        }, 5000);
        return;
      }

      outerThis.set('createIncidentMessage', '');
      outerThis.set('createIncidentErrorMessage', '');
      outerThis.set('createIncidentsIsRunning', true);
      outerThis.get('block').notifyPropertyChange('data');
      outerThis
        .sendIntegrationMessage({
          data: {
            action: 'SUBMIT_INCIDENTS',
            newIncidentIocsToSubmit: outerThis.get('newIncidentIocsToSubmit'),
            foundIncidentEntities: outerThis.get('foundIncidentEntities'),
            newIncidentIocs: outerThis.get('newIncidentIocs'),
            submissionDetails: this.get('submissionDetails'),
            selectedIncidentType: this.get('selectedIncidentType'),
            severity: this.get('severity'),
            newIncidentPlaybookId: this.get('newIncidentPlaybookId')
          }
        })
        .then(({ foundIncidentEntities, playbooks }) => {
          outerThis.set('foundIncidentEntities', foundIncidentEntities);
          outerThis.set('playbooks', playbooks);
          outerThis.set('newIncidentIocsToSubmit', []);
          outerThis.set('createIncidentMessage', 'Successfully Created IOCs');
        })
        .catch((err) => {
          outerThis.set(
            'createIncidentErrorMessage',
            'Failed to Create IOC: ' +
              (err && (err.detail || err.message || err.title || err.description)) ||
              'Unknown Reason'
          );
        })
        .finally(() => {
          outerThis.set('createIncidentsIsRunning', false);
          outerThis.get('block').notifyPropertyChange('data');
          setTimeout(() => {
            outerThis.set('createIncidentMessage', '');
            outerThis.set('createIncidentErrorMessage', '');
            outerThis.get('block').notifyPropertyChange('data');
          }, 5000);
        });
    },

    // Indicator Actions
    searchIndicatorTypes: function (term) {
      return new Ember.RSVP.Promise((resolve, reject) => {
        Ember.run.debounce(this, this.searchIndicatorTypes, term, resolve, reject, 500);
      });
    },
    initiateIndicatorDeletion: function (entity) {
      this.set('indicatorIsDeleting', true);
      this.set('indicatorToDelete', entity);
    },
    cancelIndicatorDeletion: function () {
      this.set('indicatorIsDeleting', false);
      this.set('indicatorToDelete', {});
    },
    confirmIndicatorDelete: function () {
      const outerThis = this;
      outerThis.set('indicatorDeleteMessage', '');
      outerThis.set('indicatorDeleteErrorMessage', '');
      outerThis.set('indicatorDeleteIsRunning', true);
      outerThis.get('block').notifyPropertyChange('data');

      outerThis
        .sendIntegrationMessage({
          data: {
            action: 'DELETE_INDICATOR',
            entity: outerThis.get('indicatorToDelete'),
            newIndicatorIocs: outerThis.get('newIndicatorIocs'),
            foundIndicatorEntities: outerThis.get('foundIndicatorEntities')
          }
        })
        .then(({ newIndicatorIocs, newList }) => {
          outerThis.set('newIndicatorIocs', newIndicatorIocs);
          outerThis.set('foundIndicatorEntities', newList);
          outerThis.set('indicatorDeleteMessage', 'Successfully Deleted Indicator');
        })
        .catch((err) => {
          outerThis.set(
            'indicatorDeleteErrorMessage',
            'Failed to Delete IOC: ' +
              (err &&
                (err.detail || err.err || err.message || err.title || err.description)) ||
              'Unknown Reason'
          );
        })
        .finally(() => {
          this.set('indicatorIsDeleting', false);
          this.set('indicatorToDelete', {});
          outerThis.set('indicatorDeleteIsRunning', false);
          outerThis.get('block').notifyPropertyChange('data');
          setTimeout(() => {
            outerThis.set('indicatorDeleteMessage', '');
            outerThis.set('indicatorDeleteErrorMessage', '');
            outerThis.get('block').notifyPropertyChange('data');
          }, 5000);
        });
    },
    removeAllSubmitIndicators: function () {
      const allIOCs = this.get('newIndicatorIocs').concat(
        this.get('newIndicatorIocsToSubmit')
      );

      this.set('newIndicatorIocs', allIOCs);
      this.set('newIndicatorIocsToSubmit', []);

      this.get('block').notifyPropertyChange('data');
    },
    addAllSubmitIndicators: function () {
      const allIOCs = this.get('newIndicatorIocs').concat(
        this.get('newIndicatorIocsToSubmit')
      );

      this.set('newIndicatorIocs', []);
      this.set('newIndicatorIocsToSubmit', allIOCs);
      this.get('block').notifyPropertyChange('data');
    },
    removeSubmitIndicator: function (entity) {
      this.set('newIndicatorIocs', this.get('newIndicatorIocs').concat(entity));

      this.set(
        'newIndicatorIocsToSubmit',
        this.get('newIndicatorIocsToSubmit').filter(({ value }) => value !== entity.value)
      );

      this.get('block').notifyPropertyChange('data');
    },
    addSubmitIndicator: function (entity) {
      this.set(
        'newIndicatorIocs',
        this.get('newIndicatorIocs').filter(({ value }) => value !== entity.value)
      );
      const updatedNewIndicatorIocsToSubmit = this.get('newIndicatorIocsToSubmit').concat(
        entity
      );

      this.set('newIndicatorIocsToSubmit', updatedNewIndicatorIocsToSubmit);

      this.get('block').notifyPropertyChange('data');
    },
    submitIndicators: function () {
      const outerThis = this;
      const possibleParamErrors = [
        {
          condition: () => !outerThis.get('newIndicatorIocsToSubmit').length,
          message: 'No Items to Submit...'
        },
        {
          condition: () => !outerThis.get('selectedIndicatorType'),
          message: 'Indicator Type Required'
        }
      ];

      const paramErrorMessages = possibleParamErrors.reduce(
        (agg, possibleParamError) =>
          possibleParamError.condition() ? agg.concat(possibleParamError.message) : agg,
        []
      );

      if (paramErrorMessages.length) {
        outerThis.set('createIndicatorErrorMessage', paramErrorMessages[0]);
        outerThis.get('block').notifyPropertyChange('data');
        setTimeout(() => {
          outerThis.set('createIndicatorErrorMessage', '');
          outerThis.get('block').notifyPropertyChange('data');
        }, 5000);
        return;
      }

      outerThis.set('createIndicatorMessage', '');
      outerThis.set('createIndicatorErrorMessage', '');
      outerThis.set('createIndicatorsIsRunning', true);
      outerThis.get('block').notifyPropertyChange('data');
      outerThis
        .sendIntegrationMessage({
          data: {
            action: 'SUBMIT_INDICATORS',
            newIndicatorIocsToSubmit: outerThis.get('newIndicatorIocsToSubmit'),
            foundIndicatorEntities: outerThis.get('foundIndicatorEntities'),
            reputation: this.get('reputation'),
            indicatorComment: this.get('indicatorComment'),
            selectedIndicatorType: this.get('selectedIndicatorType')
          }
        })
        .then(({ foundIndicatorEntities }) => {
          outerThis.set('foundIndicatorEntities', foundIndicatorEntities);
          outerThis.set('newIndicatorIocsToSubmit', []);
          outerThis.set('createIndicatorMessage', 'Successfully Created IOCs');
        })
        .catch((err) => {
          outerThis.set(
            'createIndicatorErrorMessage',
            'Failed to Create IOC: ' +
              (err && (err.detail || err.message || err.title || err.description)) ||
              'Unknown Reason'
          );
        })
        .finally(() => {
          outerThis.set('createIndicatorsIsRunning', false);
          outerThis.get('block').notifyPropertyChange('data');
          setTimeout(() => {
            outerThis.set('createIndicatorMessage', '');
            outerThis.set('createIndicatorErrorMessage', '');
            outerThis.get('block').notifyPropertyChange('data');
          }, 5000);
        });
    }
  }
});
