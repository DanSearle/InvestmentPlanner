import ko from 'knockout';

class AccountModel {
    constructor(name, netRate) {
        this.name = ko.observable(name);
        this.netRate = ko.observable(netRate).extend({numeric: 2});
        this.isEnabled = ko.observable(true);
    }
}

export default AccountModel;
