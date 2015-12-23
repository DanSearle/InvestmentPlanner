import ko from 'knockout';
import LocalStorage from 'app/store';

class AccountModel {
    constructor(name, netRate, id, constraints = [], isEnabled = true) {
        this.id = id;
        this.name = ko.observable(name);
        this.netRate = ko.observable(netRate).extend({numeric: 2});
        this.isEnabled = ko.observable(isEnabled);
        this.isDirty = ko.observable(false);
        this.constraints = ko.observableArray(constraints);

        /*this.name.subscribe(this.dirty.bind(this));
        this.netRate.subscribe(this.dirty.bind(this));
        this.isEnabled.subscribe(this.dirty.bind(this));*/
        this.name.subscribe(this.save.bind(this));
        this.netRate.subscribe(this.save.bind(this));
        this.isEnabled.subscribe(this.save.bind(this));
        this.constraints.subscribe(this.save.bind(this));
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
