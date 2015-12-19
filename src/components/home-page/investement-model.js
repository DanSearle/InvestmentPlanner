import ko from 'knockout';
import roundTwo from 'app/rounding';

class InvestmentModel {
    constructor(account, initial, perMonth, months) {
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
    }
}

export default InvestmentModel;
