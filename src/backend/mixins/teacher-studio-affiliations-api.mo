import Map "mo:core/Map";
import AuthTypes "../types/auth";

mixin (
  profiles : Map.Map<Text, AuthTypes.Profile>,
  teacherStudioAffiliations : Map.Map<Text, AuthTypes.TeacherStudioAffiliation>,
) {
  /// Add an affiliation between a teacher and a studio.
  /// Looks up the studio profile to populate studioName (fullName).
  public shared func addTeacherStudioAffiliation(teacherUserName : Text, studioUserName : Text) : async { #ok; #err : Text } {
    if (teacherUserName == "" or studioUserName == "") {
      return #err("teacherUserName and studioUserName must be non-empty");
    };
    let key = teacherUserName # "|" # studioUserName;
    switch (teacherStudioAffiliations.get(key)) {
      case (?_) { #err("Affiliation already exists") };
      case null {
        // Resolve the studio's display name from the profiles table
        let studioName = switch (profiles.get(studioUserName)) {
          case (?p) { p.fullName };
          case null { return #err("Studio profile not found: " # studioUserName) };
        };
        teacherStudioAffiliations.add(key, { teacherUserName; studioUserName; studioName });
        #ok;
      };
    };
  };

  /// Remove an affiliation between a teacher and a studio.
  public shared func removeTeacherStudioAffiliation(teacherUserName : Text, studioUserName : Text) : async { #ok; #err : Text } {
    let key = teacherUserName # "|" # studioUserName;
    switch (teacherStudioAffiliations.get(key)) {
      case null { #err("Affiliation not found") };
      case (?_) {
        teacherStudioAffiliations.remove(key);
        #ok;
      };
    };
  };

  /// Get all studio affiliations for a given teacher.
  public shared query func getTeacherStudioAffiliations(teacherUserName : Text) : async [AuthTypes.TeacherStudioAffiliation] {
    teacherStudioAffiliations.values()
      .filter(func(a) { a.teacherUserName == teacherUserName })
      .toArray();
  };

  /// Get all teacher affiliations for a given studio.
  public shared query func getStudioTeacherAffiliations(studioUserName : Text) : async [AuthTypes.TeacherStudioAffiliation] {
    teacherStudioAffiliations.values()
      .filter(func(a) { a.studioUserName == studioUserName })
      .toArray();
  };

  /// Get every teacher-studio affiliation in the system.
  public shared query func getAllTeacherStudioAffiliations() : async [AuthTypes.TeacherStudioAffiliation] {
    teacherStudioAffiliations.values().toArray();
  };
};
