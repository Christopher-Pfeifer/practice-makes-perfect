import Map "mo:core/Map";
import TheoryLevelsLib "../lib/theory-levels";
import Facts "../types/facts";

mixin (factTheoryLevels : Map.Map<Text, Facts.FactTheoryLevel>) {
  public query func getTheoryLevels() : async [Text] {
    TheoryLevelsLib.getAll(factTheoryLevels);
  };

  public func addTheoryLevel(name : Text, sortOrder : Nat) : async Bool {
    TheoryLevelsLib.add(factTheoryLevels, name, sortOrder);
  };

  public func updateTheoryLevel(oldName : Text, newName : Text, sortOrder : Nat) : async Bool {
    TheoryLevelsLib.update(factTheoryLevels, oldName, newName, sortOrder);
  };

  public func deleteTheoryLevel(name : Text) : async Bool {
    TheoryLevelsLib.delete(factTheoryLevels, name);
  };
};
