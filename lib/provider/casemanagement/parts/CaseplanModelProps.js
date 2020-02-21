'use strict';
let entryFactory = require('../../../factory/EntryFactory');
let ModelUtil = require('cmmn-js/lib/util/ModelUtil'),
	getBusinessObject = ModelUtil.getBusinessObject,
	isCasePlanModel = ModelUtil.isCasePlanModel;
let elementHelper = require('../../../helper/ElementHelper'),
	cmdHelper = require('../../../helper/CmdHelper');
let domClosest = require('min-dom').closest,
	domQuery = require('min-dom').query,
    domify = require('min-dom').domify,
    forEach = require('lodash/forEach');
    
function getSelectBox(node) {
  var currentTab = domClosest(node, 'div.cpp-properties-tab');
  var query = 'select[name=selectedCaseRoleElement]';
  return domQuery(query, currentTab);
}

module.exports = function(group, element, cmmnFactory) {
	let reference = 'definitionRef';
	let getBO = function(element, reference) {
		let bo = getBusinessObject(element, reference);
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
				let value = evt.target.value;
				this.__role = value;
			},
			createElement: function(element, node) {
				this.__action = 'add';
				return { force: true };
			},
			get: function(element, node) {
				let bo = getBO(element, reference);
				let parent = bo.$parent;
				let caseRoles = parent.get('caseRoles');
				if (!caseRoles) {
					return;
				}				
				
				let roles= caseRoles.get('role');
				let selectBox = getSelectBox(node);
				selectBox.options.length = 0;
				forEach(roles, function(elem) {
					let roleValue = elem.get('id');
					selectBox.appendChild(domify("<option value='"+roleValue+"'>"+ roleValue +"</option>"));	
				});				
			},
			set: function(element, values, node) {
				let roleValue = this.__role;
				let action = this.__action;
				let bo = getBO(element, reference);
				let parent = bo.$parent;
				let commands = [];
				let caseRoles = parent.get('caseRoles');
				if (!caseRoles) {
					caseRoles = elementHelper.createElement('cmmn:CaseRoles', { role: [] }, parent, cmmnFactory);
					commands.push(cmdHelper.updateProperties(parent, { caseRoles: caseRoles }, element));					
				}	
				
				let selectBox = getSelectBox(node);
				if (action === 'add') {
					let role = cmmnFactory.create('cmmn:Role', {
						"id": roleValue,
						"name": roleValue
					});
					commands.push(cmdHelper.updateSemanticParent(role, caseRoles, 'role', element));
				}
				
				return commands;
			}
		});
	}
};