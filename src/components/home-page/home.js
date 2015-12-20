import ko from 'knockout';
import homeTemplate from 'text!./home.html';
import InvestmentModel from './investement-model.js';
import { AccountModel, LocalStorage } from './account-model.js';
import roundTwo from 'app/rounding';


class HomeViewModel {
    constructor(route) {
        var store = new LocalStorage();
        this.accounts = ko.observableArray(store.getAccounts(AccountModel));
        this.enabledAccounts = ko.computed(function() {
            return ko.utils.arrayFilter(this.accounts(), function(account) {
                return account.isEnabled();
            })
        }, this);

        var localInvestements = new Map();
        this.accounts().forEach(function(account) {
            var investment = store.getInvestment(account, InvestmentModel);
            localInvestements.set(account, investment);
        });

        this.investments = ko.computed(function() {
            return this.enabledAccounts().map(function(account) {
                var investment = localInvestements.get(account);
                if (investment) {
                    return investment;
                }
                var investment = new InvestmentModel(account, 0, 0, 0);
                localInvestements[account] = investment;
                return investment;
            });
        }, this);

        this.enabledInvestments = ko.computed(function() {
            return ko.utils.arrayFilter(this.investments(), function(investment) {
                return investment.account.isEnabled();
            }.bind(this));
        }.bind(this))

        var sum = function(property) {
            var invest = this.enabledInvestments();
            if (invest.length == 0) {
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
    }
}

export default { viewModel: HomeViewModel, template: homeTemplate };
