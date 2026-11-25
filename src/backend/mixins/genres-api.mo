import Map "mo:core/Map";
import GenresLib "../lib/genres";
import Facts "../types/facts";

mixin (factGenres : Map.Map<Text, Facts.FactGenre>) {
  public query func getGenres() : async [Text] {
    GenresLib.getAll(factGenres);
  };

  public func addGenre(name : Text, sortOrder : Nat) : async Bool {
    GenresLib.add(factGenres, name, sortOrder);
  };

  public func updateGenre(oldName : Text, newName : Text, sortOrder : Nat) : async Bool {
    GenresLib.update(factGenres, oldName, newName, sortOrder);
  };

  public func deleteGenre(name : Text) : async Bool {
    GenresLib.delete(factGenres, name);
  };
};
