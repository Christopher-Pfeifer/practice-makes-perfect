import Map "mo:core/Map";
import Types "../types/auth";

module {
  public type StudioDetail = Types.StudioDetail;
  public type TeacherDetail = Types.TeacherDetail;
  public type StudentDetail = Types.StudentDetail;

  public func getStudioDetail(
    studioDetails : Map.Map<Text, StudioDetail>,
    username : Text,
  ) : ?StudioDetail {
    studioDetails.get(username);
  };

  public func saveStudioDetail(
    studioDetails : Map.Map<Text, StudioDetail>,
    username : Text,
    detail : StudioDetail,
  ) {
    studioDetails.add(username, detail);
  };

  public func getAllStudioDetails(
    studioDetails : Map.Map<Text, StudioDetail>,
  ) : [(Text, StudioDetail)] {
    studioDetails.toArray();
  };

  public func getTeacherDetail(
    teacherDetails : Map.Map<Text, TeacherDetail>,
    username : Text,
  ) : ?TeacherDetail {
    teacherDetails.get(username);
  };

  public func saveTeacherDetail(
    teacherDetails : Map.Map<Text, TeacherDetail>,
    username : Text,
    detail : TeacherDetail,
  ) {
    teacherDetails.add(username, detail);
  };

  public func getAllTeacherDetails(
    teacherDetails : Map.Map<Text, TeacherDetail>,
  ) : [(Text, TeacherDetail)] {
    teacherDetails.toArray();
  };

  public func getStudentDetail(
    studentDetails : Map.Map<Text, StudentDetail>,
    username : Text,
  ) : ?StudentDetail {
    studentDetails.get(username);
  };

  public func saveStudentDetail(
    studentDetails : Map.Map<Text, StudentDetail>,
    username : Text,
    detail : StudentDetail,
  ) {
    studentDetails.add(username, detail);
  };

  public func getAllStudentDetails(
    studentDetails : Map.Map<Text, StudentDetail>,
  ) : [(Text, StudentDetail)] {
    studentDetails.toArray();
  };

};
