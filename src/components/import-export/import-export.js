import ko from 'knockout';
import importExportTemplate from 'text!./import-export.html';

class ImportExportViewModel {
    constructor(route) {
        var self = this;
        /*this.storage = ko.computed(function() {
            return JSON.stringify(localStorage);
        })*/
        this.storage = ko.forcibleComputed(function() {
            return JSON.stringify(localStorage);
        })
        this.importData = ko.observable();
        this.runImport = function() {
            var data = JSON.parse(this.importData());
            for(var key in localStorage) {
                delete localStorage[key];
            }
            for (var key in data) {
              localStorage[key] = data[key];
            }
            self.storage.evaluateImmediate();
        };
    }


}

export default { viewModel: ImportExportViewModel, template: importExportTemplate };
