import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Types "../types/auth";

module {
  public type MasterInstrument = Types.MasterInstrument;

  public func getInstruments(
    map : Map.Map<Text, MasterInstrument>,
  ) : [Text] {
    map.values()
      .sort(func(a : MasterInstrument, b : MasterInstrument) : { #less; #equal; #greater } {
        Nat.compare(a.sortOrder, b.sortOrder);
      })
      .map(func(i : MasterInstrument) : Text { i.name })
      .toArray();
  };

  public func addInstrument(
    map : Map.Map<Text, MasterInstrument>,
    name : Text,
    sortOrder : Nat,
  ) : Bool {
    switch (map.get(name)) {
      case (?_) { false };
      case null {
        map.add(name, { name; sortOrder });
        true;
      };
    };
  };

  public func updateInstrument(
    map : Map.Map<Text, MasterInstrument>,
    oldName : Text,
    newName : Text,
    sortOrder : Nat,
  ) : Bool {
    switch (map.get(oldName)) {
      case null { false };
      case (?_) {
        map.remove(oldName);
        map.add(newName, { name = newName; sortOrder });
        true;
      };
    };
  };

  public func deleteInstrument(
    map : Map.Map<Text, MasterInstrument>,
    name : Text,
  ) : Bool {
    switch (map.get(name)) {
      case null { false };
      case (?_) {
        map.remove(name);
        true;
      };
    };
  };
};
