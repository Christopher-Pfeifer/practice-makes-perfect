module {
  // teacherSchedule extended fields (existing fields: scheduleId, teacherUsername, dayOfWeek, startTime, endTime, notes)
  public type TeacherSchedule = {
    scheduleId : Text;
    teacherUsername : Text;
    dayOfWeek : Text;
    startTime : Text;
    endTime : Text;
    notes : Text;
    lessonDate : Text;
    studentUsername : Text;
    duration : Nat;
    status : Text;
  };

  // Table 1: teacherRecitals
  public type TeacherRecital = {
    recitalId : Text;
    teacherUsername : Text;
    recitalName : Text;
    date : Text;
    venue : Text;
    studentAssignments : Text; // pipe-separated "studentUsername:pieceTitle:readiness"
    notes : Text;
  };

  // Table 2: teacherExamplePerformances
  public type TeacherExamplePerformance = {
    performanceId : Text;
    teacherUsername : Text;
    title : Text;
    mediaUrl : Text;
    description : Text;
    commentary : Text;
    attachedToAssignmentId : Text;
    notes : Text;
  };

  // Table 3: studentLessons
  public type StudentLesson = {
    lessonEntryId : Text;
    studentUsername : Text;
    lessonDate : Text;
    duration : Nat;
    topics : Text;
    teacherNotes : Text;
    homeworkAssigned : Text;
    teacherUsername : Text;
  };

  // Table 4: studentPractices
  public type StudentPractice = {
    practiceId : Text;
    studentUsername : Text;
    practiceDate : Text;
    duration : Nat;
    pieceWorkedOn : Text;
    studentNotes : Text;
    teacherFeedback : Text;
    rating : Nat;
    teacherUsername : Text;
  };

  // Table 5: studentAssignments
  public type StudentAssignment = {
    assignmentId : Text;
    studentUsername : Text;
    title : Text;
    description : Text;
    dueDate : Text;
    priority : Text;
    status : Text;
    teacherFeedback : Text;
    attachedExampleUrl : Text;
    teacherUsername : Text;
  };

  // Table 6: studentProgress
  public type StudentProgress = {
    progressId : Text;
    studentUsername : Text;
    date : Text;
    skillCategory : Text;
    score : Nat;
    notes : Text;
    goalSet : Text;
    goalMet : Bool;
    teacherUsername : Text;
  };

  // Table 7: studentRepertoire
  public type StudentRepertoire = {
    repertoireId : Text;
    studentUsername : Text;
    title : Text;
    composer : Text;
    genre : Text;
    startDate : Text;
    performanceDate : Text;
    status : Text;
    notes : Text;
    teacherUsername : Text;
  };

  // Table 8: studentMessages
  public type StudentMessage = {
    messageId : Text;
    studentUsername : Text;
    timestamp : Text;
    fromUsername : Text;
    toUsername : Text;
    subject : Text;
    body : Text;
    isRead : Bool;
    isPinned : Bool;
    teacherUsername : Text;
  };

  // Table 9: studentBilling
  public type StudentBilling = {
    billingId : Text;
    studentUsername : Text;
    billingMonth : Text;
    tuitionAmount : Float;
    amountPaid : Float;
    paymentDate : Text;
    status : Text;
    notes : Text;
    teacherUsername : Text;
  };

  // Table 10: studentCollaboration
  public type StudentCollaboration = {
    collaborationId : Text;
    studentUsername : Text;
    groupName : Text;
    groupType : Text;
    members : Text; // pipe-separated
    sharedRepertoire : Text; // pipe-separated
    rehearsalDates : Text; // pipe-separated
    teacherUsername : Text;
  };

  // Lesson (existing table, type defined here for consolidation)
  public type Lesson = {
    lessonId : Text;
    studentUsername : Text;
    teacherUsername : Text;
    studioUsername : Text;
    date : Text;
    duration : Text;
    instrument : Text;
    status : Text;
    notes : Text;
  };
};
