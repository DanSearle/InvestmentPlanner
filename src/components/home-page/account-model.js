import ko from 'knockout';
function guid() {
      function s4() {
              return Math.floor((1 + Math.random()) * 0x10000)
                        .toString(16)
                              .substring(1);
                }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                s4() + '-' + s4() + s4() + s4();
}
export class LocalStorage {
    getAccountKeys() {
        return JSON.parse(localStorage.getItem("accounts")) || [];
    }
    saveAccountKey(key) {
        var accountKeys = this.getAccountKeys();
        if (accountKeys.indexOf(key) != -1) {
            return;
        }
        accountKeys.push(key);
        localStorage.setItem("accounts", JSON.stringify(accountKeys))
    }
    saveAccount(account) {
        var key;
        if (!account.id) {
            do 
            {
                account.id = guid();
                key = "account-" + account.id;
            } while (localStorage.getItem(key) != null)
        }
        if (!key) {
            key = "account-" + account.id;
        }

        var jsonData = ko.toJSON(account);

        localStorage.setItem(key, jsonData);
        this.saveAccountKey(key);
    }

    getAccounts(AccountModel) {
        var accountKeys = this.getAccountKeys();

        return accountKeys.map(function(key) {
            var jsonObject =  JSON.parse(localStorage.getItem(key));
            return new AccountModel(jsonObject.name, 
                                    jsonObject.netRate,
                                    jsonObject.id);
        })
    }
    
    getInvestment(account, InvestmentModel) {
        var key = "account-" + account.id;
        var jsonObject =  JSON.parse(localStorage.getItem(key + "-investment"));
        if (!jsonObject){
            return new InvestmentModel(account, 0.0, 0.0, 12);
        }
        return new InvestmentModel(account, 
                                   jsonObject.initial,
                                   jsonObject.perMonth,
                                   jsonObject.months);
    }
    
    saveInvestment(investment) {
        if (!investment.account.id) {
            throw "Cannot save investement for account without an ID";
        }
        var key = "account-" + investment.account.id + "-investment";

        var jsonData = ko.toJSON(investment);
        localStorage.setItem(key, jsonData);
        this.saveAccountKey(key);
    }
}

export class AccountModel {
    constructor(name, netRate, id) {
        this.id = id;
        this.name = ko.observable(name);
        this.netRate = ko.observable(netRate).extend({numeric: 2});
        this.isEnabled = ko.observable(true);
        this.isDirty = ko.observable(false);

        this.name.subscribe(this.dirty.bind(this));
        this.netRate.subscribe(this.dirty.bind(this));
        this.isEnabled.subscribe(this.dirty.bind(this));
    }

    dirty() {
        this.isDirty(true);
    }

    save() {
        var store = new LocalStorage();
        store.saveAccount(this);
        this.isDirty(false);
    }
}

