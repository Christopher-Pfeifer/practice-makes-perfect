import Map "mo:core/Map";
import RepertoireStatusesLib "../lib/repertoire-statuses";
import Facts "../types/facts";

mixin (factRepertoireStatuses : Map.Map<Text, Facts.FactRepertoireStatus>) {
  public query func getRepertoireStatuses() : async [Text] {
    RepertoireStatusesLib.getAll(factRepertoireStatuses);
  };

  public func addRepertoireStatus(name : Text, sortOrder : Nat) : async Bool {
    RepertoireStatusesLib.add(factRepertoireStatuses, name, sortOrder);
  };

  public func updateRepertoireStatus(oldName : Text, newName : Text, sortOrder : Nat) : async Bool {
    RepertoireStatusesLib.update(factRepertoireStatuses, oldName, newName, sortOrder);
  };

  public func deleteRepertoireStatus(name : Text) : async Bool {
    RepertoireStatusesLib.delete(factRepertoireStatuses, name);
  };
};
