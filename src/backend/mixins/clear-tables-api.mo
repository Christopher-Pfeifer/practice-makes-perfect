import Map "mo:core/Map";
import Types "../types/auth";
import ExtTypes "../types/extended";

mixin (
  profiles : Map.Map<Text, Types.Profile>,
  studioDetails : Map.Map<Text, Types.StudioDetail>,
  teacherDetails : Map.Map<Text, Types.TeacherDetail>,
  studentDetails : Map.Map<Text, Types.StudentDetail>,
  studentEnrollments : Map.Map<Text, Types.StudentEnrollment>,
  teacherStudents : Map.Map<Text, Types.TeacherStudent>,
  parentStudents : Map.Map<Text, Types.ParentStudent>,
  teacherStudioAffiliations : Map.Map<Text, Types.TeacherStudioAffiliation>,
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
) {
  public func clearProfiles() : async () {
    let keys = profiles.keys().toArray();
    for (k in keys.values()) { profiles.remove(k) };
  };

  public func clearStudioDetails() : async () {
    let keys = studioDetails.keys().toArray();
    for (k in keys.values()) { studioDetails.remove(k) };
  };

  public func clearTeacherDetails() : async () {
    let keys = teacherDetails.keys().toArray();
    for (k in keys.values()) { teacherDetails.remove(k) };
  };

  public func clearStudentDetails() : async () {
    let keys = studentDetails.keys().toArray();
    for (k in keys.values()) { studentDetails.remove(k) };
  };

  public func clearTeacherSchedule() : async () {
    let keys = teacherSchedule.keys().toArray();
    for (k in keys.values()) { teacherSchedule.remove(k) };
  };

  public func clearTeacherRecitals() : async () {
    let keys = teacherRecitals.keys().toArray();
    for (k in keys.values()) { teacherRecitals.remove(k) };
  };

  public func clearTeacherExamplePerformances() : async () {
    let keys = teacherExamplePerformances.keys().toArray();
    for (k in keys.values()) { teacherExamplePerformances.remove(k) };
  };

  public func clearStudentLessons() : async () {
    let keys = studentLessons.keys().toArray();
    for (k in keys.values()) { studentLessons.remove(k) };
  };

  public func clearStudentPractices() : async () {
    let keys = studentPractices.keys().toArray();
    for (k in keys.values()) { studentPractices.remove(k) };
  };

  public func clearStudentAssignments() : async () {
    let keys = studentAssignments.keys().toArray();
    for (k in keys.values()) { studentAssignments.remove(k) };
  };

  public func clearStudentProgress() : async () {
    let keys = studentProgress.keys().toArray();
    for (k in keys.values()) { studentProgress.remove(k) };
  };

  public func clearStudentRepertoire() : async () {
    let keys = studentRepertoire.keys().toArray();
    for (k in keys.values()) { studentRepertoire.remove(k) };
  };

  public func clearStudentMessages() : async () {
    let keys = studentMessages.keys().toArray();
    for (k in keys.values()) { studentMessages.remove(k) };
  };

  public func clearStudentBilling() : async () {
    let keys = studentBilling.keys().toArray();
    for (k in keys.values()) { studentBilling.remove(k) };
  };

  public func clearStudentCollaboration() : async () {
    let keys = studentCollaboration.keys().toArray();
    for (k in keys.values()) { studentCollaboration.remove(k) };
  };

  public func clearStudentEnrollments() : async () {
    let keys = studentEnrollments.keys().toArray();
    for (k in keys.values()) { studentEnrollments.remove(k) };
  };

  public func clearTeacherStudents() : async () {
    let keys = teacherStudents.keys().toArray();
    for (k in keys.values()) { teacherStudents.remove(k) };
  };

  public func clearParentStudents() : async () {
    let keys = parentStudents.keys().toArray();
    for (k in keys.values()) { parentStudents.remove(k) };
  };

  public func clearTeacherStudioAffiliations() : async () {
    let keys = teacherStudioAffiliations.keys().toArray();
    for (k in keys.values()) { teacherStudioAffiliations.remove(k) };
  };
};
