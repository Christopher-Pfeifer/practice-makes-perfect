import Map "mo:core/Map";
import BillingStatusesLib "../lib/billing-statuses";
import Facts "../types/facts";

mixin (factBillingStatuses : Map.Map<Text, Facts.FactBillingStatus>) {
  public query func getBillingStatuses() : async [Text] {
    BillingStatusesLib.getAll(factBillingStatuses);
  };

  public func addBillingStatus(name : Text, sortOrder : Nat) : async Bool {
    BillingStatusesLib.add(factBillingStatuses, name, sortOrder);
  };

  public func updateBillingStatus(oldName : Text, newName : Text, sortOrder : Nat) : async Bool {
    BillingStatusesLib.update(factBillingStatuses, oldName, newName, sortOrder);
  };

  public func deleteBillingStatus(name : Text) : async Bool {
    BillingStatusesLib.delete(factBillingStatuses, name);
  };
};
