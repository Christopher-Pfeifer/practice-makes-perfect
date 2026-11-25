import Map "mo:core/Map";
import FactRolesLib "../lib/fact-roles";
import Facts "../types/facts";

mixin (factRoles : Map.Map<Text, Facts.FactRole>) {
  public query func getFactRoles() : async [Text] {
    FactRolesLib.getAll(factRoles);
  };

  public func addFactRole(name : Text, sortOrder : Nat) : async Bool {
    FactRolesLib.add(factRoles, name, sortOrder);
  };

  public func updateFactRole(oldName : Text, newName : Text, sortOrder : Nat) : async Bool {
    FactRolesLib.update(factRoles, oldName, newName, sortOrder);
  };

  public func deleteFactRole(name : Text) : async Bool {
    FactRolesLib.delete(factRoles, name);
  };
};
