import Map "mo:core/Map";
import Types "../types/extended";
import TeacherExtLib "../lib/teacher-extended";

mixin (
  teacherRecitals : Map.Map<Text, Types.TeacherRecital>,
  teacherExamplePerformances : Map.Map<Text, Types.TeacherExamplePerformance>,
) {
  // --- TeacherRecitals CRUD ---

  public query func getTeacherRecital(recitalId : Text) : async ?Types.TeacherRecital {
    TeacherExtLib.getTeacherRecital(teacherRecitals, recitalId);
  };

  public func saveTeacherRecital(recitalId : Text, record : Types.TeacherRecital) : async () {
    TeacherExtLib.saveTeacherRecital(teacherRecitals, recitalId, record);
  };

  public query func getAllTeacherRecitals() : async [(Text, Types.TeacherRecital)] {
    TeacherExtLib.getAllTeacherRecitals(teacherRecitals);
  };

  public query func getRecitalsByTeacher(teacherUsername : Text) : async [(Text, Types.TeacherRecital)] {
    TeacherExtLib.getRecitalsByTeacher(teacherRecitals, teacherUsername);
  };

  public func deleteTeacherRecital(recitalId : Text) : async Bool {
    TeacherExtLib.deleteTeacherRecital(teacherRecitals, recitalId);
  };

  // --- TeacherExamplePerformances CRUD ---

  public query func getTeacherExamplePerformance(performanceId : Text) : async ?Types.TeacherExamplePerformance {
    TeacherExtLib.getTeacherExamplePerformance(teacherExamplePerformances, performanceId);
  };

  public func saveTeacherExamplePerformance(performanceId : Text, record : Types.TeacherExamplePerformance) : async () {
    TeacherExtLib.saveTeacherExamplePerformance(teacherExamplePerformances, performanceId, record);
  };

  public query func getAllTeacherExamplePerformances() : async [(Text, Types.TeacherExamplePerformance)] {
    TeacherExtLib.getAllTeacherExamplePerformances(teacherExamplePerformances);
  };

  public query func getPerformancesByTeacher(teacherUsername : Text) : async [(Text, Types.TeacherExamplePerformance)] {
    TeacherExtLib.getPerformancesByTeacher(teacherExamplePerformances, teacherUsername);
  };

  public func deleteTeacherExamplePerformance(performanceId : Text) : async Bool {
    TeacherExtLib.deleteTeacherExamplePerformance(teacherExamplePerformances, performanceId);
  };
};
