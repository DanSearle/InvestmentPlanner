import ko from 'knockout';
import templateMarkup from 'text!./constraints.html';

class Constraints {
    constructor(params) {
        var self = this;
        this.constraints = params.constraints;
        this.fields = ko.observableArray(["Initial", "Monthly", "Total"]);
        this.allowedFields = ko.computed(function() {
            var usedFields = self.constraints().map(function(constraint) {
                return constraint.field();
            });
            return ko.utils.arrayFilter(self.fields(), function(item) {
                return usedFields.indexOf(item) < 0;
            });
        });
        this.selected = ko.observable();
        this.minValue = ko.observable(0).extend({numeric: 2});
        this.maxValue = ko.observable(0).extend({numeric: 2});
        this.field = ko.observable('');
        this.canAdd = ko.computed(function() {
            return self.allowedFields().length > 0;
        });

        this.addConstraint = this.addConstraint.bind(this);
        this.deleteConstraint = this.deleteConstraint.bind(this);
    }

    addConstraint() {
        this.constraints.push({
            field: ko.observable(this.field()),
            minValue: ko.observable(this.minValue()),
            maxValue: ko.observable(this.maxValue()),
        })
    }
    deleteConstraint(constraint) {
        this.constraints.remove(constraint);
    }
    
    dispose() {
        // This runs when the component is torn down. Put here any logic necessary to clean up,
        // for example cancelling setTimeouts or disposing Knockout subscriptions/computeds.
    }
}

export default { viewModel: Constraints, template: templateMarkup };
