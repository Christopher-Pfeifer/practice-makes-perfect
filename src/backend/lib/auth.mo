import Map "mo:core/Map";
import Types "../types/auth";

module {
  public type Profile = Types.Profile;
  public type Role = Types.Role;
  public type ProfileUpdate = Types.ProfileUpdate;

  public func signUp(
    profiles : Map.Map<Text, Profile>,
    username : Text,
    password : Text,
    fullName : Text,
    role : Role,
  ) : { #ok; #err : Text } {
    switch (profiles.get(username)) {
      case (?_) { #err("Username already taken") };
      case null {
        profiles.add(username, {
          username;
          password;
          fullName;
          address1 = "";
          address2 = "";
          city = "";
          state = "";
          zip = "";
          phone = "";
          email = "";
          role;
          studioAffiliation = "";
          teacherAffiliation = "";
          parentAffiliation = "";
          studentAffiliations = [];
          description = "";
          comments = "";
        });
        #ok;
      };
    };
  };

  public func signIn(
    profiles : Map.Map<Text, Profile>,
    username : Text,
    password : Text,
  ) : { #ok : Profile; #err : Text } {
    switch (profiles.get(username)) {
      case (?profile) {
        if (profile.password == password) { #ok(profile) }
        else { #err("Invalid username or password") };
      };
      case null { #err("Invalid username or password") };
    };
  };

  public func getAllProfiles(
    profiles : Map.Map<Text, Profile>,
  ) : [(Text, Profile)] {
    profiles.toArray();
  };

  public func createProfile(
    profiles : Map.Map<Text, Profile>,
    profile : Profile,
  ) : { #ok; #err : Text } {
    switch (profiles.get(profile.username)) {
      case (?_) { #err("Username already taken") };
      case null {
        profiles.add(profile.username, profile);
        #ok;
      };
    };
  };

  public func updateProfile(
    profiles : Map.Map<Text, Profile>,
    username : Text,
    update : ProfileUpdate,
  ) : { #ok; #err : Text } {
    switch (profiles.get(username)) {
      case null { #err("Profile not found") };
      case (?existing) {
        let updated : Profile = {
          existing with
          password = switch (update.password) { case (?v) v; case null existing.password };
          fullName = switch (update.fullName) { case (?v) v; case null existing.fullName };
          address1 = switch (update.address1) { case (?v) v; case null existing.address1 };
          address2 = switch (update.address2) { case (?v) v; case null existing.address2 };
          city = switch (update.city) { case (?v) v; case null existing.city };
          state = switch (update.state) { case (?v) v; case null existing.state };
          zip = switch (update.zip) { case (?v) v; case null existing.zip };
          phone = switch (update.phone) { case (?v) v; case null existing.phone };
          email = switch (update.email) { case (?v) v; case null existing.email };
          role = switch (update.role) { case (?v) v; case null existing.role };
          studioAffiliation = switch (update.studioAffiliation) { case (?v) v; case null existing.studioAffiliation };
          teacherAffiliation = switch (update.teacherAffiliation) { case (?v) v; case null existing.teacherAffiliation };
          parentAffiliation = switch (update.parentAffiliation) { case (?v) v; case null existing.parentAffiliation };
          studentAffiliations = switch (update.studentAffiliations) { case (?v) v; case null existing.studentAffiliations };
          description = switch (update.description) { case (?v) v; case null existing.description };
          comments = switch (update.comments) { case (?v) v; case null existing.comments };
        };
        profiles.add(username, updated);
        #ok;
      };
    };
  };

  public func deleteProfile(
    profiles : Map.Map<Text, Profile>,
    username : Text,
  ) : { #ok; #err : Text } {
    switch (profiles.get(username)) {
      case null { #err("Profile not found") };
      case (?_) {
        profiles.remove(username);
        #ok;
      };
    };
  };

  public func getStudioUsernames(
    profiles : Map.Map<Text, Profile>,
  ) : [Text] {
    profiles.values()
      .filter<Profile>(func(p) { p.role == #Studio })
      .toArray()
      .map<Profile, Text>(func(p) { p.username });
  };

  public func getTeacherUsernames(
    profiles : Map.Map<Text, Profile>,
  ) : [Text] {
    profiles.values()
      .filter<Profile>(func(p) { p.role == #Teacher })
      .toArray()
      .map<Profile, Text>(func(p) { p.username });
  };

  public func getParentUsernames(
    profiles : Map.Map<Text, Profile>,
  ) : [Text] {
    profiles.values()
      .filter<Profile>(func(p) { p.role == #Parent })
      .toArray()
      .map<Profile, Text>(func(p) { p.username });
  };
};
