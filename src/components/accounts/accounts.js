import ko from 'knockout';
import templateMarkup from 'text!./accounts.html';
import LocalStorage from 'app/store';
import AccountModel from '../home-page/account-model.js';

class Accounts {
    constructor(params) {
        var store = new LocalStorage();
        this.accounts = ko.observableArray(store.getAccounts(AccountModel));
        this.newAccount = {
            name: ko.observable(),
            expectedRate: ko.observable(0).extend({numeric: 2}),
            risk: ko.observable(),
            type: ko.observable()
        };
        this.deleteAccount = this.deleteAccount.bind(this);
        this.risks = ko.observableArray([1,2,3,4,5,6,7]);
        this.types = ko.observableArray(["Cash", "Bond", "Stock"]);
    }

    deleteAccount(account) {
        var store = new LocalStorage();
        store.deleteAccount(account);
        this.accounts.remove(account);
        this.investments.remove(ko.utils.arrayFirst(this.investments(), function(investment) {
            return investment.account == account;
        }));
    }

    addAccount() {
        var store = new LocalStorage();
        var newAccount = new AccountModel(this.newAccount.name(), this.newAccount.expectedRate(), null, [], true, this.newAccount.risk(), this.newAccount.type());
        this.accounts.push(newAccount);
        store.saveAccount(newAccount);
        var investment = new InvestmentModel(newAccount, 0, 0, 0);
        store.saveInvestment(investment);
        this.investments.push(investment);
        this.newAccount.name('');
        this.newAccount.expectedRate(0);
    }
    
    dispose() {
        // This runs when the component is torn down. Put here any logic necessary to clean up,
        // for example cancelling setTimeouts or disposing Knockout subscriptions/computeds.
    }
}

export default { viewModel: Accounts, template: templateMarkup };
