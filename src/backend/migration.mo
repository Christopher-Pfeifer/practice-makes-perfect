import Map "mo:core/Map";
import Types "types/auth";
import ExtTypes "types/extended";
import Facts "types/facts";

module {
  // Old StudentDetail already had notes field in the previously deployed version
  type OldStudentDetail = { notes : Text };

  // Old actor state — all stable fields from the previous deploy
  // All fields identical to current except studentDetails uses OldStudentDetail
  type OldActor = {
    profiles : Map.Map<Text, Types.Profile>;
    studioDetails : Map.Map<Text, Types.StudioDetail>;
    teacherDetails : Map.Map<Text, Types.TeacherDetail>;
    studentDetails : Map.Map<Text, OldStudentDetail>;
    masterInstruments : Map.Map<Text, Types.MasterInstrument>;
    teacherSchedule : Map.Map<Text, ExtTypes.TeacherSchedule>;
    lessons : Map.Map<Text, ExtTypes.Lesson>;
    teacherRecitals : Map.Map<Text, ExtTypes.TeacherRecital>;
    teacherExamplePerformances : Map.Map<Text, ExtTypes.TeacherExamplePerformance>;
    studentLessons : Map.Map<Text, ExtTypes.StudentLesson>;
    studentPractices : Map.Map<Text, ExtTypes.StudentPractice>;
    studentAssignments : Map.Map<Text, ExtTypes.StudentAssignment>;
    studentProgress : Map.Map<Text, ExtTypes.StudentProgress>;
    studentRepertoire : Map.Map<Text, ExtTypes.StudentRepertoire>;
    studentMessages : Map.Map<Text, ExtTypes.StudentMessage>;
    studentBilling : Map.Map<Text, ExtTypes.StudentBilling>;
    studentCollaboration : Map.Map<Text, ExtTypes.StudentCollaboration>;
    onboardingState : { var nextEnrollmentId : Nat };
    studentEnrollments : Map.Map<Text, Types.StudentEnrollment>;
    teacherStudents : Map.Map<Text, Types.TeacherStudent>;
    parentStudents : Map.Map<Text, Types.ParentStudent>;
    teacherStudioAffiliations : Map.Map<Text, Types.TeacherStudioAffiliation>;
    factSkillLevels : Map.Map<Text, Facts.FactSkillLevel>;
    factTheoryLevels : Map.Map<Text, Facts.FactTheoryLevel>;
    factVoiceTypes : Map.Map<Text, Facts.FactVoiceType>;
    factRoles : Map.Map<Text, Facts.FactRole>;
    factAssignmentStatuses : Map.Map<Text, Facts.FactAssignmentStatus>;
    factBillingStatuses : Map.Map<Text, Facts.FactBillingStatus>;
    factRepertoireStatuses : Map.Map<Text, Facts.FactRepertoireStatus>;
    factPriorities : Map.Map<Text, Facts.FactPriority>;
    factGenres : Map.Map<Text, Facts.FactGenre>;
    factSkillCategories : Map.Map<Text, Facts.FactSkillCategory>;
    factGroupTypes : Map.Map<Text, Facts.FactGroupType>;
    factCertifications : Map.Map<Text, Facts.FactCertification>;
    factEnsembleTypes : Map.Map<Text, Facts.FactEnsembleType>;
    factStates : Map.Map<Text, Facts.FactState>;
  };

  // New actor state — identical to OldActor but studentDetails uses the new type with notes field
  type NewActor = {
    profiles : Map.Map<Text, Types.Profile>;
    studioDetails : Map.Map<Text, Types.StudioDetail>;
    teacherDetails : Map.Map<Text, Types.TeacherDetail>;
    studentDetails : Map.Map<Text, Types.StudentDetail>;
    masterInstruments : Map.Map<Text, Types.MasterInstrument>;
    teacherSchedule : Map.Map<Text, ExtTypes.TeacherSchedule>;
    lessons : Map.Map<Text, ExtTypes.Lesson>;
    teacherRecitals : Map.Map<Text, ExtTypes.TeacherRecital>;
    teacherExamplePerformances : Map.Map<Text, ExtTypes.TeacherExamplePerformance>;
    studentLessons : Map.Map<Text, ExtTypes.StudentLesson>;
    studentPractices : Map.Map<Text, ExtTypes.StudentPractice>;
    studentAssignments : Map.Map<Text, ExtTypes.StudentAssignment>;
    studentProgress : Map.Map<Text, ExtTypes.StudentProgress>;
    studentRepertoire : Map.Map<Text, ExtTypes.StudentRepertoire>;
    studentMessages : Map.Map<Text, ExtTypes.StudentMessage>;
    studentBilling : Map.Map<Text, ExtTypes.StudentBilling>;
    studentCollaboration : Map.Map<Text, ExtTypes.StudentCollaboration>;
    onboardingState : { var nextEnrollmentId : Nat };
    studentEnrollments : Map.Map<Text, Types.StudentEnrollment>;
    teacherStudents : Map.Map<Text, Types.TeacherStudent>;
    parentStudents : Map.Map<Text, Types.ParentStudent>;
    teacherStudioAffiliations : Map.Map<Text, Types.TeacherStudioAffiliation>;
    factSkillLevels : Map.Map<Text, Facts.FactSkillLevel>;
    factTheoryLevels : Map.Map<Text, Facts.FactTheoryLevel>;
    factVoiceTypes : Map.Map<Text, Facts.FactVoiceType>;
    factRoles : Map.Map<Text, Facts.FactRole>;
    factAssignmentStatuses : Map.Map<Text, Facts.FactAssignmentStatus>;
    factBillingStatuses : Map.Map<Text, Facts.FactBillingStatus>;
    factRepertoireStatuses : Map.Map<Text, Facts.FactRepertoireStatus>;
    factPriorities : Map.Map<Text, Facts.FactPriority>;
    factGenres : Map.Map<Text, Facts.FactGenre>;
    factSkillCategories : Map.Map<Text, Facts.FactSkillCategory>;
    factGroupTypes : Map.Map<Text, Facts.FactGroupType>;
    factCertifications : Map.Map<Text, Facts.FactCertification>;
    factEnsembleTypes : Map.Map<Text, Facts.FactEnsembleType>;
    factStates : Map.Map<Text, Facts.FactState>;
  };

  public func run(old : OldActor) : NewActor {
    // Migrate studentDetails: add notes = "" to every existing empty record
    let migratedStudentDetails = old.studentDetails.map<Text, OldStudentDetail, Types.StudentDetail>(
      func(_key, _oldDetail) { { notes = "" } }
    );
    {
      profiles = old.profiles;
      studioDetails = old.studioDetails;
      teacherDetails = old.teacherDetails;
      studentDetails = migratedStudentDetails;
      masterInstruments = old.masterInstruments;
      teacherSchedule = old.teacherSchedule;
      lessons = old.lessons;
      teacherRecitals = old.teacherRecitals;
      teacherExamplePerformances = old.teacherExamplePerformances;
      studentLessons = old.studentLessons;
      studentPractices = old.studentPractices;
      studentAssignments = old.studentAssignments;
      studentProgress = old.studentProgress;
      studentRepertoire = old.studentRepertoire;
      studentMessages = old.studentMessages;
      studentBilling = old.studentBilling;
      studentCollaboration = old.studentCollaboration;
      onboardingState = old.onboardingState;
      studentEnrollments = old.studentEnrollments;
      teacherStudents = old.teacherStudents;
      parentStudents = old.parentStudents;
      teacherStudioAffiliations = old.teacherStudioAffiliations;
      factSkillLevels = old.factSkillLevels;
      factTheoryLevels = old.factTheoryLevels;
      factVoiceTypes = old.factVoiceTypes;
      factRoles = old.factRoles;
      factAssignmentStatuses = old.factAssignmentStatuses;
      factBillingStatuses = old.factBillingStatuses;
      factRepertoireStatuses = old.factRepertoireStatuses;
      factPriorities = old.factPriorities;
      factGenres = old.factGenres;
      factSkillCategories = old.factSkillCategories;
      factGroupTypes = old.factGroupTypes;
      factCertifications = old.factCertifications;
      factEnsembleTypes = old.factEnsembleTypes;
      factStates = old.factStates;
    };
  };
};
