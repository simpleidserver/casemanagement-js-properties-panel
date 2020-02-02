'use strict';

var TestHelper = require('../../../TestHelper');

var TestContainer = require('mocha-test-container-support');

/* global bootstrapModeler, inject */

var propertiesPanelModule = require('lib'),
    domQuery = require('min-dom').query,
    coreModule = require('cmmn-js/lib/core'),
    selectionModule = require('diagram-js/lib/features/selection').default,
    modelingModule = require('cmmn-js/lib/features/modeling'),
    propertiesProviderModule = require('lib/provider/casemanagement'),
    caseModdlePackage = require('casemanagement-cmmn-moddle/resources/casemanagement');


function getInput(container, selector) {
  return domQuery('input[name=' + selector + ']', container);
}


describe('human-task-properties', function() {

  var diagramXML = require('./HumanTask.cmmn');

  var testModules = [
    coreModule, selectionModule, modelingModule,
    propertiesPanelModule,
    propertiesProviderModule
  ];

  var container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });

  beforeEach(bootstrapModeler(diagramXML, {
    modules: testModules,
    moddleExtensions: { camunda: caseModdlePackage }
  }));


  beforeEach(inject(function(commandStack, propertiesPanel) {

    var undoButton = document.createElement('button');
    undoButton.textContent = 'UNDO';

    undoButton.addEventListener('click', function() {
      commandStack.undo();
    });

    container.appendChild(undoButton);

    propertiesPanel.attachTo(container);
  }));


  describe('get', function() {

    var bo;

    beforeEach(inject(function(elementRegistry, selection) {

      // given
      var item = elementRegistry.get('PlanItem_WITH_PROPERTIES');
      selection.select(item);

      bo = item.businessObject.definitionRef;

    }));


    it('should fetch the formKey of a human task definition', inject(function(propertiesPanel) {

      var field = getInput(propertiesPanel._container, 'formKey');

      // when selecting element

      // then
      expect(field.value).to.equal(bo.get('formKey'));

    }));

  });


  describe('set', function() {

    describe('# formKey', function() {

      var bo, field;

      beforeEach(inject(function(elementRegistry, selection, propertiesPanel) {

        // given
        var item = elementRegistry.get('PlanItem_WITH_PROPERTIES');
        selection.select(item);

        bo = item.businessObject.definitionRef;

        field = getInput(propertiesPanel._container, 'formKey');

        // when
        TestHelper.triggerValue(field, 'foo.html', 'change');

      }));


      describe('in the DOM', function() {

        it('should execute', function() {
          expect(field.value).to.equal('foo.html');
        });

        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(field.value).to.equal('someForm.html');
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(field.value).to.equal('foo.html');
        }));

      });

      describe('on the business object', function() {

        it('should execute', function() {
          expect(bo.get('formKey')).to.equal('foo.html');
        });

        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(bo.get('formKey')).to.equal('someForm.html');
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(bo.get('formKey')).to.equal('foo.html');
        }));

      });

    });
  });


  describe('remove', function() {

    describe('should remove the formKey for a human task definition', function() {

      var bo, field;

      beforeEach(inject(function(elementRegistry, selection, propertiesPanel) {

        // given
        var item = elementRegistry.get('PlanItem_WITH_PROPERTIES');
        selection.select(item);

        bo = item.businessObject.definitionRef;

        field = getInput(propertiesPanel._container, 'formKey');

        // when
        TestHelper.triggerValue(field, '', 'change');

      }));


      describe('in the DOM', function() {

        it('should execute', function() {
          expect(field.value).is.empty;
        });

        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(field.value).to.equal('someForm.html');
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(field.value).is.empty;
        }));

      });

      describe('on the business object', function() {

        it('should execute', function() {
          expect(bo.get('formKey')).to.be.undefined;
        });

        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(bo.get('formKey')).to.equal('someForm.html');
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(bo.get('formKey')).to.be.undefined;
        }));

      });

    });
  });


});