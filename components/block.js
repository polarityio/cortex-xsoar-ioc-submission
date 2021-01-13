polarity.export = PolarityComponent.extend({
  details: Ember.computed.alias('block.data.details'),
  maxUniqueKeyNumber: Ember.computed.alias('details.maxUniqueKeyNumber'),
  url: Ember.computed.alias('details.url'),
  summary: Ember.computed.alias('block.data.summary'),
  incidents: Ember.computed.alias('details.incidents'),
  indicators: Ember.computed.alias('details.indicators'),
  playbooks: Ember.computed.alias('details.playbooks'),
  submissionDetails: '',
  indicatorComment: '',
  severity: 0,
  reputation: 0,
  incidentMessage: '',
  incidentErrorMessage: '',
  incidentPlaybookId: null,
  isRunning: false,
  foundEntities: [],
  newIocs: [],
  newIocsToSubmit: [],
  deleteMessage: '',
  deleteErrorMessage: '',
  deleteIsRunning: false,
  isDeleting: false,
  entityToDelete: {},
  createMessage: '',
  createErrorMessage: '',
  createIsRunning: false,
  interactionDisabled: Ember.computed('isDeleting', 'createIsRunning', function () {
    return this.get('isDeleting') || this.get('createIsRunning');
  }),
  init() {
    this.set(
      'newIocs',
      this.get(`details.notFoundEntities${this.get('maxUniqueKeyNumber')}`)
    );

    this.set(
      'foundEntities',
      this.get(`details.foundEntities${this.get('maxUniqueKeyNumber')}`)
    );

    // TODO Add any other properties here that are either objects or arrays that will be modified in the course of using this integration

    this._super(...arguments);
  },
  observer: Ember.on(
    'willUpdate',
    Ember.observer('details.maxUniqueKeyNumber', function () {
      if (this.get('maxUniqueKeyNumber') !== this.get('_maxUniqueKeyNumber')) {
        this.set('_maxUniqueKeyNumber', this.get('maxUniqueKeyNumber'));

        this.set(
          'newIocs',
          this.get(`details.notFoundEntities${this.get('maxUniqueKeyNumber')}`)
        );

        this.set(
          'foundEntities',
          this.get(`details.foundEntities${this.get('maxUniqueKeyNumber')}`)
        );

        // TODO Add any other properties here that are either objects or arrays that will be modified in the course of using this integration

        this.set('newIocsToSubmit', []);
      }
    })
  ),
  searchIncidentTypes: function (term, resolve, reject) {
    const outerThis = this;
    outerThis.set('createMessage', '');
    outerThis.set('createErrorMessage', '');
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
        outerThis.set('createErrorMessage',
          'Search Incident Types Failed: ' +
            (err &&
              (err.detail || err.err || err.message || err.title || err.description)) ||
            'Unknown Reason'
        );
      })
      .finally(() => {
        outerThis.get('block').notifyPropertyChange('data');
        setTimeout(() => {
          outerThis.set('createMessage', '');
          outerThis.set('createErrorMessage', '');
          outerThis.get('block').notifyPropertyChange('data');
        }, 5000);
        resolve();
      });
  },
  searchIndicatorTypes: function (term, resolve, reject) {
    const outerThis = this;
    outerThis.set('createMessage', '');
    outerThis.set('createErrorMessage', '');
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
        outerThis.set('createErrorMessage',
          'Search Indicator Types Failed: ' +
            (err &&
              (err.detail || err.err || err.message || err.title || err.description)) ||
            'Unknown Reason'
        );
      })
      .finally(() => {
        outerThis.get('block').notifyPropertyChange('data');
        setTimeout(() => {
          outerThis.set('createMessage', '');
          outerThis.set('createErrorMessage', '');
          outerThis.get('block').notifyPropertyChange('data');
        }, 5000);
        resolve();
      });
  },
  actions: {
    // TODO: Add boolean value toggling action functions here
    searchIncidentTypes: function (term) {
      return new Ember.RSVP.Promise((resolve, reject) => {
        Ember.run.debounce(this, this.searchIncidentTypes, term, resolve, reject, 500);
      });
    },
    searchIndicatorTypes: function (term) {
      return new Ember.RSVP.Promise((resolve, reject) => {
        Ember.run.debounce(this, this.searchIndicatorTypes, term, resolve, reject, 500);
      });
    },
    initiateItemDeletion: function (entity) {
      this.set('isDeleting', true);
      this.set('entityToDelete', entity);
    },
    cancelItemDeletion: function () {
      this.set('isDeleting', false);
      this.set('entityToDelete', {});
    },
    confirmDelete: function () {
      const outerThis = this;
      outerThis.set('deleteMessage', '');
      outerThis.set('deleteErrorMessage', '');
      outerThis.set('deleteIsRunning', true);
      outerThis.get('block').notifyPropertyChange('data');

      outerThis
        .sendIntegrationMessage({
          data: {
            action: 'DELETE_ITEM',
            entity: outerThis.get('entityToDelete'),
            newIocs: outerThis.get('newIocs'),
            foundEntities: outerThis.get('foundEntities')
          }
        })
        .then(({ newIocs, newList }) => {
          outerThis.set('newIocs', newIocs);
          outerThis.set('foundEntities', newList);
          outerThis.set('deleteMessage', 'Successfully Deleted IOC');
        })
        .catch((err) => {
          outerThis.set(
            'deleteErrorMessage',
            'Failed to Delete IOC: ' +
              (err &&
                (err.detail || err.err || err.message || err.title || err.description)) ||
              'Unknown Reason'
          );
        })
        .finally(() => {
          this.set('isDeleting', false);
          this.set('entityToDelete', {});
          outerThis.set('deleteIsRunning', false);
          outerThis.get('block').notifyPropertyChange('data');
          setTimeout(() => {
            outerThis.set('deleteMessage', '');
            outerThis.set('deleteErrorMessage', '');
            outerThis.get('block').notifyPropertyChange('data');
          }, 5000);
        });
    },
    removeAllSubmitItems: function () {
      const allIOCs = this.get('newIocs').concat(this.get('newIocsToSubmit'));

      this.set('newIocs', allIOCs);
      this.set('newIocsToSubmit', []);

      this.get('block').notifyPropertyChange('data');
    },
    addAllSubmitItems: function () {
      const allIOCs = this.get('newIocs').concat(this.get('newIocsToSubmit'));

      this.set('newIocs', []);
      this.set('newIocsToSubmit', allIOCs);
      this.get('block').notifyPropertyChange('data');
    },
    removeSubmitItem: function (entity) {
      this.set('newIocs', this.get('newIocs').concat(entity));

      this.set(
        'newIocsToSubmit',
        this.get('newIocsToSubmit').filter(({ value }) => value !== entity.value)
      );

      this.get('block').notifyPropertyChange('data');
    },
    addSubmitItem: function (entity) {
      this.set(
        'newIocs',
        this.get('newIocs').filter(({ value }) => value !== entity.value)
      );
      const updatedNewIocsToSubmit = this.get('newIocsToSubmit').concat(entity);

      this.set('newIocsToSubmit', updatedNewIocsToSubmit);

      this.get('block').notifyPropertyChange('data');
    },
    submitItems: function () {
      const outerThis = this;
      const possibleParamErrors = [
        {
          condition: () => !outerThis.get('newIocsToSubmit').length,
          message: 'No Items to Submit...'
        }
        // TODO: add other initially evaluatable error conditions and messages here
      ];

      const paramErrorMessages = possibleParamErrors.reduce(
        (agg, possibleParamError) =>
          possibleParamError.condition() ? agg.concat(possibleParamError.message) : agg,
        []
      );

      if (paramErrorMessages.length) {
        outerThis.set('createErrorMessage', paramErrorMessages[0]);
        outerThis.get('block').notifyPropertyChange('data');
        setTimeout(() => {
          outerThis.set('createErrorMessage', '');
          outerThis.get('block').notifyPropertyChange('data');
        }, 5000);
        return;
      }

      outerThis.set('createMessage', '');
      outerThis.set('createErrorMessage', '');
      outerThis.set('createIsRunning', true);
      outerThis.get('block').notifyPropertyChange('data');
      outerThis
        .sendIntegrationMessage({
          data: {
            action: 'SUBMIT_ITEMS',
            newIocsToSubmit: outerThis.get('newIocsToSubmit'),
            foundEntities: outerThis.get('foundEntities'),
            summary: this.get('summary'),
            reputation: this.get('reputation'),
            indicatorComment: this.get('indicatorComment'),
            selectedIndicatorType: this.get('selectedIndicatorType')
          }
        })
        .then(({ foundEntities }) => {
          outerThis.set('foundEntities', foundEntities);
          outerThis.set('newIocsToSubmit', []);
          outerThis.set('createMessage', 'Successfully Created IOCs');
        })
        .catch((err) => {
          outerThis.set(
            'createErrorMessage',
            'Failed to Create IOC: ' +
              (err && (err.detail || err.message || err.title || err.description)) ||
              'Unknown Reason'
          );
        })
        .finally(() => {
          outerThis.set('createIsRunning', false);
          outerThis.get('block').notifyPropertyChange('data');
          setTimeout(() => {
            outerThis.set('createMessage', '');
            outerThis.set('createErrorMessage', '');
            outerThis.get('block').notifyPropertyChange('data');
          }, 5000);
        });
    }

    // TODO: Add logic based action functions here
  }
});
