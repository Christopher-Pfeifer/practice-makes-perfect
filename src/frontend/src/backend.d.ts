import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface StudentEnrollment {
    voiceType: string;
    enrollmentId: string;
    teacherUserName: string;
    instrument: string;
    studioName: string;
    theoryLevel: string;
    notes: string;
    ensembleParticipation: string;
    studentUserName: string;
    practiceGoals: string;
    skillLevel: string;
}
export interface TeacherStudent {
    teacherUserName: string;
    studentUserName: string;
}
export interface StudentLesson {
    homeworkAssigned: string;
    duration: bigint;
    teacherUsername: string;
    teacherNotes: string;
    topics: string;
    lessonDate: string;
    studentUsername: string;
    lessonEntryId: string;
}
export interface TeacherRecital {
    venue: string;
    date: string;
    recitalName: string;
    teacherUsername: string;
    studentAssignments: string;
    recitalId: string;
    notes: string;
}
export interface ProfileUpdate {
    zip?: string;
    parentAffiliation?: string;
    city?: string;
    password?: string;
    role?: Role;
    fullName?: string;
    description?: string;
    email?: string;
    teacherAffiliation?: string;
    studentAffiliations?: Array<string>;
    state?: string;
    comments?: string;
    phone?: string;
    address1?: string;
    address2?: string;
    studioAffiliation?: string;
}
export interface StudentPractice {
    duration: bigint;
    studentNotes: string;
    teacherUsername: string;
    practiceDate: string;
    teacherFeedback: string;
    studentUsername: string;
    rating: bigint;
    pieceWorkedOn: string;
    practiceId: string;
}
export interface StudentMessage {
    messageId: string;
    subject: string;
    body: string;
    teacherUsername: string;
    isRead: boolean;
    toUsername: string;
    timestamp: string;
    studentUsername: string;
    fromUsername: string;
    isPinned: boolean;
}
export interface StudentAssignment {
    status: string;
    title: string;
    attachedExampleUrl: string;
    teacherUsername: string;
    dueDate: string;
    description: string;
    teacherFeedback: string;
    assignmentId: string;
    studentUsername: string;
    priority: string;
}
export interface Profile {
    zip: string;
    username: string;
    parentAffiliation: string;
    city: string;
    password: string;
    role: Role;
    fullName: string;
    description: string;
    email: string;
    teacherAffiliation: string;
    studentAffiliations: Array<string>;
    state: string;
    comments: string;
    phone: string;
    address1: string;
    address2: string;
    studioAffiliation: string;
}
export interface TeacherStudioAffiliation {
    teacherUserName: string;
    studioName: string;
    studioUserName: string;
}
export type RestoreResult = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: string;
};
export interface MasterInstrument {
    sortOrder: bigint;
    name: string;
}
export interface ParentStudent {
    studentUserName: string;
    parentUserName: string;
}
export interface TeacherExamplePerformance {
    title: string;
    attachedToAssignmentId: string;
    teacherUsername: string;
    description: string;
    mediaUrl: string;
    performanceId: string;
    notes: string;
    commentary: string;
}
export interface TeacherSchedule {
    startTime: string;
    status: string;
    duration: bigint;
    endTime: string;
    scheduleId: string;
    dayOfWeek: string;
    teacherUsername: string;
    lessonDate: string;
    notes: string;
    studentUsername: string;
}
export interface StudentRepertoire {
    performanceDate: string;
    status: string;
    title: string;
    teacherUsername: string;
    composer: string;
    genre: string;
    notes: string;
    studentUsername: string;
    repertoireId: string;
    startDate: string;
}
export interface StudentProgress {
    goalMet: boolean;
    goalSet: string;
    date: string;
    teacherUsername: string;
    skillCategory: string;
    score: bigint;
    notes: string;
    progressId: string;
    studentUsername: string;
}
export interface StudentDetail {
    notes: string;
}
export interface StudentCollaboration {
    sharedRepertoire: string;
    members: string;
    teacherUsername: string;
    collaborationId: string;
    rehearsalDates: string;
    studentUsername: string;
    groupName: string;
    groupType: string;
}
export interface StudioDetail {
    description: string;
    website: string;
    notes: string;
    licenseNumber: string;
}
export interface StudentBilling {
    status: string;
    billingMonth: string;
    teacherUsername: string;
    amountPaid: number;
    notes: string;
    paymentDate: string;
    billingId: string;
    studentUsername: string;
    tuitionAmount: number;
}
export interface TeacherDetail {
    bio: string;
    yearsExperience: string;
    instruments: string;
    notes: string;
    certifications: string;
}
export interface Lesson {
    lessonId: string;
    status: string;
    duration: string;
    date: string;
    instrument: string;
    teacherUsername: string;
    notes: string;
    studentUsername: string;
    studioUsername: string;
}
export interface FullDump {
    studentBilling: Array<[string, StudentBilling]>;
    studentLessons: Array<[string, StudentLesson]>;
    studentProgress: Array<[string, StudentProgress]>;
    studentEnrollments: Array<[string, StudentEnrollment]>;
    studentRepertoire: Array<[string, StudentRepertoire]>;
    teacherStudents: Array<[string, TeacherStudent]>;
    studentDetails: Array<[string, StudentDetail]>;
    teacherRecitals: Array<[string, TeacherRecital]>;
    lessons: Array<[string, Lesson]>;
    studentPractices: Array<[string, StudentPractice]>;
    studentAssignments: Array<[string, StudentAssignment]>;
    studentCollaboration: Array<[string, StudentCollaboration]>;
    masterInstruments: Array<[string, MasterInstrument]>;
    teacherStudioAffiliations: Array<[string, TeacherStudioAffiliation]>;
    teacherDetails: Array<[string, TeacherDetail]>;
    studentMessages: Array<[string, StudentMessage]>;
    profiles: Array<[string, Profile]>;
    studioDetails: Array<[string, StudioDetail]>;
    parentStudents: Array<[string, ParentStudent]>;
    teacherSchedule: Array<[string, TeacherSchedule]>;
    teacherExamplePerformances: Array<[string, TeacherExamplePerformance]>;
}
export type DumpResult = {
    __kind__: "ok";
    ok: FullDump;
} | {
    __kind__: "err";
    err: string;
};
export enum Role {
    Parent = "Parent",
    Teacher = "Teacher",
    Studio = "Studio",
    Student = "Student",
    Unassigned = "Unassigned",
    Admin = "Admin"
}
export interface backendInterface {
    addAssignmentStatus(name: string, sortOrder: bigint): Promise<boolean>;
    addBillingStatus(name: string, sortOrder: bigint): Promise<boolean>;
    addCertification(name: string, sortOrder: bigint): Promise<boolean>;
    addEnsembleType(name: string, sortOrder: bigint): Promise<boolean>;
    addFactRole(name: string, sortOrder: bigint): Promise<boolean>;
    addFactState(name: string, sortOrder: bigint): Promise<boolean>;
    addGenre(name: string, sortOrder: bigint): Promise<boolean>;
    addGroupType(name: string, sortOrder: bigint): Promise<boolean>;
    addInstrument(name: string, sortOrder: bigint): Promise<boolean>;
    addParentStudent(parentUserName: string, studentUserName: string): Promise<boolean>;
    addParentStudentLink(teacherUserName: string, parentUserName: string, studentUserName: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    addPriority(name: string, sortOrder: bigint): Promise<boolean>;
    addRepertoireStatus(name: string, sortOrder: bigint): Promise<boolean>;
    addSkillCategory(name: string, sortOrder: bigint): Promise<boolean>;
    addSkillLevel(name: string, sortOrder: bigint): Promise<boolean>;
    addTeacherStudioAffiliation(teacherUserName: string, studioUserName: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    addTheoryLevel(name: string, sortOrder: bigint): Promise<boolean>;
    addVoiceType(name: string, sortOrder: bigint): Promise<boolean>;
    clearParentStudents(): Promise<void>;
    clearProfiles(): Promise<void>;
    clearStudentAssignments(): Promise<void>;
    clearStudentBilling(): Promise<void>;
    clearStudentCollaboration(): Promise<void>;
    clearStudentDetails(): Promise<void>;
    clearStudentEnrollments(): Promise<void>;
    clearStudentLessons(): Promise<void>;
    clearStudentMessages(): Promise<void>;
    clearStudentPractices(): Promise<void>;
    clearStudentProgress(): Promise<void>;
    clearStudentRepertoire(): Promise<void>;
    clearStudioDetails(): Promise<void>;
    clearTeacherDetails(): Promise<void>;
    clearTeacherExamplePerformances(): Promise<void>;
    clearTeacherRecitals(): Promise<void>;
    clearTeacherSchedule(): Promise<void>;
    clearTeacherStudents(): Promise<void>;
    clearTeacherStudioAffiliations(): Promise<void>;
    createProfile(profile: Profile): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    deleteAssignmentStatus(name: string): Promise<boolean>;
    deleteBillingStatus(name: string): Promise<boolean>;
    deleteCertification(name: string): Promise<boolean>;
    deleteEnsembleType(name: string): Promise<boolean>;
    deleteFactRole(name: string): Promise<boolean>;
    deleteFactState(name: string): Promise<boolean>;
    deleteGenre(name: string): Promise<boolean>;
    deleteGroupType(name: string): Promise<boolean>;
    deleteInstrument(name: string): Promise<boolean>;
    deleteLesson(lessonId: string): Promise<boolean>;
    deletePriority(name: string): Promise<boolean>;
    deleteProfile(username: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    deleteRepertoireStatus(name: string): Promise<boolean>;
    deleteSkillCategory(name: string): Promise<boolean>;
    deleteSkillLevel(name: string): Promise<boolean>;
    deleteStudentAssignment(assignmentId: string): Promise<boolean>;
    deleteStudentBilling(billingId: string): Promise<boolean>;
    deleteStudentCollaboration(collaborationId: string): Promise<boolean>;
    deleteStudentEnrollment(enrollmentId: string): Promise<boolean>;
    deleteStudentLesson(lessonEntryId: string): Promise<boolean>;
    deleteStudentMessage(messageId: string): Promise<boolean>;
    deleteStudentPractice(practiceId: string): Promise<boolean>;
    deleteStudentProgress(progressId: string): Promise<boolean>;
    deleteStudentRepertoire(repertoireId: string): Promise<boolean>;
    deleteTeacherExamplePerformance(performanceId: string): Promise<boolean>;
    deleteTeacherRecital(recitalId: string): Promise<boolean>;
    deleteTeacherSchedule(scheduleId: string): Promise<boolean>;
    deleteTheoryLevel(name: string): Promise<boolean>;
    deleteVoiceType(name: string): Promise<boolean>;
    fullDump(): Promise<DumpResult>;
    fullRestore(dump: FullDump, adminUsername: string, password: string): Promise<RestoreResult>;
    getAllEnrollments(): Promise<Array<StudentEnrollment>>;
    getAllLessons(): Promise<Array<[string, Lesson]>>;
    getAllParentStudents(): Promise<Array<ParentStudent>>;
    getAllProfiles(): Promise<Array<[string, Profile]>>;
    getAllStudentAssignments(): Promise<Array<[string, StudentAssignment]>>;
    getAllStudentBillings(): Promise<Array<[string, StudentBilling]>>;
    getAllStudentCollaborations(): Promise<Array<[string, StudentCollaboration]>>;
    getAllStudentDetails(): Promise<Array<[string, StudentDetail]>>;
    getAllStudentLessons(): Promise<Array<[string, StudentLesson]>>;
    getAllStudentMessages(): Promise<Array<[string, StudentMessage]>>;
    getAllStudentPractices(): Promise<Array<[string, StudentPractice]>>;
    getAllStudentProgress(): Promise<Array<[string, StudentProgress]>>;
    getAllStudentRepertoire(): Promise<Array<[string, StudentRepertoire]>>;
    getAllStudioDetails(): Promise<Array<[string, StudioDetail]>>;
    getAllTeacherDetails(): Promise<Array<[string, TeacherDetail]>>;
    getAllTeacherExamplePerformances(): Promise<Array<[string, TeacherExamplePerformance]>>;
    getAllTeacherRecitals(): Promise<Array<[string, TeacherRecital]>>;
    getAllTeacherSchedules(): Promise<Array<[string, TeacherSchedule]>>;
    getAllTeacherStudioAffiliations(): Promise<Array<TeacherStudioAffiliation>>;
    getAssignmentStatuses(): Promise<Array<string>>;
    getAssignmentsByStudent(studentUsername: string): Promise<Array<[string, StudentAssignment]>>;
    getBillingStatuses(): Promise<Array<string>>;
    getBillingsByStudent(studentUsername: string): Promise<Array<[string, StudentBilling]>>;
    getCertifications(): Promise<Array<string>>;
    getCollaborationsByStudent(studentUsername: string): Promise<Array<[string, StudentCollaboration]>>;
    getEnrollmentsByStudent(studentUserName: string): Promise<Array<StudentEnrollment>>;
    getEnrollmentsByTeacher(teacherUserName: string): Promise<Array<StudentEnrollment>>;
    getEnsembleTypes(): Promise<Array<string>>;
    getFactRoles(): Promise<Array<string>>;
    getFactStates(): Promise<Array<string>>;
    getGenres(): Promise<Array<string>>;
    getGroupTypes(): Promise<Array<string>>;
    getInstruments(): Promise<Array<string>>;
    getLesson(lessonId: string): Promise<Lesson | null>;
    getLessonEntriesByStudent(studentUsername: string): Promise<Array<[string, StudentLesson]>>;
    getLessonsByStudent(studentUsername: string): Promise<Array<[string, Lesson]>>;
    getLessonsByTeacher(teacherUsername: string): Promise<Array<[string, Lesson]>>;
    getMessagesByStudent(studentUsername: string): Promise<Array<[string, StudentMessage]>>;
    getParentStudents(parentUserName: string): Promise<Array<ParentStudent>>;
    getParentUsernames(): Promise<Array<string>>;
    getPerformancesByTeacher(teacherUsername: string): Promise<Array<[string, TeacherExamplePerformance]>>;
    getPracticesByStudent(studentUsername: string): Promise<Array<[string, StudentPractice]>>;
    getPriorities(): Promise<Array<string>>;
    getProgressByStudent(studentUsername: string): Promise<Array<[string, StudentProgress]>>;
    getRecitalsByTeacher(teacherUsername: string): Promise<Array<[string, TeacherRecital]>>;
    getRepertoireByStudent(studentUsername: string): Promise<Array<[string, StudentRepertoire]>>;
    getRepertoireStatuses(): Promise<Array<string>>;
    getSchedulesByTeacher(teacherUsername: string): Promise<Array<[string, TeacherSchedule]>>;
    getSkillCategories(): Promise<Array<string>>;
    getSkillLevels(): Promise<Array<string>>;
    getStudentAssignment(assignmentId: string): Promise<StudentAssignment | null>;
    getStudentAssignmentsByTeacher(teacherUsername: string): Promise<Array<[string, StudentAssignment]>>;
    getStudentBillingRecord(billingId: string): Promise<StudentBilling | null>;
    getStudentBillingsByTeacher(teacherUsername: string): Promise<Array<[string, StudentBilling]>>;
    getStudentCollaboration(collaborationId: string): Promise<StudentCollaboration | null>;
    getStudentCollaborationsByTeacher(teacherUsername: string): Promise<Array<[string, StudentCollaboration]>>;
    getStudentDetail(username: string): Promise<StudentDetail | null>;
    getStudentEnrollment(enrollmentId: string): Promise<StudentEnrollment | null>;
    getStudentLesson(lessonEntryId: string): Promise<StudentLesson | null>;
    getStudentLessonsByTeacher(teacherUsername: string): Promise<Array<[string, StudentLesson]>>;
    getStudentMessage(messageId: string): Promise<StudentMessage | null>;
    getStudentMessagesByTeacher(teacherUsername: string): Promise<Array<[string, StudentMessage]>>;
    getStudentParents(studentUserName: string): Promise<Array<ParentStudent>>;
    getStudentPractice(practiceId: string): Promise<StudentPractice | null>;
    getStudentPracticesByTeacher(teacherUsername: string): Promise<Array<[string, StudentPractice]>>;
    getStudentProgressByTeacher(teacherUsername: string): Promise<Array<[string, StudentProgress]>>;
    getStudentProgressRecord(progressId: string): Promise<StudentProgress | null>;
    getStudentRepertoireByTeacher(teacherUsername: string): Promise<Array<[string, StudentRepertoire]>>;
    getStudentRepertoireRecord(repertoireId: string): Promise<StudentRepertoire | null>;
    getStudentTeachers(studentUserName: string): Promise<Array<string>>;
    getStudioDetail(username: string): Promise<StudioDetail | null>;
    getStudioTeacherAffiliations(studioUserName: string): Promise<Array<TeacherStudioAffiliation>>;
    getStudioUsernames(): Promise<Array<string>>;
    getTeacherAnalytics(teacherUsername: string): Promise<{
        studentsByInstrument: Array<[string, bigint]>;
        studentsBySkillLevel: Array<[string, bigint]>;
        studentCount: bigint;
    }>;
    getTeacherDetail(username: string): Promise<TeacherDetail | null>;
    getTeacherExamplePerformance(performanceId: string): Promise<TeacherExamplePerformance | null>;
    getTeacherRecital(recitalId: string): Promise<TeacherRecital | null>;
    getTeacherSchedule(scheduleId: string): Promise<TeacherSchedule | null>;
    getTeacherStudents(teacherUserName: string): Promise<Array<string>>;
    getTeacherStudioAffiliations(teacherUserName: string): Promise<Array<TeacherStudioAffiliation>>;
    getTeacherUsernames(): Promise<Array<string>>;
    getTheoryLevels(): Promise<Array<string>>;
    getVoiceTypes(): Promise<Array<string>>;
    onboardStudent(createProfile: boolean, profile: Profile, enrollment: StudentEnrollment): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    onboardStudentWithParent(createStudentProfile: boolean, studentProfile: Profile, enrollment: StudentEnrollment, createParentProfile: boolean, parentProfile: Profile | null, linkParent: boolean, parentUserName: string | null): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    ping(): Promise<string>;
    removeParentStudent(parentUserName: string, studentUserName: string): Promise<boolean>;
    removeParentStudentLink(teacherUserName: string, parentUserName: string, studentUserName: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    removeTeacherStudioAffiliation(teacherUserName: string, studioUserName: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    saveLesson(lessonId: string, record: Lesson): Promise<void>;
    saveStudentAssignment(assignmentId: string, record: StudentAssignment): Promise<void>;
    saveStudentBilling(billingId: string, record: StudentBilling): Promise<void>;
    saveStudentCollaboration(collaborationId: string, record: StudentCollaboration): Promise<void>;
    saveStudentDetail(username: string, detail: StudentDetail): Promise<void>;
    saveStudentEnrollment(enrollmentId: string, record: StudentEnrollment): Promise<void>;
    saveStudentLesson(lessonEntryId: string, record: StudentLesson): Promise<void>;
    saveStudentMessage(messageId: string, record: StudentMessage): Promise<void>;
    saveStudentPractice(practiceId: string, record: StudentPractice): Promise<void>;
    saveStudentProgress(progressId: string, record: StudentProgress): Promise<void>;
    saveStudentRepertoire(repertoireId: string, record: StudentRepertoire): Promise<void>;
    saveStudioDetail(username: string, detail: StudioDetail): Promise<void>;
    saveTeacherDetail(username: string, detail: TeacherDetail): Promise<void>;
    saveTeacherExamplePerformance(performanceId: string, record: TeacherExamplePerformance): Promise<void>;
    saveTeacherRecital(recitalId: string, record: TeacherRecital): Promise<void>;
    saveTeacherSchedule(scheduleId: string, record: TeacherSchedule): Promise<void>;
    searchStudents(searchQuery: string): Promise<Array<Profile>>;
    signIn(username: string, password: string): Promise<{
        __kind__: "ok";
        ok: Profile;
    } | {
        __kind__: "err";
        err: string;
    }>;
    signUp(username: string, password: string, fullName: string, role: Role): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    teacherDump(teacherUsername: string, password: string): Promise<DumpResult>;
    teacherRestore(dump: FullDump, teacherUsername: string, password: string): Promise<RestoreResult>;
    updateAssignmentStatus(oldName: string, newName: string, sortOrder: bigint): Promise<boolean>;
    updateBillingStatus(oldName: string, newName: string, sortOrder: bigint): Promise<boolean>;
    updateCertification(oldName: string, newName: string, sortOrder: bigint): Promise<boolean>;
    updateEnsembleType(oldName: string, newName: string, sortOrder: bigint): Promise<boolean>;
    updateFactRole(oldName: string, newName: string, sortOrder: bigint): Promise<boolean>;
    updateFactState(oldName: string, newName: string, sortOrder: bigint): Promise<boolean>;
    updateGenre(oldName: string, newName: string, sortOrder: bigint): Promise<boolean>;
    updateGroupType(oldName: string, newName: string, sortOrder: bigint): Promise<boolean>;
    updateInstrument(oldName: string, newName: string, sortOrder: bigint): Promise<boolean>;
    updateParentProfile(teacherUserName: string, parentUserName: string, profileUpdate: ProfileUpdate): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    updatePriority(oldName: string, newName: string, sortOrder: bigint): Promise<boolean>;
    updateProfile(username: string, update: ProfileUpdate): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    updateRepertoireStatus(oldName: string, newName: string, sortOrder: bigint): Promise<boolean>;
    updateSkillCategory(oldName: string, newName: string, sortOrder: bigint): Promise<boolean>;
    updateSkillLevel(oldName: string, newName: string, sortOrder: bigint): Promise<boolean>;
    updateStudentEnrollment(enrollmentId: string, teacherUserName: string, update: StudentEnrollment): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    updateStudentProfile(teacherUserName: string, studentUserName: string, profileUpdate: ProfileUpdate, detailUpdate: StudentDetail): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    updateTeacherProfile(teacherUserName: string, profileUpdate: ProfileUpdate, detailUpdate: TeacherDetail): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    updateTheoryLevel(oldName: string, newName: string, sortOrder: bigint): Promise<boolean>;
    updateVoiceType(oldName: string, newName: string, sortOrder: bigint): Promise<boolean>;
}
