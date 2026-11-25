import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Types "../types/facts";

module {
  public type FactAssignmentStatus = Types.FactAssignmentStatus;

  public func getAll(map : Map.Map<Text, FactAssignmentStatus>) : [Text] {
    map.values()
      .sort(func(a : FactAssignmentStatus, b : FactAssignmentStatus) : { #less; #equal; #greater } {
        Nat.compare(a.sortOrder, b.sortOrder);
      })
      .map(func(i : FactAssignmentStatus) : Text { i.name })
      .toArray();
  };

  public func add(map : Map.Map<Text, FactAssignmentStatus>, name : Text, sortOrder : Nat) : Bool {
    switch (map.get(name)) {
      case (?_) { false };
      case null {
        map.add(name, { name; sortOrder });
        true;
      };
    };
  };

  public func update(map : Map.Map<Text, FactAssignmentStatus>, oldName : Text, newName : Text, sortOrder : Nat) : Bool {
    switch (map.get(oldName)) {
      case null { false };
      case (?_) {
        map.remove(oldName);
        map.add(newName, { name = newName; sortOrder });
        true;
      };
    };
  };

  public func delete(map : Map.Map<Text, FactAssignmentStatus>, name : Text) : Bool {
    switch (map.get(name)) {
      case null { false };
      case (?_) {
        map.remove(name);
        true;
      };
    };
  };
};
