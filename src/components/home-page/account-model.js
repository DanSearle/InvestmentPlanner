import ko from 'knockout';
import LocalStorage from 'app/store';

class AccountModel {
    constructor(name, expectedRate, id, constraints = [], isEnabled = true, risk = 1, type = "Cash") {
        this.id = id;
        this.name = ko.observable(name);
        this.expectedRate = ko.observable(expectedRate).extend({numeric: 2});
        this.isEnabled = ko.observable(isEnabled);
        this.isDirty = ko.observable(false);
        this.constraints = ko.observableArray(constraints);
        this.risk = ko.observable(risk);
        this.type = ko.observable(type);

        this.name.subscribe(this.save.bind(this));
        this.expectedRate.subscribe(this.save.bind(this));
        this.isEnabled.subscribe(this.save.bind(this));
        this.constraints.subscribe(this.save.bind(this));
        this.risk.subscribe(this.save.bind(this));
        this.type.subscribe(this.save.bind(this));
    }

    dirty() {
        this.isDirty(true);
    }

    save() {
        var store = new LocalStorage();
        store.saveAccount(this);
        this.isDirty(false);
    }
    deleteAccount() {
        var store = new LocalStorage();
        store.deleteAccount(this);
    }
}

export default AccountModel;
