import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Types "../types/facts";

module {
  public type FactRepertoireStatus = Types.FactRepertoireStatus;

  public func getAll(map : Map.Map<Text, FactRepertoireStatus>) : [Text] {
    map.values()
      .sort(func(a : FactRepertoireStatus, b : FactRepertoireStatus) : { #less; #equal; #greater } {
        Nat.compare(a.sortOrder, b.sortOrder);
      })
      .map(func(i : FactRepertoireStatus) : Text { i.name })
      .toArray();
  };

  public func add(map : Map.Map<Text, FactRepertoireStatus>, name : Text, sortOrder : Nat) : Bool {
    switch (map.get(name)) {
      case (?_) { false };
      case null {
        map.add(name, { name; sortOrder });
        true;
      };
    };
  };

  public func update(map : Map.Map<Text, FactRepertoireStatus>, oldName : Text, newName : Text, sortOrder : Nat) : Bool {
    switch (map.get(oldName)) {
      case null { false };
      case (?_) {
        map.remove(oldName);
        map.add(newName, { name = newName; sortOrder });
        true;
      };
    };
  };

  public func delete(map : Map.Map<Text, FactRepertoireStatus>, name : Text) : Bool {
    switch (map.get(name)) {
      case null { false };
      case (?_) {
        map.remove(name);
        true;
      };
    };
  };
};
