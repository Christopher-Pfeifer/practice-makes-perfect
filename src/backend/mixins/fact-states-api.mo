import Map "mo:core/Map";
import FactStatesLib "../lib/fact-states";
import Facts "../types/facts";

mixin (factStates : Map.Map<Text, Facts.FactState>) {
  public query func getFactStates() : async [Text] {
    FactStatesLib.getAll(factStates);
  };

  public func addFactState(name : Text, sortOrder : Nat) : async Bool {
    FactStatesLib.add(factStates, name, sortOrder);
  };

  public func updateFactState(oldName : Text, newName : Text, sortOrder : Nat) : async Bool {
    FactStatesLib.update(factStates, oldName, newName, sortOrder);
  };

  public func deleteFactState(name : Text) : async Bool {
    FactStatesLib.delete(factStates, name);
  };
};
