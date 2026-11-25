import Map "mo:core/Map";
import Lib "../lib/student-extended";
import Types "../types/extended";

mixin (
  studentLessons : Map.Map<Text, Types.StudentLesson>,
  studentPractices : Map.Map<Text, Types.StudentPractice>,
  studentAssignments : Map.Map<Text, Types.StudentAssignment>,
  studentProgress : Map.Map<Text, Types.StudentProgress>,
  studentRepertoire : Map.Map<Text, Types.StudentRepertoire>,
  studentMessages : Map.Map<Text, Types.StudentMessage>,
  studentBilling : Map.Map<Text, Types.StudentBilling>,
  studentCollaboration : Map.Map<Text, Types.StudentCollaboration>,
) {
  // --- StudentLessons CRUD ---

  public query func getStudentLesson(lessonEntryId : Text) : async ?Types.StudentLesson {
    Lib.getStudentLesson(studentLessons, lessonEntryId);
  };

  public func saveStudentLesson(lessonEntryId : Text, record : Types.StudentLesson) : async () {
    Lib.saveStudentLesson(studentLessons, lessonEntryId, record);
  };

  public query func getAllStudentLessons() : async [(Text, Types.StudentLesson)] {
    Lib.getAllStudentLessons(studentLessons);
  };

  public query func getLessonEntriesByStudent(studentUsername : Text) : async [(Text, Types.StudentLesson)] {
    Lib.getLessonsByStudent(studentLessons, studentUsername);
  };

  public query func getStudentLessonsByTeacher(teacherUsername : Text) : async [(Text, Types.StudentLesson)] {
    studentLessons.toArray().filter(func((_, v)) { v.teacherUsername == teacherUsername });
  };

  public func deleteStudentLesson(lessonEntryId : Text) : async Bool {
    Lib.deleteStudentLesson(studentLessons, lessonEntryId);
  };

  // --- StudentPractices CRUD ---

  public query func getStudentPractice(practiceId : Text) : async ?Types.StudentPractice {
    Lib.getStudentPractice(studentPractices, practiceId);
  };

  public func saveStudentPractice(practiceId : Text, record : Types.StudentPractice) : async () {
    Lib.saveStudentPractice(studentPractices, practiceId, record);
  };

  public query func getAllStudentPractices() : async [(Text, Types.StudentPractice)] {
    Lib.getAllStudentPractices(studentPractices);
  };

  public query func getPracticesByStudent(studentUsername : Text) : async [(Text, Types.StudentPractice)] {
    Lib.getPracticesByStudent(studentPractices, studentUsername);
  };

  public query func getStudentPracticesByTeacher(teacherUsername : Text) : async [(Text, Types.StudentPractice)] {
    studentPractices.toArray().filter(func((_, v)) { v.teacherUsername == teacherUsername });
  };

  public func deleteStudentPractice(practiceId : Text) : async Bool {
    Lib.deleteStudentPractice(studentPractices, practiceId);
  };

  // --- StudentAssignments CRUD ---

  public query func getStudentAssignment(assignmentId : Text) : async ?Types.StudentAssignment {
    Lib.getStudentAssignment(studentAssignments, assignmentId);
  };

  public func saveStudentAssignment(assignmentId : Text, record : Types.StudentAssignment) : async () {
    Lib.saveStudentAssignment(studentAssignments, assignmentId, record);
  };

  public query func getAllStudentAssignments() : async [(Text, Types.StudentAssignment)] {
    Lib.getAllStudentAssignments(studentAssignments);
  };

  public query func getAssignmentsByStudent(studentUsername : Text) : async [(Text, Types.StudentAssignment)] {
    Lib.getAssignmentsByStudent(studentAssignments, studentUsername);
  };

  public query func getStudentAssignmentsByTeacher(teacherUsername : Text) : async [(Text, Types.StudentAssignment)] {
    studentAssignments.toArray().filter(func((_, v)) { v.teacherUsername == teacherUsername });
  };

  public func deleteStudentAssignment(assignmentId : Text) : async Bool {
    Lib.deleteStudentAssignment(studentAssignments, assignmentId);
  };

  // --- StudentProgress CRUD ---

  public query func getStudentProgressRecord(progressId : Text) : async ?Types.StudentProgress {
    Lib.getStudentProgress(studentProgress, progressId);
  };

  public func saveStudentProgress(progressId : Text, record : Types.StudentProgress) : async () {
    Lib.saveStudentProgress(studentProgress, progressId, record);
  };

  public query func getAllStudentProgress() : async [(Text, Types.StudentProgress)] {
    Lib.getAllStudentProgress(studentProgress);
  };

  public query func getProgressByStudent(studentUsername : Text) : async [(Text, Types.StudentProgress)] {
    Lib.getProgressByStudent(studentProgress, studentUsername);
  };

  public query func getStudentProgressByTeacher(teacherUsername : Text) : async [(Text, Types.StudentProgress)] {
    studentProgress.toArray().filter(func((_, v)) { v.teacherUsername == teacherUsername });
  };

  public func deleteStudentProgress(progressId : Text) : async Bool {
    Lib.deleteStudentProgress(studentProgress, progressId);
  };

  // --- StudentRepertoire CRUD ---

  public query func getStudentRepertoireRecord(repertoireId : Text) : async ?Types.StudentRepertoire {
    Lib.getStudentRepertoire(studentRepertoire, repertoireId);
  };

  public func saveStudentRepertoire(repertoireId : Text, record : Types.StudentRepertoire) : async () {
    Lib.saveStudentRepertoire(studentRepertoire, repertoireId, record);
  };

  public query func getAllStudentRepertoire() : async [(Text, Types.StudentRepertoire)] {
    Lib.getAllStudentRepertoire(studentRepertoire);
  };

  public query func getRepertoireByStudent(studentUsername : Text) : async [(Text, Types.StudentRepertoire)] {
    Lib.getRepertoireByStudent(studentRepertoire, studentUsername);
  };

  public query func getStudentRepertoireByTeacher(teacherUsername : Text) : async [(Text, Types.StudentRepertoire)] {
    studentRepertoire.toArray().filter(func((_, v)) { v.teacherUsername == teacherUsername });
  };

  public func deleteStudentRepertoire(repertoireId : Text) : async Bool {
    Lib.deleteStudentRepertoire(studentRepertoire, repertoireId);
  };

  // --- StudentMessages CRUD ---

  public query func getStudentMessage(messageId : Text) : async ?Types.StudentMessage {
    Lib.getStudentMessage(studentMessages, messageId);
  };

  public func saveStudentMessage(messageId : Text, record : Types.StudentMessage) : async () {
    Lib.saveStudentMessage(studentMessages, messageId, record);
  };

  public query func getAllStudentMessages() : async [(Text, Types.StudentMessage)] {
    Lib.getAllStudentMessages(studentMessages);
  };

  public query func getMessagesByStudent(studentUsername : Text) : async [(Text, Types.StudentMessage)] {
    Lib.getMessagesByStudent(studentMessages, studentUsername);
  };

  public query func getStudentMessagesByTeacher(teacherUsername : Text) : async [(Text, Types.StudentMessage)] {
    studentMessages.toArray().filter(func((_, v)) { v.teacherUsername == teacherUsername });
  };

  public func deleteStudentMessage(messageId : Text) : async Bool {
    Lib.deleteStudentMessage(studentMessages, messageId);
  };

  // --- StudentBilling CRUD ---

  public query func getStudentBillingRecord(billingId : Text) : async ?Types.StudentBilling {
    Lib.getStudentBilling(studentBilling, billingId);
  };

  public func saveStudentBilling(billingId : Text, record : Types.StudentBilling) : async () {
    Lib.saveStudentBilling(studentBilling, billingId, record);
  };

  public query func getAllStudentBillings() : async [(Text, Types.StudentBilling)] {
    Lib.getAllStudentBillings(studentBilling);
  };

  public query func getBillingsByStudent(studentUsername : Text) : async [(Text, Types.StudentBilling)] {
    Lib.getBillingsByStudent(studentBilling, studentUsername);
  };

  public query func getStudentBillingsByTeacher(teacherUsername : Text) : async [(Text, Types.StudentBilling)] {
    studentBilling.toArray().filter(func((_, v)) { v.teacherUsername == teacherUsername });
  };

  public func deleteStudentBilling(billingId : Text) : async Bool {
    Lib.deleteStudentBilling(studentBilling, billingId);
  };

  // --- StudentCollaboration CRUD ---

  public query func getStudentCollaboration(collaborationId : Text) : async ?Types.StudentCollaboration {
    Lib.getStudentCollaboration(studentCollaboration, collaborationId);
  };

  public func saveStudentCollaboration(collaborationId : Text, record : Types.StudentCollaboration) : async () {
    Lib.saveStudentCollaboration(studentCollaboration, collaborationId, record);
  };

  public query func getAllStudentCollaborations() : async [(Text, Types.StudentCollaboration)] {
    Lib.getAllStudentCollaborations(studentCollaboration);
  };

  public query func getCollaborationsByStudent(studentUsername : Text) : async [(Text, Types.StudentCollaboration)] {
    Lib.getCollaborationsByStudent(studentCollaboration, studentUsername);
  };

  public query func getStudentCollaborationsByTeacher(teacherUsername : Text) : async [(Text, Types.StudentCollaboration)] {
    studentCollaboration.toArray().filter(func((_, v)) { v.teacherUsername == teacherUsername });
  };

  public func deleteStudentCollaboration(collaborationId : Text) : async Bool {
    Lib.deleteStudentCollaboration(studentCollaboration, collaborationId);
  };
};
