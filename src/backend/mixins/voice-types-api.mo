import Map "mo:core/Map";
import VoiceTypesLib "../lib/voice-types";
import Facts "../types/facts";

mixin (factVoiceTypes : Map.Map<Text, Facts.FactVoiceType>) {
  public query func getVoiceTypes() : async [Text] {
    VoiceTypesLib.getAll(factVoiceTypes);
  };

  public func addVoiceType(name : Text, sortOrder : Nat) : async Bool {
    VoiceTypesLib.add(factVoiceTypes, name, sortOrder);
  };

  public func updateVoiceType(oldName : Text, newName : Text, sortOrder : Nat) : async Bool {
    VoiceTypesLib.update(factVoiceTypes, oldName, newName, sortOrder);
  };

  public func deleteVoiceType(name : Text) : async Bool {
    VoiceTypesLib.delete(factVoiceTypes, name);
  };
};
