import Map "mo:core/Map";
import Types "../types/auth";
import Text "mo:core/Text";
import Nat "mo:core/Nat";

mixin (
  profiles : Map.Map<Text, Types.Profile>,
  studentEnrollments : Map.Map<Text, Types.StudentEnrollment>,
  parentStudents : Map.Map<Text, Types.ParentStudent>,
  state : { var nextEnrollmentId : Nat },
) {

  /// Onboard a student: optionally create their profile, then create an enrollment.
  /// - If createProfile is true, a new profiles record with role=#Student is inserted.
  ///   If the username already exists, returns #err with a descriptive message.
  /// - The enrollment is always created (whether profile was new or existing).
  public func onboardStudent(
    createProfile : Bool,
    profile : Types.Profile,
    enrollment : Types.StudentEnrollment,
  ) : async { #ok : Text; #err : Text } {
    // Step 1: optionally create the profile
    if (createProfile) {
      switch (profiles.get(profile.username)) {
        case (?_) {
          return #err("Username already taken: " # profile.username);
        };
        case null {
          let studentProfile : Types.Profile = {
            profile with role = #Student;
          };
          profiles.add(profile.username, studentProfile);
        };
      };
    } else {
      // Validate that the referenced student profile actually exists
      switch (profiles.get(profile.username)) {
        case null {
          return #err("Student profile not found: " # profile.username);
        };
        case (?_) {};
      };
    };

    // Step 2: generate a unique enrollmentId and create the enrollment
    state.nextEnrollmentId += 1;
    let generatedId = "enr_" # profile.username # "_" # state.nextEnrollmentId.toText();
    let finalEnrollment : Types.StudentEnrollment = {
      enrollment with
      enrollmentId = generatedId;
      studentUserName = profile.username;
    };
    studentEnrollments.add(generatedId, finalEnrollment);
    #ok(generatedId);
  };

  /// Onboard a student with optional parent creation/linking in one call.
  /// - createStudentProfile: if true, create a new profile with role=#Student
  /// - studentProfile: student's profile data
  /// - enrollment: enrollment record (enrollmentId auto-generated)
  /// - createParentProfile: if true and parentProfile is provided, create a new parent profile
  /// - parentProfile: optional profile data for a new parent
  /// - linkParent: if true and parentUserName is provided, add parentStudents link
  /// - parentUserName: userName of an existing parent to link
  /// Returns #ok(enrollmentId) or #err(message)
  public func onboardStudentWithParent(
    createStudentProfile : Bool,
    studentProfile : Types.Profile,
    enrollment : Types.StudentEnrollment,
    createParentProfile : Bool,
    parentProfile : ?Types.Profile,
    linkParent : Bool,
    parentUserName : ?Text,
  ) : async { #ok : Text; #err : Text } {
    // Step 1: optionally create or validate student profile
    if (createStudentProfile) {
      switch (profiles.get(studentProfile.username)) {
        case (?_) {
          return #err("Username already taken: " # studentProfile.username);
        };
        case null {
          profiles.add(studentProfile.username, { studentProfile with role = #Student });
        };
      };
    } else {
      switch (profiles.get(studentProfile.username)) {
        case null {
          return #err("Student profile not found: " # studentProfile.username);
        };
        case (?_) {};
      };
    };

    // Step 2: generate enrollment id and save enrollment
    state.nextEnrollmentId += 1;
    let generatedId = "enr_" # studentProfile.username # "_" # state.nextEnrollmentId.toText();
    let finalEnrollment : Types.StudentEnrollment = {
      enrollment with
      enrollmentId = generatedId;
      studentUserName = studentProfile.username;
    };
    studentEnrollments.add(generatedId, finalEnrollment);

    // Step 3: optionally create parent profile
    if (createParentProfile) {
      switch (parentProfile) {
        case (?pp) {
          switch (profiles.get(pp.username)) {
            case (?_) {
              // Parent already exists — skip creation, but still link if requested
            };
            case null {
              profiles.add(pp.username, { pp with role = #Parent });
            };
          };
          // Always link the (new or existing) parent to the student
          let key = pp.username # "|" # studentProfile.username;
          switch (parentStudents.get(key)) {
            case (?_) {}; // already linked
            case null {
              parentStudents.add(key, { parentUserName = pp.username; studentUserName = studentProfile.username });
            };
          };
        };
        case null {};
      };
    };

    // Step 4: link existing parent if requested
    if (linkParent) {
      switch (parentUserName) {
        case (?pu) {
          switch (profiles.get(pu)) {
            case null {
              // Parent not found — don't block the enrollment, but skip the link
            };
            case (?_) {
              let key = pu # "|" # studentProfile.username;
              switch (parentStudents.get(key)) {
                case (?_) {}; // already linked
                case null {
                  parentStudents.add(key, { parentUserName = pu; studentUserName = studentProfile.username });
                };
              };
            };
          };
        };
        case null {};
      };
    };

    #ok(generatedId);
  };

  /// Search student profiles by username or fullName (case-insensitive contains).
  public query func searchStudents(searchQuery : Text) : async [Types.Profile] {
    let lowerQuery = searchQuery.toLower();
    profiles.values()
      .filter(func(p : Types.Profile) : Bool {
        p.role == #Student and (
          p.username.toLower().contains(#text lowerQuery) or
          p.fullName.toLower().contains(#text lowerQuery)
        );
      })
      .toArray();
  };
};
