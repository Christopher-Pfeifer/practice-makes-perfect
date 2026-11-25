import Map "mo:core/Map";
import ScheduleLib "../lib/schedule";
import LessonsLib "../lib/lessons";
import Types "../types/extended";

mixin (
  teacherSchedule : Map.Map<Text, Types.TeacherSchedule>,
  lessons : Map.Map<Text, Types.Lesson>,
) {
  // --- TeacherSchedule CRUD ---

  public query func getTeacherSchedule(scheduleId : Text) : async ?Types.TeacherSchedule {
    ScheduleLib.getTeacherSchedule(teacherSchedule, scheduleId);
  };

  public func saveTeacherSchedule(scheduleId : Text, record : Types.TeacherSchedule) : async () {
    ScheduleLib.saveTeacherSchedule(teacherSchedule, scheduleId, record);
  };

  public query func getAllTeacherSchedules() : async [(Text, Types.TeacherSchedule)] {
    ScheduleLib.getAllTeacherSchedules(teacherSchedule);
  };

  public query func getSchedulesByTeacher(teacherUsername : Text) : async [(Text, Types.TeacherSchedule)] {
    ScheduleLib.getSchedulesByTeacher(teacherSchedule, teacherUsername);
  };

  public func deleteTeacherSchedule(scheduleId : Text) : async Bool {
    ScheduleLib.deleteTeacherSchedule(teacherSchedule, scheduleId);
  };

  // --- Lessons CRUD ---

  public query func getLesson(lessonId : Text) : async ?Types.Lesson {
    LessonsLib.getLesson(lessons, lessonId);
  };

  public func saveLesson(lessonId : Text, record : Types.Lesson) : async () {
    LessonsLib.saveLesson(lessons, lessonId, record);
  };

  public query func getAllLessons() : async [(Text, Types.Lesson)] {
    LessonsLib.getAllLessons(lessons);
  };

  public query func getLessonsByStudent(studentUsername : Text) : async [(Text, Types.Lesson)] {
    LessonsLib.getLessonsByStudent(lessons, studentUsername);
  };

  public query func getLessonsByTeacher(teacherUsername : Text) : async [(Text, Types.Lesson)] {
    LessonsLib.getLessonsByTeacher(lessons, teacherUsername);
  };

  public func deleteLesson(lessonId : Text) : async Bool {
    LessonsLib.deleteLesson(lessons, lessonId);
  };
};
