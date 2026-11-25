import Map "mo:core/Map";
import DetailsLib "../lib/details";
import Types "../types/auth";

mixin (
  profiles : Map.Map<Text, Types.Profile>,
  studioDetails : Map.Map<Text, Types.StudioDetail>,
  teacherDetails : Map.Map<Text, Types.TeacherDetail>,
  studentDetails : Map.Map<Text, Types.StudentDetail>,
  studentEnrollments : Map.Map<Text, Types.StudentEnrollment>,
  parentStudents : Map.Map<Text, Types.ParentStudent>,
) {
  public query func getStudioDetail(username : Text) : async ?Types.StudioDetail {
    DetailsLib.getStudioDetail(studioDetails, username);
  };

  public func saveStudioDetail(username : Text, detail : Types.StudioDetail) : async () {
    DetailsLib.saveStudioDetail(studioDetails, username, detail);
  };

  public query func getAllStudioDetails() : async [(Text, Types.StudioDetail)] {
    DetailsLib.getAllStudioDetails(studioDetails);
  };

  public query func getTeacherDetail(username : Text) : async ?Types.TeacherDetail {
    DetailsLib.getTeacherDetail(teacherDetails, username);
  };

  public func saveTeacherDetail(username : Text, detail : Types.TeacherDetail) : async () {
    DetailsLib.saveTeacherDetail(teacherDetails, username, detail);
  };

  public query func getAllTeacherDetails() : async [(Text, Types.TeacherDetail)] {
    DetailsLib.getAllTeacherDetails(teacherDetails);
  };

  public query func getStudentDetail(username : Text) : async ?Types.StudentDetail {
    DetailsLib.getStudentDetail(studentDetails, username);
  };

  public func saveStudentDetail(username : Text, detail : Types.StudentDetail) : async () {
    DetailsLib.saveStudentDetail(studentDetails, username, detail);
  };

  public query func getAllStudentDetails() : async [(Text, Types.StudentDetail)] {
    DetailsLib.getAllStudentDetails(studentDetails);
  };

  // ---------------------------------------------------------------------------
  // Teacher-student queries (via studentEnrollments)
  // ---------------------------------------------------------------------------

  /// Returns all unique studentUserNames enrolled with the given teacher.
  public query func getTeacherStudents(teacherUserName : Text) : async [Text] {
    let seen = Map.empty<Text, Bool>();
    studentEnrollments.values()
      .filter(func(e) { e.teacherUserName == teacherUserName })
      .map(func(e) { e.studentUserName })
      .filter(func(su) {
        switch (seen.get(su)) {
          case (?_) { false };
          case null { seen.add(su, true); true };
        };
      })
      .toArray();
  };

  /// Returns all teacherUserNames for a given student (supports multi-teacher).
  public query func getStudentTeachers(studentUserName : Text) : async [Text] {
    studentEnrollments.values()
      .filter(func(e) { e.studentUserName == studentUserName })
      .map(func(e) { e.teacherUserName })
      .toArray();
  };

  // ---------------------------------------------------------------------------
  // ParentStudents relationship table
  // ---------------------------------------------------------------------------


  // ---------------------------------------------------------------------------
  // Teacher-scoped student profile editing
  // ---------------------------------------------------------------------------

  /// Update a student's profile and details record.
  /// Validates that the student is enrolled with the given teacher.
  public func updateStudentProfile(
    teacherUserName : Text,
    studentUserName : Text,
    profileUpdate : Types.ProfileUpdate,
    detailUpdate : Types.StudentDetail,
  ) : async { #ok; #err : Text } {
    // Validate teacher-student enrollment link
    let isEnrolled = studentEnrollments.values()
      .find(func(e) { e.teacherUserName == teacherUserName and e.studentUserName == studentUserName });
    switch (isEnrolled) {
      case null {
        return #err("Student " # studentUserName # " is not enrolled with teacher " # teacherUserName);
      };
      case (?_) {};
    };
    // Update profile
    switch (profiles.get(studentUserName)) {
      case null { return #err("Student profile not found: " # studentUserName) };
      case (?existing) {
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
        profiles.add(studentUserName, updated);
      };
    };
    // Update student details
    studentDetails.add(studentUserName, detailUpdate);
    #ok;
  };

  // ---------------------------------------------------------------------------
  // Teacher-scoped parent profile editing
  // ---------------------------------------------------------------------------

  /// Update a parent's profile.
  /// Validates that the parent is linked to a student enrolled with the teacher.
  public func updateParentProfile(
    teacherUserName : Text,
    parentUserName : Text,
    profileUpdate : Types.ProfileUpdate,
  ) : async { #ok; #err : Text } {
    // Validate: parent must be linked to at least one student enrolled with this teacher
    let linkedStudents = parentStudents.values()
      .filter(func(ps) { ps.parentUserName == parentUserName })
      .map(func(ps) { ps.studentUserName })
      .toArray();
    let hasEnrolledStudent = linkedStudents
      .find(func(su) {
        studentEnrollments.values()
          .find(func(e) { e.teacherUserName == teacherUserName and e.studentUserName == su }) != null
      });
    switch (hasEnrolledStudent) {
      case null {
        return #err("Parent " # parentUserName # " is not linked to any student enrolled with teacher " # teacherUserName);
      };
      case (?_) {};
    };
    // Update parent profile
    switch (profiles.get(parentUserName)) {
      case null { return #err("Parent profile not found: " # parentUserName) };
      case (?existing) {
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
        profiles.add(parentUserName, updated);
        #ok;
      };
    };
  };

  // ---------------------------------------------------------------------------
  // Teacher-scoped parent link management
  // ---------------------------------------------------------------------------

  /// Add a parent-student link, validating the student is enrolled with the teacher.
  public func addParentStudentLink(
    teacherUserName : Text,
    parentUserName : Text,
    studentUserName : Text,
  ) : async { #ok; #err : Text } {
    // Validate enrollment
    let isEnrolled = studentEnrollments.values()
      .find(func(e) { e.teacherUserName == teacherUserName and e.studentUserName == studentUserName });
    switch (isEnrolled) {
      case null {
        return #err("Student " # studentUserName # " is not enrolled with teacher " # teacherUserName);
      };
      case (?_) {};
    };
    let key = parentUserName # "|" # studentUserName;
    switch (parentStudents.get(key)) {
      case (?_) { #err("Link already exists") };
      case null {
        parentStudents.add(key, { parentUserName; studentUserName });
        #ok;
      };
    };
  };

  /// Remove a parent-student link, validating the student is enrolled with the teacher.
  public func removeParentStudentLink(
    teacherUserName : Text,
    parentUserName : Text,
    studentUserName : Text,
  ) : async { #ok; #err : Text } {
    // Validate enrollment
    let isEnrolled = studentEnrollments.values()
      .find(func(e) { e.teacherUserName == teacherUserName and e.studentUserName == studentUserName });
    switch (isEnrolled) {
      case null {
        return #err("Student " # studentUserName # " is not enrolled with teacher " # teacherUserName);
      };
      case (?_) {};
    };
    let key = parentUserName # "|" # studentUserName;
    switch (parentStudents.get(key)) {
      case null { #err("Link not found") };
      case (?_) {
        parentStudents.remove(key);
        #ok;
      };
    };
  };

  public query func getParentStudents(parentUserName : Text) : async [Types.ParentStudent] {
    parentStudents.entries()
      .filter(func((_, ps)) { ps.parentUserName == parentUserName })
      .map(func((_, ps)) { ps })
      .toArray();
  };

  public query func getStudentParents(studentUserName : Text) : async [Types.ParentStudent] {
    parentStudents.entries()
      .filter(func((_, ps)) { ps.studentUserName == studentUserName })
      .map(func((_, ps)) { ps })
      .toArray();
  };

  public func addParentStudent(parentUserName : Text, studentUserName : Text) : async Bool {
    let key = parentUserName # "|" # studentUserName;
    switch (parentStudents.get(key)) {
      case (?_) { false };
      case null {
        parentStudents.add(key, { parentUserName; studentUserName });
        true;
      };
    };
  };

  public func removeParentStudent(parentUserName : Text, studentUserName : Text) : async Bool {
    let key = parentUserName # "|" # studentUserName;
    switch (parentStudents.get(key)) {
      case null { false };
      case (?_) {
        parentStudents.remove(key);
        true;
      };
    };
  };

  public query func getAllParentStudents() : async [Types.ParentStudent] {
    parentStudents.values().toArray();
  };
};
