import ko from 'knockout';
import templateMarkup from 'text!./investments.html';
import InvestmentModel from '../home-page/investement-model.js';
import AccountModel from '../home-page/account-model.js';
import LocalStorage from 'app/store';
import roundTwo from 'app/rounding';
import jsLPSolver from 'jsLPSolver';

class Investments {
    constructor(params) {
        var store = new LocalStorage();
        var investments = store.getInvestments(AccountModel, InvestmentModel)
        this.investments = ko.observableArray(ko.utils.arrayFilter(investments, function(investment) {
            return investment.account.isEnabled();
        }));
        var sum = function(property) {
            var invest = this.investments();
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
        this.optimise();
    }
    
    dispose() {
        // This runs when the component is torn down. Put here any logic necessary to clean up,
        // for example cancelling setTimeouts or disposing Knockout subscriptions/computeds.
    }

    optimise() {
        var results;
        var model = {
            "optimize": "profit",
            "opType": "max",
            "constraints": {
                "wood": {"max": 300},
                "labor": {"max": 110},
                "storage": {"max": 400}
            },
            "variables": {
                "table": {"wood": 30,"labor": 5,"profit": function() {
                    console.log(arguments);
                    return 1200
                },"table": 1, "storage": 30},
                "dresser": {"wood": 20,"labor": 10,"profit": function() {
                    console.log(arguments);
                    return 1600
                },"dresser": 1, "storage": 50}
            },
            "ints": {"table": 1,"dresser": 1}
        }
        console.log(jsLPSolver.Solve(model));
    }
}

export default { viewModel: Investments, template: templateMarkup };
