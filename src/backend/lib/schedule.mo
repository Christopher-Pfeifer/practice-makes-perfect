import Map "mo:core/Map";
import Types "../types/extended";

module {
  public type TeacherSchedule = Types.TeacherSchedule;

  public func getTeacherSchedule(
    scheduleMap : Map.Map<Text, TeacherSchedule>,
    scheduleId : Text,
  ) : ?TeacherSchedule {
    scheduleMap.get(scheduleId);
  };

  public func saveTeacherSchedule(
    scheduleMap : Map.Map<Text, TeacherSchedule>,
    scheduleId : Text,
    record : TeacherSchedule,
  ) {
    scheduleMap.add(scheduleId, record);
  };

  public func getAllTeacherSchedules(
    scheduleMap : Map.Map<Text, TeacherSchedule>,
  ) : [(Text, TeacherSchedule)] {
    scheduleMap.toArray();
  };

  public func getSchedulesByTeacher(
    scheduleMap : Map.Map<Text, TeacherSchedule>,
    teacherUsername : Text,
  ) : [(Text, TeacherSchedule)] {
    scheduleMap.entries()
      .filter(func((_, s) : (Text, TeacherSchedule)) : Bool {
        s.teacherUsername == teacherUsername
      })
      .toArray();
  };

  public func deleteTeacherSchedule(
    scheduleMap : Map.Map<Text, TeacherSchedule>,
    scheduleId : Text,
  ) : Bool {
    switch (scheduleMap.get(scheduleId)) {
      case null { false };
      case (?_) {
        scheduleMap.remove(scheduleId);
        true;
      };
    };
  };
};
