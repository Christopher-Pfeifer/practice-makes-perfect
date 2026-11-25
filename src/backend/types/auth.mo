module {
  public type Role = {
    #Studio;
    #Teacher;
    #Student;
    #Parent;
    #Admin;
    #Unassigned;
  };

  public type Profile = {
    username : Text;
    password : Text;
    fullName : Text;
    address1 : Text;
    address2 : Text;
    city : Text;
    state : Text;
    zip : Text;
    phone : Text;
    email : Text;
    role : Role;
    studioAffiliation : Text;
    teacherAffiliation : Text;
    parentAffiliation : Text;
    studentAffiliations : [Text];
    description : Text;
    comments : Text;
  };

  public type ProfileUpdate = {
    password : ?Text;
    fullName : ?Text;
    address1 : ?Text;
    address2 : ?Text;
    city : ?Text;
    state : ?Text;
    zip : ?Text;
    phone : ?Text;
    email : ?Text;
    role : ?Role;
    studioAffiliation : ?Text;
    teacherAffiliation : ?Text;
    parentAffiliation : ?Text;
    studentAffiliations : ?[Text];
    description : ?Text;
    comments : ?Text;
  };
  public type StudioDetail = {
    website : Text;
    licenseNumber : Text;
    description : Text;
    notes : Text;
  };

  public type TeacherDetail = {
    instruments : Text;
    bio : Text;
    yearsExperience : Text;
    certifications : Text;
    notes : Text;
  };

  public type TeacherStudioAffiliation = {
    teacherUserName : Text;
    studioUserName : Text;
    studioName : Text;
  };

  public type TeacherStudent = {
    teacherUserName : Text;
    studentUserName : Text;
  };

  public type ParentStudent = {
    parentUserName : Text;
    studentUserName : Text;
  };

  public type StudentDetail = {
    notes : Text;
  };

  public type MasterInstrument = {
    name : Text;
    sortOrder : Nat;
  };

  public type StudentEnrollment = {
    enrollmentId : Text;
    studentUserName : Text;
    teacherUserName : Text;
    instrument : Text;
    voiceType : Text;
    skillLevel : Text;
    theoryLevel : Text;
    ensembleParticipation : Text;
    practiceGoals : Text;
    notes : Text;
    studioName : Text;
  };
};
