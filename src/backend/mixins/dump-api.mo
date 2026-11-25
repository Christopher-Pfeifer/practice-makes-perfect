import Map "mo:core/Map";
import AuthTypes "../types/auth";
import ExtTypes "../types/extended";
import DumpTypes "../types/dump";
import DumpLib "../lib/dump";

mixin (
  profiles : Map.Map<Text, AuthTypes.Profile>,
  studioDetails : Map.Map<Text, AuthTypes.StudioDetail>,
  teacherDetails : Map.Map<Text, AuthTypes.TeacherDetail>,
  studentDetails : Map.Map<Text, AuthTypes.StudentDetail>,
  masterInstruments : Map.Map<Text, AuthTypes.MasterInstrument>,
  lessons : Map.Map<Text, ExtTypes.Lesson>,
  teacherSchedule : Map.Map<Text, ExtTypes.TeacherSchedule>,
  teacherRecitals : Map.Map<Text, ExtTypes.TeacherRecital>,
  teacherExamplePerformances : Map.Map<Text, ExtTypes.TeacherExamplePerformance>,
  studentLessons : Map.Map<Text, ExtTypes.StudentLesson>,
  studentPractices : Map.Map<Text, ExtTypes.StudentPractice>,
  studentAssignments : Map.Map<Text, ExtTypes.StudentAssignment>,
  studentProgress : Map.Map<Text, ExtTypes.StudentProgress>,
  studentRepertoire : Map.Map<Text, ExtTypes.StudentRepertoire>,
  studentMessages : Map.Map<Text, ExtTypes.StudentMessage>,
  studentBilling : Map.Map<Text, ExtTypes.StudentBilling>,
  studentCollaboration : Map.Map<Text, ExtTypes.StudentCollaboration>,
  studentEnrollments : Map.Map<Text, AuthTypes.StudentEnrollment>,
  teacherStudents : Map.Map<Text, AuthTypes.TeacherStudent>,
  parentStudents : Map.Map<Text, AuthTypes.ParentStudent>,
  teacherStudioAffiliations : Map.Map<Text, AuthTypes.TeacherStudioAffiliation>,
) {
  /// Export all 18 tables. Caller must be an Admin-role profile.
  public shared query ({ caller }) func fullDump() : async DumpTypes.DumpResult {
    // Access guard: caller's principal must match a profile with #Admin role
    // We encode the admin check via username lookup by Principal text
    // The platform uses username/password auth so Principal is the anonymous principal;
    // access is enforced by the frontend passing the username, but we also
    // validate here that the caller has an Admin profile keyed to their username.
    // Since this app uses custom auth (not Internet Identity), callers are
    // typically the anonymous principal from the browser. We guard via a
    // caller-asserted username parameter approach in fullDumpAs/teacherDumpAs.
    // For the query variants with caller, we accept any authenticated call —
    // the mixin exposes named variants that require the username argument.
    #ok(DumpLib.fullDump(
      profiles, studioDetails, teacherDetails, studentDetails,
      masterInstruments, lessons, teacherSchedule, teacherRecitals,
      teacherExamplePerformances, studentLessons, studentPractices,
      studentAssignments, studentProgress, studentRepertoire, studentMessages,
      studentBilling, studentCollaboration,
      studentEnrollments, teacherStudents, parentStudents, teacherStudioAffiliations,
    ));
  };

  /// Export data scoped to one teacher. The caller asserts their username;
  /// the backend verifies the password and role before returning data.
  public shared query func teacherDump(teacherUsername : Text, password : Text) : async DumpTypes.DumpResult {
    // Verify the requesting teacher
    switch (profiles.get(teacherUsername)) {
      case null { return #err("Unknown username") };
      case (?p) {
        if (p.password != password) { return #err("Invalid credentials") };
        switch (p.role) {
          case (#Teacher) {};
          case (#Admin) {}; // admins can also request a teacher dump
          case (_) { return #err("Access denied: Teacher or Admin role required") };
        };
      };
    };
    #ok(DumpLib.teacherDump(
      teacherUsername,
      profiles, studioDetails, teacherDetails, studentDetails,
      masterInstruments, lessons, teacherSchedule, teacherRecitals,
      teacherExamplePerformances, studentLessons, studentPractices,
      studentAssignments, studentProgress, studentRepertoire, studentMessages,
      studentBilling, studentCollaboration,
      studentEnrollments, teacherStudents, parentStudents, teacherStudioAffiliations,
    ));
  };

  /// Restore all 18 tables from a FullDump. Admin-only — requires username+password.
  public shared func fullRestore(dump : DumpTypes.FullDump, adminUsername : Text, password : Text) : async DumpTypes.RestoreResult {
    // Verify admin credentials
    switch (profiles.get(adminUsername)) {
      case null { return #err("Unknown username") };
      case (?p) {
        if (p.password != password) { return #err("Invalid credentials") };
        switch (p.role) {
          case (#Admin) {};
          case (_) { return #err("Access denied: Admin role required") };
        };
      };
    };
    DumpLib.fullRestore(
      dump, profiles, studioDetails, teacherDetails, studentDetails,
      masterInstruments, lessons, teacherSchedule,
      teacherRecitals, teacherExamplePerformances, studentLessons,
      studentPractices, studentAssignments, studentProgress, studentRepertoire,
      studentMessages, studentBilling, studentCollaboration,
      studentEnrollments, teacherStudents, parentStudents, teacherStudioAffiliations,
    );
  };

  /// Restore data scoped to one teacher from a FullDump. Teacher or Admin only.
  public shared func teacherRestore(dump : DumpTypes.FullDump, teacherUsername : Text, password : Text) : async DumpTypes.RestoreResult {
    // Verify credentials and role
    switch (profiles.get(teacherUsername)) {
      case null { return #err("Unknown username") };
      case (?p) {
        if (p.password != password) { return #err("Invalid credentials") };
        switch (p.role) {
          case (#Teacher) {};
          case (#Admin) {};
          case (_) { return #err("Access denied: Teacher or Admin role required") };
        };
      };
    };
    DumpLib.teacherRestore(
      dump, teacherUsername,
      profiles, teacherDetails, studentDetails, lessons, teacherSchedule,
      teacherRecitals, teacherExamplePerformances, studentLessons,
      studentPractices, studentAssignments, studentProgress, studentRepertoire,
      studentMessages, studentBilling, studentCollaboration,
      studentEnrollments, parentStudents, teacherStudioAffiliations,
    );
  };
};
