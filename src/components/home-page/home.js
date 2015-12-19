import ko from 'knockout';
import homeTemplate from 'text!./home.html';
import InvestmentModel from './investement-model.js';
import AccountModel from './account-model.js';
import roundTwo from 'app/rounding';

class HomeViewModel {
    constructor(route) {
        this.accounts = ko.observableArray([
                new AccountModel("Club Lloyds", 4.0),
                new AccountModel("Easy Saver", 0.05)
        ]);
        this.enabledAccounts = ko.computed(function() {
            return ko.utils.arrayFilter(this.accounts(), function(account) {
                return account.isEnabled();
            })
        }, this);

        this.investments = ko.observableArray([
            new InvestmentModel(this.accounts()[0], 1000.0, 400.0, 12),
            new InvestmentModel(this.accounts()[1], 1000.0, 400.0, 12)
        ]);

        this.enabledInvestments = ko.computed(function() {
            return ko.utils.arrayFilter(this.investments(), function(investment) {
                return investment.account.isEnabled();
            }.bind(this));
        }.bind(this))

        var sum = function(property) {
            var invest = this.enabledInvestments();
            if (invest.length < 2) {
                return property(invest[0]);
            }
            return invest.reduce(function(one, two) {
                return property(one) + property(two);
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
