import ko from 'knockout';
import templateMarkup from 'text!./editable-text.html';

class EditableText {
    constructor(params) {
        this.value = params.text;
        this.editing = ko.observable(false);
        this.notEditing = ko.computed(function() {
            return !this.editing();
        }.bind(this));
    }

    edit() {
        this.editing(true);
    }
    endEdit() {
        this.editing(false);
    }
    
    dispose() {
        // This runs when the component is torn down. Put here any logic necessary to clean up,
        // for example cancelling setTimeouts or disposing Knockout subscriptions/computeds.
    }
}

export default { viewModel: EditableText, template: templateMarkup };
