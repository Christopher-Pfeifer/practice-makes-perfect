import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Types "../types/facts";

module {
  public type FactSkillCategory = Types.FactSkillCategory;

  public func getAll(map : Map.Map<Text, FactSkillCategory>) : [Text] {
    map.values()
      .sort(func(a : FactSkillCategory, b : FactSkillCategory) : { #less; #equal; #greater } {
        Nat.compare(a.sortOrder, b.sortOrder);
      })
      .map(func(i : FactSkillCategory) : Text { i.name })
      .toArray();
  };

  public func add(map : Map.Map<Text, FactSkillCategory>, name : Text, sortOrder : Nat) : Bool {
    switch (map.get(name)) {
      case (?_) { false };
      case null {
        map.add(name, { name; sortOrder });
        true;
      };
    };
  };

  public func update(map : Map.Map<Text, FactSkillCategory>, oldName : Text, newName : Text, sortOrder : Nat) : Bool {
    switch (map.get(oldName)) {
      case null { false };
      case (?_) {
        map.remove(oldName);
        map.add(newName, { name = newName; sortOrder });
        true;
      };
    };
  };

  public func delete(map : Map.Map<Text, FactSkillCategory>, name : Text) : Bool {
    switch (map.get(name)) {
      case null { false };
      case (?_) {
        map.remove(name);
        true;
      };
    };
  };
};
