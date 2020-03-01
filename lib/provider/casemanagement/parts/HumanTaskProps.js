'use strict';

var entryFactory = require('../../../factory/EntryFactory');
var CmmnElementHelper = require('../../../helper/CmmnElementHelper'), isHumanTask = CmmnElementHelper.isHumanTask;

module.exports = function(group, element) {
  if (isHumanTask(element)) {
    group.entries.push(entryFactory.textField({
      id : 'formKey',
      label : 'Form key',
      modelProperty : 'formKey',
      reference: 'definitionRef'
    }));
    group.entries.push(entryFactory.textField({
      id: 'performerRef',
      label: 'Performer',
      modelProperty: 'performerRef',
      reference: 'definitionRef'
    }));
  }
};