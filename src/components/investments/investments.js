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

        var self = this;
        this.totalExpectedPrincipleReturn = ko.computed(function() {
            return roundTwo(self.investments().map(function(item) {
                return item.account.expectedRate() * (item.initial()/self.totalInitialInvestment());
            }).reduce(function(one, two) {
                return (one || 0) + two;
            }));
        });
        this.totalExpectedMonthlyReturn = ko.computed(function() {
            return roundTwo(self.investments().map(function(item) {
                return item.account.expectedRate() * (item.perMonth()/self.totalPerMonth());
            }).reduce(function(one, two) {
                return (one || 0) + two;
            }));
        });
        this.totalExpectedTotalReturn = ko.computed(function() {
            return roundTwo(self.investments().map(function(item) {
                return item.account.expectedRate() * (item.totalInvested()/self.totalInvestment());
            }).reduce(function(one, two) {
                return (one || 0) + two;
            }));
        });

        var getInitialRisk = function(risk) {
            return roundTwo((ko.utils.arrayFilter(self.investments(), function(item) {
                return item.account.risk() == risk;
            }).map(function(item) {
                return item.initial()
            }).reduce(function(one, two) {
                return one + two;
            }, 0)));
        };
        var getMonthlyRisk = function(risk) {
            return roundTwo((ko.utils.arrayFilter(self.investments(), function(item) {
                return item.account.risk() == risk;
            }).map(function(item) {
                return item.perMonth()
            }).reduce(function(one, two) {
                return one + two;
            }, 0)));
        };
        var getInitialType= function(type) {
            return roundTwo((ko.utils.arrayFilter(self.investments(), function(item) {
                return item.account.type() == type;
            }).map(function(item) {
                return item.initial()
            }).reduce(function(one, two) {
                return one + two;
            }, 0)));
        };
        var getMonthlyType = function(type) {
            return roundTwo((ko.utils.arrayFilter(self.investments(), function(item) {
                return item.account.type() == type;
            }).map(function(item) {
                return item.perMonth()
            }).reduce(function(one, two) {
                return one + two;
            }, 0)));
        };

        this.riskStats = ko.computed(function() {
            return [1,2,3,4,5,6,7].map(function(item) {
                var initialValue = getInitialRisk(item);
                var monthlyValue = getMonthlyRisk(item);
                return {risk: item,
                        initialPercent: roundTwo((initialValue/self.totalInitialInvestment())* 100),
                        initialValue: initialValue,
                        monthlyPercent: roundTwo((monthlyValue/self.totalPerMonth())* 100),
                        monthlyValue: monthlyValue
                }
            });
        });
        this.typeStats = ko.computed(function() {
            return ["Cash", "Bond", "Stock"].map(function(item) {
                var initialValue = getInitialType(item);
                var monthlyValue = getMonthlyType(item);
                return {type: item,
                        initialPercent: roundTwo((initialValue/self.totalInitialInvestment())*100),
                        initialValue: initialValue,
                        monthlyPercent: roundTwo((monthlyValue/self.totalPerMonth())* 100),
                        monthlyValue: monthlyValue
                        };
            })
                /*{type: "Cash", initialPercent: getInitialTypePercent("Cash"), monthlyPercent: roundTwo((getMonthlyType("Cash")/self.totalPerMonth())*100)},
                {type: "Bond", initialPercent: getInitialTypePercent("Bond"), monthlyPercent: getMonthlyTypePercent("Bond")},
                {type: "Stock", initialPercent: getInitialTypePercent("Stock"), monthlyPercent: getMonthlyTypePercent("Stock")}
            ];*/
        });
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
