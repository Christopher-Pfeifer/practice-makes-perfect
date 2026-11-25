import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Types "../types/facts";

module {
  public type FactEnsembleType = Types.FactEnsembleType;

  public func getAll(map : Map.Map<Text, FactEnsembleType>) : [Text] {
    map.values()
      .sort(func(a : FactEnsembleType, b : FactEnsembleType) : { #less; #equal; #greater } {
        Nat.compare(a.sortOrder, b.sortOrder);
      })
      .map(func(i : FactEnsembleType) : Text { i.name })
      .toArray();
  };

  public func add(map : Map.Map<Text, FactEnsembleType>, name : Text, sortOrder : Nat) : Bool {
    switch (map.get(name)) {
      case (?_) { false };
      case null {
        map.add(name, { name; sortOrder });
        true;
      };
    };
  };

  public func update(map : Map.Map<Text, FactEnsembleType>, oldName : Text, newName : Text, sortOrder : Nat) : Bool {
    switch (map.get(oldName)) {
      case null { false };
      case (?_) {
        map.remove(oldName);
        map.add(newName, { name = newName; sortOrder });
        true;
      };
    };
  };

  public func delete(map : Map.Map<Text, FactEnsembleType>, name : Text) : Bool {
    switch (map.get(name)) {
      case null { false };
      case (?_) {
        map.remove(name);
        true;
      };
    };
  };
};
