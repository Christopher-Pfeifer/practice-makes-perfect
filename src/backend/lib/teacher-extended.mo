import Map "mo:core/Map";
import Types "../types/extended";

module {
  public type TeacherRecital = Types.TeacherRecital;
  public type TeacherExamplePerformance = Types.TeacherExamplePerformance;

  // --- TeacherRecitals ---

  public func getTeacherRecital(
    recitalsMap : Map.Map<Text, TeacherRecital>,
    recitalId : Text,
  ) : ?TeacherRecital {
    recitalsMap.get(recitalId);
  };

  public func saveTeacherRecital(
    recitalsMap : Map.Map<Text, TeacherRecital>,
    recitalId : Text,
    record : TeacherRecital,
  ) {
    recitalsMap.add(recitalId, record);
  };

  public func getAllTeacherRecitals(
    recitalsMap : Map.Map<Text, TeacherRecital>,
  ) : [(Text, TeacherRecital)] {
    recitalsMap.toArray();
  };

  public func getRecitalsByTeacher(
    recitalsMap : Map.Map<Text, TeacherRecital>,
    teacherUsername : Text,
  ) : [(Text, TeacherRecital)] {
    recitalsMap.toArray().filter(func((_, r)) { r.teacherUsername == teacherUsername });
  };

  public func deleteTeacherRecital(
    recitalsMap : Map.Map<Text, TeacherRecital>,
    recitalId : Text,
  ) : Bool {
    switch (recitalsMap.get(recitalId)) {
      case null { false };
      case (?_) { recitalsMap.remove(recitalId); true };
    };
  };

  // --- TeacherExamplePerformances ---

  public func getTeacherExamplePerformance(
    performancesMap : Map.Map<Text, TeacherExamplePerformance>,
    performanceId : Text,
  ) : ?TeacherExamplePerformance {
    performancesMap.get(performanceId);
  };

  public func saveTeacherExamplePerformance(
    performancesMap : Map.Map<Text, TeacherExamplePerformance>,
    performanceId : Text,
    record : TeacherExamplePerformance,
  ) {
    performancesMap.add(performanceId, record);
  };

  public func getAllTeacherExamplePerformances(
    performancesMap : Map.Map<Text, TeacherExamplePerformance>,
  ) : [(Text, TeacherExamplePerformance)] {
    performancesMap.toArray();
  };

  public func getPerformancesByTeacher(
    performancesMap : Map.Map<Text, TeacherExamplePerformance>,
    teacherUsername : Text,
  ) : [(Text, TeacherExamplePerformance)] {
    performancesMap.toArray().filter(func((_, p)) { p.teacherUsername == teacherUsername });
  };

  public func deleteTeacherExamplePerformance(
    performancesMap : Map.Map<Text, TeacherExamplePerformance>,
    performanceId : Text,
  ) : Bool {
    switch (performancesMap.get(performanceId)) {
      case null { false };
      case (?_) { performancesMap.remove(performanceId); true };
    };
  };
};
