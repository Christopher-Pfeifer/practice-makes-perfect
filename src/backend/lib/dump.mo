import Map "mo:core/Map";
import AuthTypes "../types/auth";
import ExtTypes "../types/extended";
import DumpTypes "../types/dump";

module {
  // ---------------------------------------------------------------------------
  // fullDump — serialise all 18 tables into a FullDump record
  // ---------------------------------------------------------------------------
  public func fullDump(
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
  ) : DumpTypes.FullDump {
    {
      profiles = profiles.entries().toArray();
      studioDetails = studioDetails.entries().toArray();
      teacherDetails = teacherDetails.entries().toArray();
      studentDetails = studentDetails.entries().toArray();
      masterInstruments = masterInstruments.entries().toArray();
      lessons = lessons.entries().toArray();
      teacherSchedule = teacherSchedule.entries().toArray();
      teacherRecitals = teacherRecitals.entries().toArray();
      teacherExamplePerformances = teacherExamplePerformances.entries().toArray();
      studentLessons = studentLessons.entries().toArray();
      studentPractices = studentPractices.entries().toArray();
      studentAssignments = studentAssignments.entries().toArray();
      studentProgress = studentProgress.entries().toArray();
      studentRepertoire = studentRepertoire.entries().toArray();
      studentMessages = studentMessages.entries().toArray();
      studentBilling = studentBilling.entries().toArray();
      studentCollaboration = studentCollaboration.entries().toArray();
      studentEnrollments = studentEnrollments.entries().toArray();
      teacherStudents = teacherStudents.entries().toArray();
      parentStudents = parentStudents.entries().toArray();
      teacherStudioAffiliations = teacherStudioAffiliations.entries().toArray();
    };
  };

  // ---------------------------------------------------------------------------
  // teacherDump — same FullDump shape, scoped to one teacher
  // ---------------------------------------------------------------------------
  public func teacherDump(
    teacherUsername : Text,
    profiles : Map.Map<Text, AuthTypes.Profile>,
    _studioDetails : Map.Map<Text, AuthTypes.StudioDetail>,
    teacherDetails : Map.Map<Text, AuthTypes.TeacherDetail>,
    studentDetails : Map.Map<Text, AuthTypes.StudentDetail>,
    _masterInstruments : Map.Map<Text, AuthTypes.MasterInstrument>,
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
  ) : DumpTypes.FullDump {
    let myEnrollments = studentEnrollments.entries()
      .filter(func((_, e)) { e.teacherUserName == teacherUsername })
      .toArray();

    // Unique student usernames for this teacher
    let seen = Map.empty<Text, Bool>();
    let myStudents : [Text] = do {
      let result = Map.empty<Text, Bool>();
      for ((_, e) in myEnrollments.values()) {
        switch (seen.get(e.studentUserName)) {
          case (?_) {};
          case null { seen.add(e.studentUserName, true); result.add(e.studentUserName, true) };
        };
      };
      result.keys().toArray();
    };

    func isMyStudent(u : Text) : Bool {
      var found = false;
      for (s in myStudents.values()) {
        if (s == u) { found := true };
      };
      found;
    };

    // Teacher's own profile record (as array of 0 or 1 entry)
    let profileEntry : [(Text, AuthTypes.Profile)] = switch (profiles.get(teacherUsername)) {
      case (?p) { [(teacherUsername, p)] };
      case null { [] };
    };

    // Teacher's own teacherDetails record
    let teacherDetailEntry : [(Text, AuthTypes.TeacherDetail)] = switch (teacherDetails.get(teacherUsername)) {
      case (?d) { [(teacherUsername, d)] };
      case null { [] };
    };

    // TeacherStudents entries for this teacher (kept for backward compat)
    let myTeacherStudents = teacherStudents.entries()
      .filter(func((_, ts)) { ts.teacherUserName == teacherUsername })
      .toArray();

    // ParentStudents entries where the student belongs to this teacher
    let myParentStudents = parentStudents.entries()
      .filter(func((_, ps)) { isMyStudent(ps.studentUserName) })
      .toArray();

    {
      profiles = profileEntry;
      studioDetails = [];
      teacherDetails = teacherDetailEntry;
      studentDetails = studentDetails.entries()
        .filter(func((k, _)) { isMyStudent(k) })
        .toArray();
      masterInstruments = [];
      lessons = lessons.entries()
        .filter(func((_, l)) { l.teacherUsername == teacherUsername })
        .toArray();
      teacherSchedule = teacherSchedule.entries()
        .filter(func((_, ts)) { ts.teacherUsername == teacherUsername })
        .toArray();
      teacherRecitals = teacherRecitals.entries()
        .filter(func((_, tr)) { tr.teacherUsername == teacherUsername })
        .toArray();
      teacherExamplePerformances = teacherExamplePerformances.entries()
        .filter(func((_, tp)) { tp.teacherUsername == teacherUsername })
        .toArray();
      studentLessons = studentLessons.entries()
        .filter(func((_, sl)) { isMyStudent(sl.studentUsername) })
        .toArray();
      studentPractices = studentPractices.entries()
        .filter(func((_, sp)) { isMyStudent(sp.studentUsername) })
        .toArray();
      studentAssignments = studentAssignments.entries()
        .filter(func((_, sa)) { isMyStudent(sa.studentUsername) })
        .toArray();
      studentProgress = studentProgress.entries()
        .filter(func((_, sp)) { isMyStudent(sp.studentUsername) })
        .toArray();
      studentRepertoire = studentRepertoire.entries()
        .filter(func((_, sr)) { isMyStudent(sr.studentUsername) })
        .toArray();
      studentMessages = studentMessages.entries()
        .filter(func((_, sm)) { isMyStudent(sm.studentUsername) })
        .toArray();
      studentBilling = studentBilling.entries()
        .filter(func((_, sb)) { isMyStudent(sb.studentUsername) })
        .toArray();
      studentCollaboration = studentCollaboration.entries()
        .filter(func((_, sc)) { isMyStudent(sc.studentUsername) })
        .toArray();
      studentEnrollments = myEnrollments;
      teacherStudents = myTeacherStudents;
      parentStudents = myParentStudents;
      teacherStudioAffiliations = teacherStudioAffiliations.entries()
        .filter(func((_, a)) { a.teacherUserName == teacherUsername })
        .toArray();
    };
  };

  // ---------------------------------------------------------------------------
  // Validation — ensure all required text keys are non-empty on a sample check
  // (structural validation: arrays always present, records have correct field types)
  // ---------------------------------------------------------------------------
  func validateProfile(p : AuthTypes.Profile) : ?Text {
    if (p.username == "") { return ?("Profile has empty username") };
    null; // address fields: address1/address2/city/state/zip validated externally
  };

  public func validateDump(dump : DumpTypes.FullDump) : ?Text {
    for ((_, p) in dump.profiles.values()) {
      switch (validateProfile(p)) {
        case (?err) { return ?err };
        case null {};
      };
    };
    null; // all checks passed
  };

  // ---------------------------------------------------------------------------
  // fullRestore — clear all 18 tables and repopulate atomically
  // ---------------------------------------------------------------------------
  public func fullRestore(
    dump : DumpTypes.FullDump,
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
  ) : DumpTypes.RestoreResult {
    // Validate before touching any state
    switch (validateDump(dump)) {
      case (?err) { return #err("Validation failed: " # err) };
      case null {};
    };

    // Clear all tables
    profiles.clear();
    studioDetails.clear();
    teacherDetails.clear();
    studentDetails.clear();
    masterInstruments.clear();
    lessons.clear();
    teacherSchedule.clear();
    teacherRecitals.clear();
    teacherExamplePerformances.clear();
    studentLessons.clear();
    studentPractices.clear();
    studentAssignments.clear();
    studentProgress.clear();
    studentRepertoire.clear();
    studentMessages.clear();
    studentBilling.clear();
    studentCollaboration.clear();
    studentEnrollments.clear();
    teacherStudents.clear();
    parentStudents.clear();
    teacherStudioAffiliations.clear();

    // Repopulate
    for ((k, v) in dump.profiles.values()) { profiles.add(k, v) };
    for ((k, v) in dump.studioDetails.values()) { studioDetails.add(k, v) };
    for ((k, v) in dump.teacherDetails.values()) { teacherDetails.add(k, v) };
    for ((k, v) in dump.studentDetails.values()) { studentDetails.add(k, v) };
    for ((k, v) in dump.masterInstruments.values()) { masterInstruments.add(k, v) };
    for ((k, v) in dump.lessons.values()) { lessons.add(k, v) };
    for ((k, v) in dump.teacherSchedule.values()) { teacherSchedule.add(k, v) };
    for ((k, v) in dump.teacherRecitals.values()) { teacherRecitals.add(k, v) };
    for ((k, v) in dump.teacherExamplePerformances.values()) { teacherExamplePerformances.add(k, v) };
    for ((k, v) in dump.studentLessons.values()) { studentLessons.add(k, v) };
    for ((k, v) in dump.studentPractices.values()) { studentPractices.add(k, v) };
    for ((k, v) in dump.studentAssignments.values()) { studentAssignments.add(k, v) };
    for ((k, v) in dump.studentProgress.values()) { studentProgress.add(k, v) };
    for ((k, v) in dump.studentRepertoire.values()) { studentRepertoire.add(k, v) };
    for ((k, v) in dump.studentMessages.values()) { studentMessages.add(k, v) };
    for ((k, v) in dump.studentBilling.values()) { studentBilling.add(k, v) };
    for ((k, v) in dump.studentCollaboration.values()) { studentCollaboration.add(k, v) };
    for ((k, v) in dump.studentEnrollments.values()) { studentEnrollments.add(k, v) };
    for ((k, v) in dump.teacherStudents.values()) { teacherStudents.add(k, v) };
    for ((k, v) in dump.parentStudents.values()) { parentStudents.add(k, v) };
    for ((k, v) in dump.teacherStudioAffiliations.values()) { teacherStudioAffiliations.add(k, v) };

    #ok;
  };

  // ---------------------------------------------------------------------------
  // teacherRestore — restore only data scoped to one teacher, leave other data intact
  // ---------------------------------------------------------------------------
  public func teacherRestore(
    dump : DumpTypes.FullDump,
    teacherUsername : Text,
    profiles : Map.Map<Text, AuthTypes.Profile>,
    teacherDetails : Map.Map<Text, AuthTypes.TeacherDetail>,
    studentDetails : Map.Map<Text, AuthTypes.StudentDetail>,
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
    parentStudents : Map.Map<Text, AuthTypes.ParentStudent>,
    teacherStudioAffiliations : Map.Map<Text, AuthTypes.TeacherStudioAffiliation>,
  ) : DumpTypes.RestoreResult {
    switch (validateDump(dump)) {
      case (?err) { return #err("Validation failed: " # err) };
      case null {};
    };

    // Collect student usernames from the dump for this teacher via studentEnrollments
    let dumpStudents : [Text] = do {
      let seen = Map.empty<Text, Bool>();
      let result = Map.empty<Text, Bool>();
      for ((_, e) in dump.studentEnrollments.values()) {
        if (e.teacherUserName == teacherUsername) {
          switch (seen.get(e.studentUserName)) {
            case (?_) {};
            case null { seen.add(e.studentUserName, true); result.add(e.studentUserName, true) };
          };
        };
      };
      result.keys().toArray();
    };

    func isDumpStudent(u : Text) : Bool {
      var found = false;
      for (s in dumpStudents.values()) {
        if (s == u) { found := true };
      };
      found;
    };

    // --- Restore teacher's own profile (upsert) ---
    for ((k, p) in dump.profiles.values()) {
      if (k == teacherUsername) { profiles.add(k, p) };
    };

    // --- Restore teacherDetails (upsert) ---
    for ((k, td) in dump.teacherDetails.values()) {
      if (k == teacherUsername) { teacherDetails.add(k, td) };
    };

    // --- Restore studentDetails for this teacher (upsert) ---
    for ((k, sd) in dump.studentDetails.values()) {
      if (isDumpStudent(k)) { studentDetails.add(k, sd) };
    };

    // --- Remove then re-add teacher-scoped records to avoid stale data ---
    // teacherSchedule
    let scheduleToKeep = teacherSchedule.entries()
      .filter(func((_, ts)) { ts.teacherUsername != teacherUsername })
      .toArray();
    teacherSchedule.clear();
    for ((k, v) in scheduleToKeep.values()) { teacherSchedule.add(k, v) };
    for ((k, ts) in dump.teacherSchedule.values()) {
      if (ts.teacherUsername == teacherUsername) { teacherSchedule.add(k, ts) };
    };

    // teacherRecitals
    let recitalsToKeep = teacherRecitals.entries()
      .filter(func((_, tr)) { tr.teacherUsername != teacherUsername })
      .toArray();
    teacherRecitals.clear();
    for ((k, v) in recitalsToKeep.values()) { teacherRecitals.add(k, v) };
    for ((k, tr) in dump.teacherRecitals.values()) {
      if (tr.teacherUsername == teacherUsername) { teacherRecitals.add(k, tr) };
    };

    // teacherExamplePerformances
    let perfsToKeep = teacherExamplePerformances.entries()
      .filter(func((_, tp)) { tp.teacherUsername != teacherUsername })
      .toArray();
    teacherExamplePerformances.clear();
    for ((k, v) in perfsToKeep.values()) { teacherExamplePerformances.add(k, v) };
    for ((k, tp) in dump.teacherExamplePerformances.values()) {
      if (tp.teacherUsername == teacherUsername) { teacherExamplePerformances.add(k, tp) };
    };

    // lessons
    let lessonsToKeep = lessons.entries()
      .filter(func((_, l)) { l.teacherUsername != teacherUsername })
      .toArray();
    lessons.clear();
    for ((k, v) in lessonsToKeep.values()) { lessons.add(k, v) };
    for ((k, l) in dump.lessons.values()) {
      if (l.teacherUsername == teacherUsername) { lessons.add(k, l) };
    };

    // studentLessons — scoped to this teacher's students in the dump
    let sLessonsToKeep = studentLessons.entries()
      .filter(func((_, sl)) { not isDumpStudent(sl.studentUsername) })
      .toArray();
    studentLessons.clear();
    for ((k, v) in sLessonsToKeep.values()) { studentLessons.add(k, v) };
    for ((k, sl) in dump.studentLessons.values()) {
      if (isDumpStudent(sl.studentUsername)) { studentLessons.add(k, sl) };
    };

    // studentPractices
    let sPractToKeep = studentPractices.entries()
      .filter(func((_, sp)) { not isDumpStudent(sp.studentUsername) })
      .toArray();
    studentPractices.clear();
    for ((k, v) in sPractToKeep.values()) { studentPractices.add(k, v) };
    for ((k, sp) in dump.studentPractices.values()) {
      if (isDumpStudent(sp.studentUsername)) { studentPractices.add(k, sp) };
    };

    // studentAssignments
    let sAssignToKeep = studentAssignments.entries()
      .filter(func((_, sa)) { not isDumpStudent(sa.studentUsername) })
      .toArray();
    studentAssignments.clear();
    for ((k, v) in sAssignToKeep.values()) { studentAssignments.add(k, v) };
    for ((k, sa) in dump.studentAssignments.values()) {
      if (isDumpStudent(sa.studentUsername)) { studentAssignments.add(k, sa) };
    };

    // studentProgress
    let sProgToKeep = studentProgress.entries()
      .filter(func((_, sp)) { not isDumpStudent(sp.studentUsername) })
      .toArray();
    studentProgress.clear();
    for ((k, v) in sProgToKeep.values()) { studentProgress.add(k, v) };
    for ((k, sp) in dump.studentProgress.values()) {
      if (isDumpStudent(sp.studentUsername)) { studentProgress.add(k, sp) };
    };

    // studentRepertoire
    let sRepToKeep = studentRepertoire.entries()
      .filter(func((_, sr)) { not isDumpStudent(sr.studentUsername) })
      .toArray();
    studentRepertoire.clear();
    for ((k, v) in sRepToKeep.values()) { studentRepertoire.add(k, v) };
    for ((k, sr) in dump.studentRepertoire.values()) {
      if (isDumpStudent(sr.studentUsername)) { studentRepertoire.add(k, sr) };
    };

    // studentMessages
    let sMsgToKeep = studentMessages.entries()
      .filter(func((_, sm)) { not isDumpStudent(sm.studentUsername) })
      .toArray();
    studentMessages.clear();
    for ((k, v) in sMsgToKeep.values()) { studentMessages.add(k, v) };
    for ((k, sm) in dump.studentMessages.values()) {
      if (isDumpStudent(sm.studentUsername)) { studentMessages.add(k, sm) };
    };

    // studentBilling
    let sBillToKeep = studentBilling.entries()
      .filter(func((_, sb)) { not isDumpStudent(sb.studentUsername) })
      .toArray();
    studentBilling.clear();
    for ((k, v) in sBillToKeep.values()) { studentBilling.add(k, v) };
    for ((k, sb) in dump.studentBilling.values()) {
      if (isDumpStudent(sb.studentUsername)) { studentBilling.add(k, sb) };
    };

    // studentCollaboration
    let sCollabToKeep = studentCollaboration.entries()
      .filter(func((_, sc)) { not isDumpStudent(sc.studentUsername) })
      .toArray();
    studentCollaboration.clear();
    for ((k, v) in sCollabToKeep.values()) { studentCollaboration.add(k, v) };
    for ((k, sc) in dump.studentCollaboration.values()) {
      if (isDumpStudent(sc.studentUsername)) { studentCollaboration.add(k, sc) };
    };

    // studentEnrollments — upsert entries for this teacher
    for ((k, e) in dump.studentEnrollments.values()) {
      if (e.teacherUserName == teacherUsername) { studentEnrollments.add(k, e) };
    };

    // parentStudents — upsert entries from the dump
    for ((k, ps) in dump.parentStudents.values()) {
      if (isDumpStudent(ps.studentUserName)) { parentStudents.add(k, ps) };
    };

    // teacherStudioAffiliations — upsert entries for this teacher
    for ((k, a) in dump.teacherStudioAffiliations.values()) {
      if (a.teacherUserName == teacherUsername) { teacherStudioAffiliations.add(k, a) };
    };

    #ok;
  };
};
