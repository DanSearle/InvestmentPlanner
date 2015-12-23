import ko from 'knockout';
import $ from 'jquery'; 

function guid() {
      function s4() {
              return Math.floor((1 + Math.random()) * 0x10000)
                        .toString(16)
                              .substring(1);
                }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                s4() + '-' + s4() + s4() + s4();
}

class LocalStorage {
    constructor() {
    }
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
    deleteAccount(account) { 
        if (!account.id) {
            return;
        }

        var key = "account-" + account.id;
        localStorage.removeItem(key);
        localStorage.removeItem("investment-" + account.id);

        var accountKeys = this.getAccountKeys();
        var idx = accountKeys.indexOf(key);
        if (idx == -1) {
            return;
        }
        accountKeys.splice(idx, 1);
        localStorage.setItem("accounts", JSON.stringify(accountKeys));

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

    createAccountModel(jsonObject, AccountModel) {
        return new AccountModel(jsonObject.name, 
                                    jsonObject.netRate,
                                    jsonObject.id,
                                    (jsonObject.constraints || []).map(function(constraint) {
                                        return {
                                            field: ko.observable(constraint.field),
                                            minValue: ko.observable(constraint.minValue),
                                            maxValue: ko.observable(constraint.maxValue),
                                        }
                                    }),
                                    jsonObject.isEnabled);

    }

    getAccounts(AccountModel) {
        var accountKeys = this.getAccountKeys();
        var self = this;

        return accountKeys.map(function(key) {
            var jsonObject =  JSON.parse(localStorage.getItem(key));
            return self.createAccountModel(jsonObject, AccountModel);
        })
    }
    getInvestments(AccountModel, InvestmentModel) {
        var self = this;
        var accountKeys = this.getAccountKeys();
        return accountKeys.map(function(key) {
            var accountJsonObject =  JSON.parse(localStorage.getItem(key));
            var jsonObject =  JSON.parse(localStorage.getItem("investment-" + key));
            var accountModel = self.createAccountModel(accountJsonObject, AccountModel);
            var investment = new InvestmentModel(accountModel, 0, 0, 12);
            if (jsonObject) {
                investment = new InvestmentModel(accountModel, 
                                           jsonObject.initial,
                                           jsonObject.perMonth,
                                           jsonObject.months);
            }
            return investment;
        });
    }

    getAccountsAndInvestments(AccountModel, InvestmentModel) {
        var self = this;
        var accountKeys = this.getAccountKeys();
        var accountKeys = this.getAccountKeys();
        return accountKeys.map(function(key) {
            var accountJsonObject =  JSON.parse(localStorage.getItem(key));
            var jsonObject =  JSON.parse(localStorage.getItem("investment-" + key));
            var accountModel = self.createAccountModel(accountJsonObject, AccountModel);
            var investment = new InvestmentModel(accountModel, 0, 0, 12);
            if (jsonObject) {
                investment = new InvestmentModel(accountModel, 
                                           jsonObject.initial,
                                           jsonObject.perMonth,
                                           jsonObject.months);
            }
            return {account: accountModel, investment: investment};
        })
    }
    
    saveInvestment(investment) {
        if (!investment.account.id) {
            throw "Cannot save investement for account without an ID";
        }
        var key = "investment-account-" + investment.account.id;

        var jsonData = ko.toJSON(investment);
        localStorage.setItem(key, jsonData);
    }
}

export default LocalStorage;
