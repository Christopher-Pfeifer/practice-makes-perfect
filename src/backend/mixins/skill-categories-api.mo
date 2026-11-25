import Map "mo:core/Map";
import SkillCategoriesLib "../lib/skill-categories";
import Facts "../types/facts";

mixin (factSkillCategories : Map.Map<Text, Facts.FactSkillCategory>) {
  public query func getSkillCategories() : async [Text] {
    SkillCategoriesLib.getAll(factSkillCategories);
  };

  public func addSkillCategory(name : Text, sortOrder : Nat) : async Bool {
    SkillCategoriesLib.add(factSkillCategories, name, sortOrder);
  };

  public func updateSkillCategory(oldName : Text, newName : Text, sortOrder : Nat) : async Bool {
    SkillCategoriesLib.update(factSkillCategories, oldName, newName, sortOrder);
  };

  public func deleteSkillCategory(name : Text) : async Bool {
    SkillCategoriesLib.delete(factSkillCategories, name);
  };
};
