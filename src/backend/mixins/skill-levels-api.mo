import Map "mo:core/Map";
import SkillLevelsLib "../lib/skill-levels";
import Facts "../types/facts";

mixin (factSkillLevels : Map.Map<Text, Facts.FactSkillLevel>) {
  public query func getSkillLevels() : async [Text] {
    SkillLevelsLib.getAll(factSkillLevels);
  };

  public func addSkillLevel(name : Text, sortOrder : Nat) : async Bool {
    SkillLevelsLib.add(factSkillLevels, name, sortOrder);
  };

  public func updateSkillLevel(oldName : Text, newName : Text, sortOrder : Nat) : async Bool {
    SkillLevelsLib.update(factSkillLevels, oldName, newName, sortOrder);
  };

  public func deleteSkillLevel(name : Text) : async Bool {
    SkillLevelsLib.delete(factSkillLevels, name);
  };
};
