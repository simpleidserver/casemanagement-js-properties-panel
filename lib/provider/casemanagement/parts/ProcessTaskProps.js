'use strict';

var ModelUtil = require('cmmn-js/lib/util/ModelUtil'),
    getBusinessObject = ModelUtil.getBusinessObject;
var cmdHelper = require('../../../helper/CmdHelper');
var CmmnElementHelper = require('../../../helper/CmmnElementHelper'), isProcessTask = CmmnElementHelper.isProcessTask;
var domClosest = require('min-dom').closest,
    domQuery = require('min-dom').query,
    domify = require('min-dom').domify,
    forEach = require('lodash/forEach');

function getSelectBox(node) {
  var currentTab = domClosest(node, 'div.cpp-properties-tab');
  var query = 'select[name=selectedMapping]';
  return domQuery(query, currentTab);
}

module.exports = function(group, element, cmmnFactory) {
  var reference = 'definitionRef';
  var getBO = function(element, reference) {
    var bo = getBusinessObject(element, reference);
    return bo;
  };
  if (isProcessTask(element)) {
    group.entries.push({
      id: 'parameterMapping',
      label: 'Parameter mapping',
      modelProperty: 'parameterMapping',
      reference: reference,
      idGeneration: 'false',
      html: '<div class="cpp-row cpp-element-list"> ' +
          '<label>Add parameter</label>'+
          '<div class="cpp-field-wrapper">' +
			'<label>Source reference</label>' +
            '<input type="text" data-on-change="updateSourceReference"/>' +
			'<label>Target reference</label>' +
            '<input type="text" data-on-change="updateTargetReference"/>' +
            '<select id="mappings" ' +
              'name="selectedMapping" ' +
              'size="5" >' +
            '</select>' +
            '<button class="add" data-action="addMapping"><span>+</span></button>'+
          '</div>'+
        '</div>',
      updateSourceReference: function(element, node, evt) {
        var value = evt.target.value;
        this.__sourceReference = value;
      },
      updateTargetReference: function(element, node, evt) {
        var value = evt.target.value;
        this.__targetReference = value;
      },
      addMapping: function(element, node) {
        this.__action = 'add';
        return { force: true };
      },
      get: function(element, node) {
        var bo = getBO(element, reference);
        var definitionRef = bo.definitionRef;
        var parameterMapping = definitionRef.get('parameterMapping');
        if (!parameterMapping) {
          return;
        }
        var selectBox = getSelectBox(node);
        selectBox.options.length = 0;
        forEach(parameterMapping, function(elem) {
          var sourceRef = elem.get('sourceRef');
          var targetRef = elem.get('targetRef');
          selectBox.appendChild(domify('<option>Source = '+ sourceRef + ', Target = ' + targetRef +'</option>'));
        });
      },
      set: function(element, values, node) {
        var sourceReference = this.__sourceReference;
        var targetReference = this.__targetReference;
        var action = this.__action;
        var bo = getBO(element, reference);
        var commands = [];
        if (action === 'add') {
          var parameterMapping = cmmnFactory.create('cmmn:ParameterMapping', {
            'sourceRef': sourceReference,
            'targetRef': targetReference
          });
          commands.push(cmdHelper.updateSemanticParent(parameterMapping, bo.definitionRef, 'parameterMapping', element));
        }
        this.__action = '';
        return commands;
      }
    });
  }
};