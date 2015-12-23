import ko from 'knockout';
import roundTwo from 'app/rounding';
import LocalStorage from 'app/store';

ko.extenders.validate = function (target, validation) {
    target.hasError = target.hasError || ko.observable(false);

    function validate(newValue) {
        target.hasError(validation(newValue));
    }
    validate(ko.unwrap(target));

    target.subscribe(validate);

    return target;
}

class InvestmentModel {
    constructor(account, initial, perMonth, months) {
        var self = this;
        this.account = account;
        this.name = ko.observable(ko.unwrap(account.name));
        this.initial = ko.observable(initial).extend({numeric: 2});
        
        this.perMonth = ko.observable(perMonth).extend({numeric: 2});
        this.months = ko.observable(months).extend({numeric: 0});
        this.totalInvested = ko.computed(function() {
            return this.initial() + (this.perMonth() * this.months());
        }.bind(this));

        var fv = function(rate, nper, pmt, pv, type) {                          
            var pow = Math.pow(1 + rate, nper), fv;                             
            if (rate) {                                                         
                return (pmt*(1+rate*type)*(1-pow)/rate)-pv*pow;                 
            }                                                                   
            return -1 * (pv + pmt * nper);                                      
        };        

        this.futureValue = ko.computed(function() {
            var aerRate = ko.unwrap(account.netRate)/100.0;
            var rate = aerRate/12;
            var futureValue = fv(rate, this.months(), -this.perMonth(), -this.initial(), 1);
            var rounded = roundTwo(futureValue);
            return rounded;
        }.bind(this));

        this.roi = ko.computed(function() {
            return roundTwo(this.futureValue() - this.totalInvested());
        }.bind(this));
        this.roiPc = ko.computed(function() {
            return roundTwo((this.roi()/this.totalInvested())*100);
        }.bind(this));

        this.initial.subscribe(this.save.bind(this));
        this.perMonth.subscribe(this.save.bind(this));
        this.months.subscribe(this.save.bind(this));

        var constraints = account.constraints();
        constraints.map(ko.toJS).forEach(function(constraint) {
            var validation = function(newValue) {
                return (newValue < constraint.minValue) || (newValue > constraint.maxValue);
            };

            if (constraint.field == "Monthly") {
                self.perMonth = self.perMonth.extend({validate: validation});
                return;
            }
            if (constraint.field == "Initial") {
                self.initial = self.initial.extend({validate: validation});
                return;
            }
            if (constraint.field == "Total") {
                self.totalInvested = self.totalInvested.extend({validate: validation});
                return;
            }
        });
    }
    save() {
        var store = new LocalStorage();
        store.saveInvestment(this);
    }
}

export default InvestmentModel;
