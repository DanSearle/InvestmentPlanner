import ko from 'knockout';
import homeTemplate from 'text!./home.html';
import InvestmentModel from './investement-model.js';
import AccountModel from './account-model.js';
import roundTwo from 'app/rounding';
import LocalStorage from 'app/store';


class HomeViewModel {
    constructor(route) {
        var store = new LocalStorage();

        this.newAccount = {
            name: ko.observable(),
            netRate: ko.observable(0).extend({numeric: 2}),
        };
        var accountsAndInvestments = ko.observableArray(store.getAccountsAndInvestments(AccountModel, InvestmentModel));
        this.accounts = ko.observableArray([]);
        this.investments = ko.observableArray([]);
        accountsAndInvestments().forEach(function(accountAndInvestment) {
            this.accounts.push(accountAndInvestment.account);
            this.investments.push(accountAndInvestment.investment);
        }.bind(this));
        this.enabledAccounts = ko.computed(function() {
            return ko.utils.arrayFilter(this.accounts(), function(account) {
                return account.isEnabled();
            })
        }, this);

        this.enabledInvestments = ko.computed(function() {
            return ko.utils.arrayFilter(this.investments(), function(investment) {
                return investment.account.isEnabled();
            }.bind(this));
        }.bind(this))

        var sum = function(property) {
            var invest = this.enabledInvestments();
            if (invest == undefined || invest.length == 0) {
                return 0;
            }
            if (invest.length < 2) {
                return property(invest[0]);
            }
            return invest.map(property).reduce(function(one, two) {
                return one + two;
            });
        }.bind(this);

        this.totalInitialInvestment = ko.computed(function() {
            return sum(function(i) {
                return i.initial();
            });
        }.bind(this))
        this.totalPerMonth = ko.computed(function() {
            return sum(function(i) {
                return i.perMonth();
            });
        }.bind(this))

        this.totalInvestment = ko.computed(function() {
            return sum(function(i) {
                return i.totalInvested();
            });
        }.bind(this))
        this.totalFutureValue = ko.computed(function() {
            return sum(function(i) {
                return i.futureValue();
            });
        }.bind(this))

        this.totalRoi = ko.computed(function() {
            return roundTwo(this.totalFutureValue() - this.totalInvestment());
        }.bind(this));
        this.totalRoiPc = ko.computed(function() {
            return roundTwo((this.totalRoi()/this.totalInvestment())*100);
        }.bind(this));

        this.deleteAccount = this.deleteAccount.bind(this);
    }


}

export default { viewModel: HomeViewModel, template: homeTemplate };
