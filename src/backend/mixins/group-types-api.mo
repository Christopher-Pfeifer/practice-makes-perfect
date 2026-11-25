import Map "mo:core/Map";
import GroupTypesLib "../lib/group-types";
import Facts "../types/facts";

mixin (factGroupTypes : Map.Map<Text, Facts.FactGroupType>) {
  public query func getGroupTypes() : async [Text] {
    GroupTypesLib.getAll(factGroupTypes);
  };

  public func addGroupType(name : Text, sortOrder : Nat) : async Bool {
    GroupTypesLib.add(factGroupTypes, name, sortOrder);
  };

  public func updateGroupType(oldName : Text, newName : Text, sortOrder : Nat) : async Bool {
    GroupTypesLib.update(factGroupTypes, oldName, newName, sortOrder);
  };

  public func deleteGroupType(name : Text) : async Bool {
    GroupTypesLib.delete(factGroupTypes, name);
  };
};
