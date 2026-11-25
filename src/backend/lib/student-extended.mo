import Map "mo:core/Map";
import Types "../types/extended";

module {
  public type StudentLesson = Types.StudentLesson;
  public type StudentPractice = Types.StudentPractice;
  public type StudentAssignment = Types.StudentAssignment;
  public type StudentProgress = Types.StudentProgress;
  public type StudentRepertoire = Types.StudentRepertoire;
  public type StudentMessage = Types.StudentMessage;
  public type StudentBilling = Types.StudentBilling;
  public type StudentCollaboration = Types.StudentCollaboration;

  // --- StudentLessons ---

  public func getStudentLesson(
    map : Map.Map<Text, StudentLesson>,
    lessonEntryId : Text,
  ) : ?StudentLesson {
    map.get(lessonEntryId);
  };

  public func saveStudentLesson(
    map : Map.Map<Text, StudentLesson>,
    lessonEntryId : Text,
    record : StudentLesson,
  ) {
    map.add(lessonEntryId, record);
  };

  public func getAllStudentLessons(
    map : Map.Map<Text, StudentLesson>,
  ) : [(Text, StudentLesson)] {
    map.toArray();
  };

  public func getLessonsByStudent(
    map : Map.Map<Text, StudentLesson>,
    studentUsername : Text,
  ) : [(Text, StudentLesson)] {
    map.toArray().filter(func((_, v)) { v.studentUsername == studentUsername });
  };

  public func deleteStudentLesson(
    map : Map.Map<Text, StudentLesson>,
    lessonEntryId : Text,
  ) : Bool {
    switch (map.get(lessonEntryId)) {
      case null { false };
      case (?_) { map.remove(lessonEntryId); true };
    };
  };

  // --- StudentPractices ---

  public func getStudentPractice(
    map : Map.Map<Text, StudentPractice>,
    practiceId : Text,
  ) : ?StudentPractice {
    map.get(practiceId);
  };

  public func saveStudentPractice(
    map : Map.Map<Text, StudentPractice>,
    practiceId : Text,
    record : StudentPractice,
  ) {
    map.add(practiceId, record);
  };

  public func getAllStudentPractices(
    map : Map.Map<Text, StudentPractice>,
  ) : [(Text, StudentPractice)] {
    map.toArray();
  };

  public func getPracticesByStudent(
    map : Map.Map<Text, StudentPractice>,
    studentUsername : Text,
  ) : [(Text, StudentPractice)] {
    map.toArray().filter(func((_, v)) { v.studentUsername == studentUsername });
  };

  public func deleteStudentPractice(
    map : Map.Map<Text, StudentPractice>,
    practiceId : Text,
  ) : Bool {
    switch (map.get(practiceId)) {
      case null { false };
      case (?_) { map.remove(practiceId); true };
    };
  };

  // --- StudentAssignments ---

  public func getStudentAssignment(
    map : Map.Map<Text, StudentAssignment>,
    assignmentId : Text,
  ) : ?StudentAssignment {
    map.get(assignmentId);
  };

  public func saveStudentAssignment(
    map : Map.Map<Text, StudentAssignment>,
    assignmentId : Text,
    record : StudentAssignment,
  ) {
    map.add(assignmentId, record);
  };

  public func getAllStudentAssignments(
    map : Map.Map<Text, StudentAssignment>,
  ) : [(Text, StudentAssignment)] {
    map.toArray();
  };

  public func getAssignmentsByStudent(
    map : Map.Map<Text, StudentAssignment>,
    studentUsername : Text,
  ) : [(Text, StudentAssignment)] {
    map.toArray().filter(func((_, v)) { v.studentUsername == studentUsername });
  };

  public func deleteStudentAssignment(
    map : Map.Map<Text, StudentAssignment>,
    assignmentId : Text,
  ) : Bool {
    switch (map.get(assignmentId)) {
      case null { false };
      case (?_) { map.remove(assignmentId); true };
    };
  };

  // --- StudentProgress ---

  public func getStudentProgress(
    map : Map.Map<Text, StudentProgress>,
    progressId : Text,
  ) : ?StudentProgress {
    map.get(progressId);
  };

  public func saveStudentProgress(
    map : Map.Map<Text, StudentProgress>,
    progressId : Text,
    record : StudentProgress,
  ) {
    map.add(progressId, record);
  };

  public func getAllStudentProgress(
    map : Map.Map<Text, StudentProgress>,
  ) : [(Text, StudentProgress)] {
    map.toArray();
  };

  public func getProgressByStudent(
    map : Map.Map<Text, StudentProgress>,
    studentUsername : Text,
  ) : [(Text, StudentProgress)] {
    map.toArray().filter(func((_, v)) { v.studentUsername == studentUsername });
  };

  public func deleteStudentProgress(
    map : Map.Map<Text, StudentProgress>,
    progressId : Text,
  ) : Bool {
    switch (map.get(progressId)) {
      case null { false };
      case (?_) { map.remove(progressId); true };
    };
  };

  // --- StudentRepertoire ---

  public func getStudentRepertoire(
    map : Map.Map<Text, StudentRepertoire>,
    repertoireId : Text,
  ) : ?StudentRepertoire {
    map.get(repertoireId);
  };

  public func saveStudentRepertoire(
    map : Map.Map<Text, StudentRepertoire>,
    repertoireId : Text,
    record : StudentRepertoire,
  ) {
    map.add(repertoireId, record);
  };

  public func getAllStudentRepertoire(
    map : Map.Map<Text, StudentRepertoire>,
  ) : [(Text, StudentRepertoire)] {
    map.toArray();
  };

  public func getRepertoireByStudent(
    map : Map.Map<Text, StudentRepertoire>,
    studentUsername : Text,
  ) : [(Text, StudentRepertoire)] {
    map.toArray().filter(func((_, v)) { v.studentUsername == studentUsername });
  };

  public func deleteStudentRepertoire(
    map : Map.Map<Text, StudentRepertoire>,
    repertoireId : Text,
  ) : Bool {
    switch (map.get(repertoireId)) {
      case null { false };
      case (?_) { map.remove(repertoireId); true };
    };
  };

  // --- StudentMessages ---

  public func getStudentMessage(
    map : Map.Map<Text, StudentMessage>,
    messageId : Text,
  ) : ?StudentMessage {
    map.get(messageId);
  };

  public func saveStudentMessage(
    map : Map.Map<Text, StudentMessage>,
    messageId : Text,
    record : StudentMessage,
  ) {
    map.add(messageId, record);
  };

  public func getAllStudentMessages(
    map : Map.Map<Text, StudentMessage>,
  ) : [(Text, StudentMessage)] {
    map.toArray();
  };

  public func getMessagesByStudent(
    map : Map.Map<Text, StudentMessage>,
    studentUsername : Text,
  ) : [(Text, StudentMessage)] {
    map.toArray().filter(func((_, v)) { v.studentUsername == studentUsername });
  };

  public func deleteStudentMessage(
    map : Map.Map<Text, StudentMessage>,
    messageId : Text,
  ) : Bool {
    switch (map.get(messageId)) {
      case null { false };
      case (?_) { map.remove(messageId); true };
    };
  };

  // --- StudentBilling ---

  public func getStudentBilling(
    map : Map.Map<Text, StudentBilling>,
    billingId : Text,
  ) : ?StudentBilling {
    map.get(billingId);
  };

  public func saveStudentBilling(
    map : Map.Map<Text, StudentBilling>,
    billingId : Text,
    record : StudentBilling,
  ) {
    map.add(billingId, record);
  };

  public func getAllStudentBillings(
    map : Map.Map<Text, StudentBilling>,
  ) : [(Text, StudentBilling)] {
    map.toArray();
  };

  public func getBillingsByStudent(
    map : Map.Map<Text, StudentBilling>,
    studentUsername : Text,
  ) : [(Text, StudentBilling)] {
    map.toArray().filter(func((_, v)) { v.studentUsername == studentUsername });
  };

  public func deleteStudentBilling(
    map : Map.Map<Text, StudentBilling>,
    billingId : Text,
  ) : Bool {
    switch (map.get(billingId)) {
      case null { false };
      case (?_) { map.remove(billingId); true };
    };
  };

  // --- StudentCollaboration ---

  public func getStudentCollaboration(
    map : Map.Map<Text, StudentCollaboration>,
    collaborationId : Text,
  ) : ?StudentCollaboration {
    map.get(collaborationId);
  };

  public func saveStudentCollaboration(
    map : Map.Map<Text, StudentCollaboration>,
    collaborationId : Text,
    record : StudentCollaboration,
  ) {
    map.add(collaborationId, record);
  };

  public func getAllStudentCollaborations(
    map : Map.Map<Text, StudentCollaboration>,
  ) : [(Text, StudentCollaboration)] {
    map.toArray();
  };

  public func getCollaborationsByStudent(
    map : Map.Map<Text, StudentCollaboration>,
    studentUsername : Text,
  ) : [(Text, StudentCollaboration)] {
    map.toArray().filter(func((_, v)) { v.studentUsername == studentUsername });
  };

  public func deleteStudentCollaboration(
    map : Map.Map<Text, StudentCollaboration>,
    collaborationId : Text,
  ) : Bool {
    switch (map.get(collaborationId)) {
      case null { false };
      case (?_) { map.remove(collaborationId); true };
    };
  };
};
