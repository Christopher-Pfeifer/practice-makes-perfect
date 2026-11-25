

import Map "mo:core/Map";
import Types "types/auth";
import ExtTypes "types/extended";
import Facts "types/facts";

import AuthMixin "mixins/auth-api";
import DetailsMixin "mixins/details-api";
import InstrumentsMixin "mixins/instruments-api";
import ScheduleMixin "mixins/schedule-api";
import TeacherExtMixin "mixins/teacher-extended-api";
import StudentExtMixin "mixins/student-extended-api";
import AnalyticsMixin "mixins/analytics-api";
import DumpMixin "mixins/dump-api";
import SkillLevelsMixin "mixins/skill-levels-api";
import TheoryLevelsMixin "mixins/theory-levels-api";
import VoiceTypesMixin "mixins/voice-types-api";
import FactRolesMixin "mixins/fact-roles-api";
import AssignmentStatusesMixin "mixins/assignment-statuses-api";
import BillingStatusesMixin "mixins/billing-statuses-api";
import RepertoireStatusesMixin "mixins/repertoire-statuses-api";
import PrioritiesMixin "mixins/priorities-api";
import GenresMixin "mixins/genres-api";
import SkillCategoriesMixin "mixins/skill-categories-api";
import GroupTypesMixin "mixins/group-types-api";
import CertificationsMixin "mixins/certifications-api";
import EnsembleTypesMixin "mixins/ensemble-types-api";
import FactStatesMixin "mixins/fact-states-api";
import ClearTablesMixin "mixins/clear-tables-api";
import EnrollmentsMixin "mixins/enrollments-api";
import TeacherStudioAffiliationsMixin "mixins/teacher-studio-affiliations-api";










import Migration "migration";
import OnboardingMixin "mixins/onboarding-api";

(with migration = Migration.run)
actor {
  // --- Core tables (existing) ---
  let profiles = Map.empty<Text, Types.Profile>();
  let studioDetails = Map.empty<Text, Types.StudioDetail>();
  let teacherDetails = Map.empty<Text, Types.TeacherDetail>();
  let studentDetails = Map.empty<Text, Types.StudentDetail>();
  let masterInstruments = Map.empty<Text, Types.MasterInstrument>();

  // --- Schedule & lessons tables ---
  let teacherSchedule = Map.empty<Text, ExtTypes.TeacherSchedule>();
  let lessons = Map.empty<Text, ExtTypes.Lesson>();

  // --- Teacher extended tables ---
  let teacherRecitals = Map.empty<Text, ExtTypes.TeacherRecital>();
  let teacherExamplePerformances = Map.empty<Text, ExtTypes.TeacherExamplePerformance>();

  // --- Student extended tables ---
  let studentLessons = Map.empty<Text, ExtTypes.StudentLesson>();
  let studentPractices = Map.empty<Text, ExtTypes.StudentPractice>();
  let studentAssignments = Map.empty<Text, ExtTypes.StudentAssignment>();
  let studentProgress = Map.empty<Text, ExtTypes.StudentProgress>();
  let studentRepertoire = Map.empty<Text, ExtTypes.StudentRepertoire>();
  let studentMessages = Map.empty<Text, ExtTypes.StudentMessage>();
  let studentBilling = Map.empty<Text, ExtTypes.StudentBilling>();
  let studentCollaboration = Map.empty<Text, ExtTypes.StudentCollaboration>();

  // --- Onboarding counter ---
  let onboardingState = { var nextEnrollmentId : Nat = 0 };

  // --- Affiliation relationship tables ---
  let studentEnrollments = Map.empty<Text, Types.StudentEnrollment>();
  let teacherStudents = Map.empty<Text, Types.TeacherStudent>();
  let parentStudents = Map.empty<Text, Types.ParentStudent>();
  let teacherStudioAffiliations = Map.empty<Text, Types.TeacherStudioAffiliation>();

  // --- FACT tables ---
  let factSkillLevels = Map.empty<Text, Facts.FactSkillLevel>();
  let factTheoryLevels = Map.empty<Text, Facts.FactTheoryLevel>();
  let factVoiceTypes = Map.empty<Text, Facts.FactVoiceType>();
  let factRoles = Map.empty<Text, Facts.FactRole>();
  let factAssignmentStatuses = Map.empty<Text, Facts.FactAssignmentStatus>();
  let factBillingStatuses = Map.empty<Text, Facts.FactBillingStatus>();
  let factRepertoireStatuses = Map.empty<Text, Facts.FactRepertoireStatus>();
  let factPriorities = Map.empty<Text, Facts.FactPriority>();
  let factGenres = Map.empty<Text, Facts.FactGenre>();
  let factSkillCategories = Map.empty<Text, Facts.FactSkillCategory>();
  let factGroupTypes = Map.empty<Text, Facts.FactGroupType>();
  let factCertifications = Map.empty<Text, Facts.FactCertification>();
  let factEnsembleTypes = Map.empty<Text, Facts.FactEnsembleType>();
  let factStates = Map.empty<Text, Facts.FactState>();

  // Seed default instruments on first deploy
  if (masterInstruments.isEmpty()) {
    let defaults : [(Text, Nat)] = [
      ("Unassigned", 0),
      ("Piano", 1),
      ("Guitar", 2),
      ("Bass Guitar", 3),
      ("Electric Guitar", 4),
      ("Acoustic Guitar", 5),
      ("Violin", 6),
      ("Viola", 7),
      ("Cello", 8),
      ("Double Bass", 9),
      ("Flute", 10),
      ("Clarinet", 11),
      ("Oboe", 12),
      ("Bassoon", 13),
      ("Saxophone", 14),
      ("Trumpet", 15),
      ("Trombone", 16),
      ("French Horn", 17),
      ("Tuba", 18),
      ("Drums", 19),
      ("Percussion", 20),
      ("Harp", 21),
      ("Ukulele", 22),
      ("Banjo", 23),
      ("Mandolin", 24),
      ("Voice/Vocals", 25),
    ];
    for ((name, sortOrder) in defaults.values()) {
      masterInstruments.add(name, { name; sortOrder });
    };
  };

  // Seed FACT tables on first deploy
  if (factSkillLevels.isEmpty()) {
    let defaults : [(Text, Nat)] = [
      ("Beginner", 1), ("Elementary", 2), ("Intermediate", 3),
      ("Advanced", 4), ("Pre-College", 5), ("Performance", 6),
    ];
    for ((name, sortOrder) in defaults.values()) {
      factSkillLevels.add(name, { name; sortOrder });
    };
  };

  if (factTheoryLevels.isEmpty()) {
    let defaults : [(Text, Nat)] = [
      ("Level 1", 1), ("Level 2", 2), ("Level 3", 3), ("Level 4", 4), ("Level 5", 5),
    ];
    for ((name, sortOrder) in defaults.values()) {
      factTheoryLevels.add(name, { name; sortOrder });
    };
  };

  if (factVoiceTypes.isEmpty()) {
    let defaults : [(Text, Nat)] = [
      ("Soprano", 1), ("Mezzo-Soprano", 2), ("Alto", 3),
      ("Tenor", 4), ("Baritone", 5), ("Bass", 6),
    ];
    for ((name, sortOrder) in defaults.values()) {
      factVoiceTypes.add(name, { name; sortOrder });
    };
  };

  if (factRoles.isEmpty()) {
    let defaults : [(Text, Nat)] = [
      ("studio", 1), ("teacher", 2), ("student", 3), ("parent", 4),
    ];
    for ((name, sortOrder) in defaults.values()) {
      factRoles.add(name, { name; sortOrder });
    };
  };

  if (factAssignmentStatuses.isEmpty()) {
    let defaults : [(Text, Nat)] = [
      ("Pending", 1), ("In Progress", 2), ("Complete", 3), ("Overdue", 4),
    ];
    for ((name, sortOrder) in defaults.values()) {
      factAssignmentStatuses.add(name, { name; sortOrder });
    };
  };

  if (factBillingStatuses.isEmpty()) {
    let defaults : [(Text, Nat)] = [
      ("Paid", 1), ("Unpaid", 2), ("Partial", 3), ("Overdue", 4), ("Waived", 5),
    ];
    for ((name, sortOrder) in defaults.values()) {
      factBillingStatuses.add(name, { name; sortOrder });
    };
  };

  if (factRepertoireStatuses.isEmpty()) {
    let defaults : [(Text, Nat)] = [
      ("Learning", 1), ("Polishing", 2), ("Performance Ready", 3), ("Retired", 4),
    ];
    for ((name, sortOrder) in defaults.values()) {
      factRepertoireStatuses.add(name, { name; sortOrder });
    };
  };

  if (factPriorities.isEmpty()) {
    let defaults : [(Text, Nat)] = [
      ("High", 1), ("Medium", 2), ("Low", 3),
    ];
    for ((name, sortOrder) in defaults.values()) {
      factPriorities.add(name, { name; sortOrder });
    };
  };

  if (factGenres.isEmpty()) {
    let defaults : [(Text, Nat)] = [
      ("Classical", 1), ("Jazz", 2), ("Folk", 3), ("Contemporary", 4),
      ("Pop", 5), ("Musical Theatre", 6), ("World", 7), ("Sacred", 8), ("Original", 9),
    ];
    for ((name, sortOrder) in defaults.values()) {
      factGenres.add(name, { name; sortOrder });
    };
  };

  if (factSkillCategories.isEmpty()) {
    let defaults : [(Text, Nat)] = [
      ("Technique", 1), ("Sight-Reading", 2), ("Theory", 3), ("Performance", 4),
      ("Ear Training", 5), ("Rhythm", 6), ("Improvisation", 7),
    ];
    for ((name, sortOrder) in defaults.values()) {
      factSkillCategories.add(name, { name; sortOrder });
    };
  };

  if (factGroupTypes.isEmpty()) {
    let defaults : [(Text, Nat)] = [
      ("Duet", 1), ("Trio", 2), ("Quartet", 3), ("Ensemble", 4),
      ("Band", 5), ("Choir", 6), ("Orchestra", 7), ("Jazz Combo", 8),
    ];
    for ((name, sortOrder) in defaults.values()) {
      factGroupTypes.add(name, { name; sortOrder });
    };
  };

  if (factCertifications.isEmpty()) {
    let defaults : [(Text, Nat)] = [
      ("MTNA", 1), ("ABRSM", 2), ("Suzuki Book 1", 3), ("Suzuki Book 2", 4),
      ("Suzuki Book 3", 5), ("Suzuki Book 4", 6), ("Suzuki Book 5", 7),
      ("Suzuki Book 6", 8), ("Suzuki Book 7", 9), ("Suzuki Book 8", 10),
      ("Suzuki Book 9", 11), ("Suzuki Book 10", 12), ("RCM", 13),
      ("Orff", 14), ("Kodaly", 15),
    ];
    for ((name, sortOrder) in defaults.values()) {
      factCertifications.add(name, { name; sortOrder });
    };
  };

  if (factEnsembleTypes.isEmpty()) {
    let defaults : [(Text, Nat)] = [
      ("String Ensemble", 1), ("Jazz Combo", 2), ("Brass Choir", 3),
      ("Rock Ensemble", 4), ("Chamber Group", 5), ("Vocal Ensemble", 6),
      ("Percussion Ensemble", 7), ("Wind Ensemble", 8),
    ];
    for ((name, sortOrder) in defaults.values()) {
      factEnsembleTypes.add(name, { name; sortOrder });
    };
  };

  if (factStates.isEmpty()) {
    let defaults : [(Text, Nat)] = [
      ("Alabama", 1), ("Alaska", 2), ("Arizona", 3), ("Arkansas", 4),
      ("California", 5), ("Colorado", 6), ("Connecticut", 7), ("Delaware", 8),
      ("Florida", 9), ("Georgia", 10), ("Hawaii", 11), ("Idaho", 12),
      ("Illinois", 13), ("Indiana", 14), ("Iowa", 15), ("Kansas", 16),
      ("Kentucky", 17), ("Louisiana", 18), ("Maine", 19), ("Maryland", 20),
      ("Massachusetts", 21), ("Michigan", 22), ("Minnesota", 23), ("Mississippi", 24),
      ("Missouri", 25), ("Montana", 26), ("Nebraska", 27), ("Nevada", 28),
      ("New Hampshire", 29), ("New Jersey", 30), ("New Mexico", 31), ("New York", 32),
      ("North Carolina", 33), ("North Dakota", 34), ("Ohio", 35), ("Oklahoma", 36),
      ("Oregon", 37), ("Pennsylvania", 38), ("Rhode Island", 39), ("South Carolina", 40),
      ("South Dakota", 41), ("Tennessee", 42), ("Texas", 43), ("Utah", 44),
      ("Vermont", 45), ("Virginia", 46), ("Washington", 47), ("West Virginia", 48),
      ("Wisconsin", 49), ("Wyoming", 50),
    ];
    for ((name, sortOrder) in defaults.values()) {
      factStates.add(name, { name; sortOrder });
    };
  };

  include AuthMixin(profiles, teacherDetails);
  include DetailsMixin(profiles, studioDetails, teacherDetails, studentDetails, studentEnrollments, parentStudents);
  include EnrollmentsMixin(studentEnrollments);
  include TeacherStudioAffiliationsMixin(profiles, teacherStudioAffiliations);
  include OnboardingMixin(profiles, studentEnrollments, parentStudents, onboardingState);
  include InstrumentsMixin(masterInstruments);
  include ScheduleMixin(teacherSchedule, lessons);
  include TeacherExtMixin(teacherRecitals, teacherExamplePerformances);
  include StudentExtMixin(
    studentLessons,
    studentPractices,
    studentAssignments,
    studentProgress,
    studentRepertoire,
    studentMessages,
    studentBilling,
    studentCollaboration,
  );
  include AnalyticsMixin(profiles, teacherDetails, studentDetails, studentEnrollments, parentStudents, teacherStudioAffiliations);
  include SkillLevelsMixin(factSkillLevels);
  include TheoryLevelsMixin(factTheoryLevels);
  include VoiceTypesMixin(factVoiceTypes);
  include FactRolesMixin(factRoles);
  include AssignmentStatusesMixin(factAssignmentStatuses);
  include BillingStatusesMixin(factBillingStatuses);
  include RepertoireStatusesMixin(factRepertoireStatuses);
  include PrioritiesMixin(factPriorities);
  include GenresMixin(factGenres);
  include SkillCategoriesMixin(factSkillCategories);
  include GroupTypesMixin(factGroupTypes);
  include CertificationsMixin(factCertifications);
  include EnsembleTypesMixin(factEnsembleTypes);
  include FactStatesMixin(factStates);
  include ClearTablesMixin(
    profiles,
    studioDetails,
    teacherDetails,
    studentDetails,
    studentEnrollments,
    teacherStudents,
    parentStudents,
    teacherStudioAffiliations,
    teacherSchedule,
    teacherRecitals,
    teacherExamplePerformances,
    studentLessons,
    studentPractices,
    studentAssignments,
    studentProgress,
    studentRepertoire,
    studentMessages,
    studentBilling,
    studentCollaboration,
  );
  include DumpMixin(
    profiles,
    studioDetails,
    teacherDetails,
    studentDetails,
    masterInstruments,
    lessons,
    teacherSchedule,
    teacherRecitals,
    teacherExamplePerformances,
    studentLessons,
    studentPractices,
    studentAssignments,
    studentProgress,
    studentRepertoire,
    studentMessages,
    studentBilling,
    studentCollaboration,
    studentEnrollments,
    teacherStudents,
    parentStudents,
    teacherStudioAffiliations,
  );
};


