import Map "mo:core/Map";
import InstrumentsLib "../lib/instruments";
import Types "../types/auth";

mixin (masterInstruments : Map.Map<Text, Types.MasterInstrument>) {
  public query func getInstruments() : async [Text] {
    InstrumentsLib.getInstruments(masterInstruments);
  };

  public func addInstrument(name : Text, sortOrder : Nat) : async Bool {
    InstrumentsLib.addInstrument(masterInstruments, name, sortOrder);
  };

  public func updateInstrument(oldName : Text, newName : Text, sortOrder : Nat) : async Bool {
    InstrumentsLib.updateInstrument(masterInstruments, oldName, newName, sortOrder);
  };

  public func deleteInstrument(name : Text) : async Bool {
    InstrumentsLib.deleteInstrument(masterInstruments, name);
  };
};
