'use strict';
var ModelUtil = require('cmmn-js/lib/util/ModelUtil'),
    getBusinessObject = ModelUtil.getBusinessObject,
    isCasePlanModel = ModelUtil.isCasePlanModel;
var elementHelper = require('../../../helper/ElementHelper'),
    cmdHelper = require('../../../helper/CmdHelper');
var domClosest = require('min-dom').closest,
    domQuery = require('min-dom').query,
    domify = require('min-dom').domify,
    forEach = require('lodash/forEach');
function getSelectBox(node) {
  var currentTab = domClosest(node, 'div.cpp-properties-tab');
  var query = 'select[name=selectedCaseRoleElement]';
  return domQuery(query, currentTab);
}

module.exports = function(group, element, cmmnFactory) {
  var reference = 'definitionRef';
  var getBO = function(element, reference) {
    var bo = getBusinessObject(element, reference);
    return bo;
  };
  if (isCasePlanModel(element)) {
    group.entries.push({
      id: 'caseRoles',
      label: 'Roles',
      modelProperty: 'id',
      reference: reference,
      idGeneration: 'false',
      html: '<div class="cpp-row cpp-element-list"> ' +
          '<label>Add role</label>'+
          '<div class="cpp-field-wrapper">' +
            '<input type="text" data-on-change="updateContent"/>'+
            '<select id="cam-caseRoles" ' +
              'name="selectedCaseRoleElement" ' +
              'size="5" '+
              'data-on-change="selectElement">' +
            '</select>' +
            '<button class="add" data-action="createElement"><span>+</span></button>'+
          '</div>'+
        '</div>',
      updateContent: function(element, node, evt) {
        var value = evt.target.value;
        this.__role = value;
      },
      createElement: function(element, node) {
        this.__action = 'add';
        return { force: true };
      },
      get: function(element, node) {
        var bo = getBO(element, reference);
        var parent = bo.$parent;
        var caseRoles = parent.get('caseRoles');
        if (!caseRoles) {
          return;
        }
        var roles= caseRoles.get('role');
        var selectBox = getSelectBox(node);
        selectBox.options.length = 0;
        forEach(roles, function(elem) {
          var roleValue = elem.get('id');
          selectBox.appendChild(domify('<option value="'+roleValue+'">'+ roleValue +'</option>'));
        });
      },
      set: function(element, values, node) {
        var roleValue = this.__role;
        var action = this.__action;
        var bo = getBO(element, reference);
        var parent = bo.$parent;
        var commands = [];
        var caseRoles = parent.get('caseRoles');
        if (!caseRoles) {
          caseRoles = elementHelper.createElement('cmmn:CaseRoles', { role: [] }, parent, cmmnFactory);
          commands.push(cmdHelper.updateProperties(parent, { caseRoles: caseRoles }, element));
        }
        if (action === 'add') {
          var role = cmmnFactory.create('cmmn:Role', {
            'id': roleValue,
            'name': roleValue
          });
          commands.push(cmdHelper.updateSemanticParent(role, caseRoles, 'role', element));
        }
        return commands;
      }
    });
  }
};