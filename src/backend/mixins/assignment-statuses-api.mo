import Map "mo:core/Map";
import AssignmentStatusesLib "../lib/assignment-statuses";
import Facts "../types/facts";

mixin (factAssignmentStatuses : Map.Map<Text, Facts.FactAssignmentStatus>) {
  public query func getAssignmentStatuses() : async [Text] {
    AssignmentStatusesLib.getAll(factAssignmentStatuses);
  };

  public func addAssignmentStatus(name : Text, sortOrder : Nat) : async Bool {
    AssignmentStatusesLib.add(factAssignmentStatuses, name, sortOrder);
  };

  public func updateAssignmentStatus(oldName : Text, newName : Text, sortOrder : Nat) : async Bool {
    AssignmentStatusesLib.update(factAssignmentStatuses, oldName, newName, sortOrder);
  };

  public func deleteAssignmentStatus(name : Text) : async Bool {
    AssignmentStatusesLib.delete(factAssignmentStatuses, name);
  };
};
