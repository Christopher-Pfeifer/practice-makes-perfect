import Map "mo:core/Map";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Types "../types/auth";
import Nat "mo:core/Nat";

mixin (
  profiles : Map.Map<Text, Types.Profile>,
  teacherDetails : Map.Map<Text, Types.TeacherDetail>,
  studentDetails : Map.Map<Text, Types.StudentDetail>,
  studentEnrollments : Map.Map<Text, Types.StudentEnrollment>,
  parentStudents : Map.Map<Text, Types.ParentStudent>,
  teacherStudioAffiliations : Map.Map<Text, Types.TeacherStudioAffiliation>,
) {

  // --- Private helpers ---

  // Count entries in a Text->Nat accumulator map built from a flat iter of text tokens
  func countTokens(tokens : Iter.Iter<Text>) : [(Text, Nat)] {
    let acc = Map.empty<Text, Nat>();
    for (token in tokens) {
      let trimmed = token.trim(#char ' ');
      if (not trimmed.isEmpty()) {
        let prev = switch (acc.get(trimmed)) {
          case (?n) n;
          case null 0;
        };
        acc.add(trimmed, prev + 1);
      };
    };
    let arr = acc.toArray();
    arr.sort(func((_, a), (_, b)) = Nat.compare(b, a));
  };

  // Split a pipe-separated field and return an iter of tokens
  func splitPipe(s : Text) : Iter.Iter<Text> {
    s.split(#char '|');
  };

  // Collect unique student usernames enrolled with a given teacher (via enrollments)
  func studentUsernamesForTeacher(teacherUsername : Text) : [Text] {
    let seen = Map.empty<Text, Bool>();
    studentEnrollments.values()
      .filter(func(e) { e.teacherUserName == teacherUsername })
      .map(func(e) { e.studentUserName })
      .filter(func(su) {
        switch (seen.get(su)) {
          case (?_) false;
          case null { seen.add(su, true); true };
        };
      })
      .toArray();
  };

  // Collect enrollments for a given teacher (all, including multi-instrument)
  func enrollmentsForTeacher(teacherUsername : Text) : [Types.StudentEnrollment] {
    studentEnrollments.values()
      .filter(func(e) { e.teacherUserName == teacherUsername })
      .toArray();
  };

  // Collect unique student usernames for a given studio (via teacherStudioAffiliations -> enrollments)
  func studentUsernamesForStudio(studioUsername : Text) : [Text] {
    let seen = Map.empty<Text, Bool>();
    let result = Map.empty<Text, Bool>();
    for ((_, aff) in teacherStudioAffiliations.entries()) {
      if (aff.studioUserName == studioUsername) {
        for (su in studentUsernamesForTeacher(aff.teacherUserName).values()) {
          switch (seen.get(su)) {
            case (?_) {};
            case null { seen.add(su, true); result.add(su, true) };
          };
        };
      };
    };
    result.keys().toArray();
  };

  // Collect all enrollments for a given studio (via teacherStudioAffiliations -> enrollments)
  func enrollmentsForStudio(studioUsername : Text) : [Types.StudentEnrollment] {
    let affiliatedTeachers = Map.empty<Text, Bool>();
    for ((_, aff) in teacherStudioAffiliations.entries()) {
      if (aff.studioUserName == studioUsername) {
        affiliatedTeachers.add(aff.teacherUserName, true);
      };
    };
    studentEnrollments.values()
      .filter(func(e) {
        switch (affiliatedTeachers.get(e.teacherUserName)) {
          case (?_) true;
          case null false;
        };
      })
      .toArray();
  };

  // Build instrument counts from an array of StudentEnrollment
  func instrumentBreakdown(enrollments : [Types.StudentEnrollment]) : [(Text, Nat)] {
    let allTokens = enrollments.values()
      .flatMap(func(e) { splitPipe(e.instrument) });
    countTokens(allTokens);
  };

  // Build skill level counts from an array of StudentEnrollment
  func skillLevelBreakdown(enrollments : [Types.StudentEnrollment]) : [(Text, Nat)] {
    let allTokens = enrollments.values()
      .map(func(e) { e.skillLevel })
      .filter(func(s) { not s.isEmpty() });
    countTokens(allTokens);
  };

  // --- Public query methods ---

  func getStudioAnalytics(studioUsername : Text) : async {
    teacherCount : Nat;
    studentCount : Nat;
    teachersByStudentCount : [(Text, Nat)];
    studentsByInstrument : [(Text, Nat)];
    studentsBySkillLevel : [(Text, Nat)];
  } {
    let studioTeachers : [Text] = teacherStudioAffiliations.values()
      .filter(func(aff) { aff.studioUserName == studioUsername })
      .map(func(aff) { aff.teacherUserName })
      .toArray();

    let studioEnrollments = enrollmentsForStudio(studioUsername);
    let studioStudentCount = studentUsernamesForStudio(studioUsername).size();

    // Teachers ranked by their unique student count (via enrollments)
    let teachersByStudentCount : [(Text, Nat)] = do {
      let pairs = studioTeachers.map(func(tu) {
        let cnt = studentUsernamesForTeacher(tu).size();
        (tu, cnt);
      });
      pairs.sort(func((_, a), (_, b)) = Nat.compare(b, a))
    };

    {
      teacherCount = studioTeachers.size();
      studentCount = studioStudentCount;
      teachersByStudentCount;
      studentsByInstrument = instrumentBreakdown(studioEnrollments);
      studentsBySkillLevel = skillLevelBreakdown(studioEnrollments);
    };
  };

  public query func getTeacherAnalytics(teacherUsername : Text) : async {
    studentCount : Nat;
    studentsByInstrument : [(Text, Nat)];
    studentsBySkillLevel : [(Text, Nat)];
  } {
    let enrollments = enrollmentsForTeacher(teacherUsername);
    let uniqueStudentCount = studentUsernamesForTeacher(teacherUsername).size();
    {
      studentCount = uniqueStudentCount;
      studentsByInstrument = instrumentBreakdown(enrollments);
      studentsBySkillLevel = skillLevelBreakdown(enrollments);
    };
  };

  func getAdminAnalytics() : async {
    totalStudios : Nat;
    totalTeachers : Nat;
    totalStudents : Nat;
    totalParents : Nat;
    studiosByTeacherCount : [(Text, Text, Nat, Nat)];
    teachersByStudentCount : [(Text, Text, Nat)];
    studentsByInstrument : [(Text, Nat)];
    studentsBySkillLevel : [(Text, Nat)];
    parentsByStudentCount : [(Text, Text, Nat)];
  } {
    var nStudios = 0;
    var nTeachers = 0;
    var nStudents = 0;
    var nParents = 0;
    for ((_, p) in profiles.entries()) {
      switch (p.role) {
        case (#Studio) nStudios += 1;
        case (#Teacher) nTeachers += 1;
        case (#Student) nStudents += 1;
        case (#Parent) nParents += 1;
        case (#Admin) {};
        case (#Unassigned) {};
      };
    };

    // studiosByTeacherCount: (studioUsername, studioName, teacherCount, studentCount)
    let studiosByTeacherCount : [(Text, Text, Nat, Nat)] = do {
      let studioEntries : [(Text, Text)] = profiles.entries()
        .filter(func((_, p)) {
          switch (p.role) { case (#Studio) true; case _ false };
        })
        .map(func((u, p)) { (u, p.fullName) })
        .toArray();
      let pairs = studioEntries.map(func((su, sName)) {
        let tCount = teacherStudioAffiliations.values()
          .filter(func(aff) { aff.studioUserName == su })
          .size();
        let stStudents = studentUsernamesForStudio(su);
        (su, sName, tCount, stStudents.size());
      });
      pairs.sort(func((_, _, a, _), (_, _, b, _)) = Nat.compare(b, a))
    };

    // teachersByStudentCount using enrollments (unique students per teacher)
    let teachersByStudentCount : [(Text, Text, Nat)] = do {
      let teacherEntries : [(Text, Text)] = profiles.entries()
        .filter(func((_, p)) {
          switch (p.role) { case (#Teacher) true; case _ false };
        })
        .map(func((u, p)) { (u, p.fullName) })
        .toArray();
      let pairs = teacherEntries.map(func((tu, tName)) {
        let cnt = studentUsernamesForTeacher(tu).size();
        (tu, tName, cnt);
      });
      pairs.sort(func((_, _, a), (_, _, b)) = Nat.compare(b, a))
    };

    // All enrollments for system-wide breakdown
    let allEnrollments = studentEnrollments.values().toArray();

    // parentsByStudentCount using relationship table
    let parentsByStudentCount : [(Text, Text, Nat)] = do {
      let parentEntries : [(Text, Text)] = profiles.entries()
        .filter(func((_, p)) {
          switch (p.role) { case (#Parent) true; case _ false };
        })
        .map(func((u, p)) { (u, p.fullName) })
        .toArray();
      let pairs = parentEntries.map(func((pu, pName)) {
        let cnt = parentStudents.entries()
          .filter(func((_, ps)) { ps.parentUserName == pu })
          .size();
        (pu, pName, cnt);
      });
      pairs.sort(func((_, _, a), (_, _, b)) = Nat.compare(b, a))
    };

    {
      totalStudios = nStudios;
      totalTeachers = nTeachers;
      totalStudents = nStudents;
      totalParents = nParents;
      studiosByTeacherCount;
      teachersByStudentCount;
      studentsByInstrument = instrumentBreakdown(allEnrollments);
      studentsBySkillLevel = skillLevelBreakdown(allEnrollments);
      parentsByStudentCount;
    };
  };
};
