import Map "mo:core/Map";
import Types "../types/extended";

module {
  public type Lesson = Types.Lesson;

  public func getLesson(
    lessonsMap : Map.Map<Text, Lesson>,
    lessonId : Text,
  ) : ?Lesson {
    lessonsMap.get(lessonId);
  };

  public func saveLesson(
    lessonsMap : Map.Map<Text, Lesson>,
    lessonId : Text,
    record : Lesson,
  ) {
    lessonsMap.add(lessonId, record);
  };

  public func getAllLessons(
    lessonsMap : Map.Map<Text, Lesson>,
  ) : [(Text, Lesson)] {
    lessonsMap.toArray();
  };

  public func getLessonsByStudent(
    lessonsMap : Map.Map<Text, Lesson>,
    studentUsername : Text,
  ) : [(Text, Lesson)] {
    lessonsMap.entries()
      .filter(func((_, l) : (Text, Lesson)) : Bool {
        l.studentUsername == studentUsername
      })
      .toArray();
  };

  public func getLessonsByTeacher(
    lessonsMap : Map.Map<Text, Lesson>,
    teacherUsername : Text,
  ) : [(Text, Lesson)] {
    lessonsMap.entries()
      .filter(func((_, l) : (Text, Lesson)) : Bool {
        l.teacherUsername == teacherUsername
      })
      .toArray();
  };

  public func deleteLesson(
    lessonsMap : Map.Map<Text, Lesson>,
    lessonId : Text,
  ) : Bool {
    switch (lessonsMap.get(lessonId)) {
      case null { false };
      case (?_) {
        lessonsMap.remove(lessonId);
        true;
      };
    };
  };
};
