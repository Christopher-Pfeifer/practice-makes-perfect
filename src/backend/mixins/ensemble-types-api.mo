import Map "mo:core/Map";
import EnsembleTypesLib "../lib/ensemble-types";
import Facts "../types/facts";

mixin (factEnsembleTypes : Map.Map<Text, Facts.FactEnsembleType>) {
  public query func getEnsembleTypes() : async [Text] {
    EnsembleTypesLib.getAll(factEnsembleTypes);
  };

  public func addEnsembleType(name : Text, sortOrder : Nat) : async Bool {
    EnsembleTypesLib.add(factEnsembleTypes, name, sortOrder);
  };

  public func updateEnsembleType(oldName : Text, newName : Text, sortOrder : Nat) : async Bool {
    EnsembleTypesLib.update(factEnsembleTypes, oldName, newName, sortOrder);
  };

  public func deleteEnsembleType(name : Text) : async Bool {
    EnsembleTypesLib.delete(factEnsembleTypes, name);
  };
};
