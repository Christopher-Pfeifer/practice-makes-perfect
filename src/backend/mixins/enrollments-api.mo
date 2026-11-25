import Map "mo:core/Map";
import Types "../types/auth";
import Set "mo:core/Set";

mixin (
  studentEnrollments : Map.Map<Text, Types.StudentEnrollment>,
) {

  public func saveStudentEnrollment(enrollmentId : Text, record : Types.StudentEnrollment) : async () {
    studentEnrollments.add(enrollmentId, record);
  };

  public query func getStudentEnrollment(enrollmentId : Text) : async ?Types.StudentEnrollment {
    studentEnrollments.get(enrollmentId);
  };

  public query func getEnrollmentsByStudent(studentUserName : Text) : async [Types.StudentEnrollment] {
    studentEnrollments.values()
      .filter(func(e) { e.studentUserName == studentUserName })
      .toArray();
  };

  public query func getEnrollmentsByTeacher(teacherUserName : Text) : async [Types.StudentEnrollment] {
    studentEnrollments.values()
      .filter(func(e) { e.teacherUserName == teacherUserName })
      .toArray();
  };

  /// Update an existing enrollment, validating that it belongs to the given teacher.
  public func updateStudentEnrollment(
    enrollmentId : Text,
    teacherUserName : Text,
    update : Types.StudentEnrollment,
  ) : async { #ok; #err : Text } {
    switch (studentEnrollments.get(enrollmentId)) {
      case null { #err("Enrollment not found: " # enrollmentId) };
      case (?existing) {
        if (existing.teacherUserName != teacherUserName) {
          return #err("Enrollment " # enrollmentId # " does not belong to teacher " # teacherUserName);
        };
        // Preserve the original enrollmentId and studentUserName
        let updated : Types.StudentEnrollment = {
          update with
          enrollmentId = existing.enrollmentId;
          studentUserName = existing.studentUserName;
          teacherUserName = existing.teacherUserName;
        };
        studentEnrollments.add(enrollmentId, updated);
        #ok;
      };
    };
  };

  public func deleteStudentEnrollment(enrollmentId : Text) : async Bool {
    switch (studentEnrollments.get(enrollmentId)) {
      case null { false };
      case (?_) {
        studentEnrollments.remove(enrollmentId);
        true;
      };
    };
  };

  public query func getAllEnrollments() : async [Types.StudentEnrollment] {
    studentEnrollments.values().toArray();
  };
};
