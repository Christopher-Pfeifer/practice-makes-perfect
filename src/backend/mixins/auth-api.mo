import Map "mo:core/Map";
import AuthLib "../lib/auth";
import Types "../types/auth";

mixin (
  profiles : Map.Map<Text, Types.Profile>,
  teacherDetails : Map.Map<Text, Types.TeacherDetail>,
) {
  public func signUp(
    username : Text,
    password : Text,
    fullName : Text,
    role : Types.Role,
  ) : async { #ok; #err : Text } {
    AuthLib.signUp(profiles, username, password, fullName, role);
  };

  public func signIn(
    username : Text,
    password : Text,
  ) : async { #ok : Types.Profile; #err : Text } {
    AuthLib.signIn(profiles, username, password);
  };

  public query func ping() : async Text {
    "pong";
  };

  public query func getStudioUsernames() : async [Text] {
    AuthLib.getStudioUsernames(profiles);
  };

  public query func getTeacherUsernames() : async [Text] {
    AuthLib.getTeacherUsernames(profiles);
  };

  public query func getParentUsernames() : async [Text] {
    AuthLib.getParentUsernames(profiles);
  };

  public query func getAllProfiles() : async [(Text, Types.Profile)] {
    AuthLib.getAllProfiles(profiles);
  };

  public func createProfile(profile : Types.Profile) : async { #ok; #err : Text } {
    AuthLib.createProfile(profiles, profile);
  };

  public func updateProfile(
    username : Text,
    update : Types.ProfileUpdate,
  ) : async { #ok; #err : Text } {
    AuthLib.updateProfile(profiles, username, update);
  };

  /// Update a teacher's own profile and teacherDetails record.
  public func updateTeacherProfile(
    teacherUserName : Text,
    profileUpdate : Types.ProfileUpdate,
    detailUpdate : Types.TeacherDetail,
  ) : async { #ok; #err : Text } {
    switch (profiles.get(teacherUserName)) {
      case null { return #err("Teacher profile not found: " # teacherUserName) };
      case (?existing) {
        if (existing.role != #Teacher) {
          return #err("Profile " # teacherUserName # " is not a teacher");
        };
        let updated : Types.Profile = {
          existing with
          password = switch (profileUpdate.password) { case (?v) v; case null existing.password };
          fullName = switch (profileUpdate.fullName) { case (?v) v; case null existing.fullName };
          address1 = switch (profileUpdate.address1) { case (?v) v; case null existing.address1 };
          address2 = switch (profileUpdate.address2) { case (?v) v; case null existing.address2 };
          city = switch (profileUpdate.city) { case (?v) v; case null existing.city };
          state = switch (profileUpdate.state) { case (?v) v; case null existing.state };
          zip = switch (profileUpdate.zip) { case (?v) v; case null existing.zip };
          phone = switch (profileUpdate.phone) { case (?v) v; case null existing.phone };
          email = switch (profileUpdate.email) { case (?v) v; case null existing.email };
        };
        profiles.add(teacherUserName, updated);
      };
    };
    teacherDetails.add(teacherUserName, detailUpdate);
    #ok;
  };

  public func deleteProfile(username : Text) : async { #ok; #err : Text } {
    AuthLib.deleteProfile(profiles, username);
  };
};
