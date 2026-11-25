import Map "mo:core/Map";
import PrioritiesLib "../lib/priorities";
import Facts "../types/facts";

mixin (factPriorities : Map.Map<Text, Facts.FactPriority>) {
  public query func getPriorities() : async [Text] {
    PrioritiesLib.getAll(factPriorities);
  };

  public func addPriority(name : Text, sortOrder : Nat) : async Bool {
    PrioritiesLib.add(factPriorities, name, sortOrder);
  };

  public func updatePriority(oldName : Text, newName : Text, sortOrder : Nat) : async Bool {
    PrioritiesLib.update(factPriorities, oldName, newName, sortOrder);
  };

  public func deletePriority(name : Text) : async Bool {
    PrioritiesLib.delete(factPriorities, name);
  };
};
