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
            netRate: ko.observable(0).extend({numeric: 2}),
        };
        this.deleteAccount = this.deleteAccount.bind(this);
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
        var newAccount = new AccountModel(this.newAccount.name(), this.newAccount.netRate());
        this.accounts.push(newAccount);
        store.saveAccount(newAccount);
        var investment = new InvestmentModel(newAccount, 0, 0, 0);
        store.saveInvestment(investment);
        this.investments.push(investment);
        this.newAccount.name('');
        this.newAccount.netRate(0);
    }
    
    dispose() {
        // This runs when the component is torn down. Put here any logic necessary to clean up,
        // for example cancelling setTimeouts or disposing Knockout subscriptions/computeds.
    }
}

export default { viewModel: Accounts, template: templateMarkup };
