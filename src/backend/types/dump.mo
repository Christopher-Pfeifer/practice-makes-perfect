import AuthTypes "auth";
import ExtTypes "extended";

module {
  /// The unified dump record — same shape for both fullDump and teacherDump.
  /// Every field is an array of (key, record) pairs matching the canister maps.
  public type FullDump = {
    profiles : [(Text, AuthTypes.Profile)];
    studioDetails : [(Text, AuthTypes.StudioDetail)];
    teacherDetails : [(Text, AuthTypes.TeacherDetail)];
    studentDetails : [(Text, AuthTypes.StudentDetail)];
    masterInstruments : [(Text, AuthTypes.MasterInstrument)];
    lessons : [(Text, ExtTypes.Lesson)];
    teacherSchedule : [(Text, ExtTypes.TeacherSchedule)];
    teacherRecitals : [(Text, ExtTypes.TeacherRecital)];
    teacherExamplePerformances : [(Text, ExtTypes.TeacherExamplePerformance)];
    studentLessons : [(Text, ExtTypes.StudentLesson)];
    studentPractices : [(Text, ExtTypes.StudentPractice)];
    studentAssignments : [(Text, ExtTypes.StudentAssignment)];
    studentProgress : [(Text, ExtTypes.StudentProgress)];
    studentRepertoire : [(Text, ExtTypes.StudentRepertoire)];
    studentMessages : [(Text, ExtTypes.StudentMessage)];
    studentBilling : [(Text, ExtTypes.StudentBilling)];
    studentCollaboration : [(Text, ExtTypes.StudentCollaboration)];
    studentEnrollments : [(Text, AuthTypes.StudentEnrollment)];
    teacherStudents : [(Text, AuthTypes.TeacherStudent)];
    parentStudents : [(Text, AuthTypes.ParentStudent)];
    teacherStudioAffiliations : [(Text, AuthTypes.TeacherStudioAffiliation)];
  };

  public type DumpResult = { #ok : FullDump; #err : Text };
  public type RestoreResult = { #ok; #err : Text };
};
