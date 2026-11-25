import { useEffect, useState } from "react";
import type {
  StudentAssignment,
  StudentBilling,
  StudentCollaboration,
  StudentDetail,
  StudentLesson,
  StudentMessage,
  StudentPractice,
  StudentProgress,
  StudentRepertoire,
} from "../backend";
import { getActor } from "../lib/actor";
import type { UserProfile } from "../types/auth";

export type TableType =
  | "lessons"
  | "practices"
  | "assignments"
  | "progress"
  | "repertoire"
  | "messages"
  | "billing"
  | "collaboration";

interface Props {
  profile: UserProfile;
  tableType: TableType;
  title: string;
  onClose?: () => void;
}

type AnyRecord =
  | StudentLesson
  | StudentPractice
  | StudentAssignment
  | StudentProgress
  | StudentRepertoire
  | StudentMessage
  | StudentBilling
  | StudentCollaboration;

const CARD = {
  background: "#1a2540",
  border: "1px solid rgba(201,168,76,0.2)",
  borderRadius: 8,
  padding: 16,
  marginBottom: 12,
};
const LS = { color: "#8a9bb5", fontSize: 12, marginBottom: 4 };
const IS: React.CSSProperties = {
  width: "100%",
  background: "#0f1729",
  border: "1px solid rgba(201,168,76,0.3)",
  borderRadius: 4,
  color: "#f5f0e8",
  padding: "6px 10px",
  fontSize: 14,
  marginBottom: 10,
};
const SS: React.CSSProperties = { ...IS, height: 70, resize: "vertical" };
const BG: React.CSSProperties = {
  background: "rgba(201,168,76,0.15)",
  border: "1px solid rgba(201,168,76,0.5)",
  color: "#c9a84c",
  borderRadius: 4,
  padding: "6px 14px",
  cursor: "pointer",
  fontSize: 13,
  marginRight: 8,
};
const BD: React.CSSProperties = {
  background: "rgba(220,50,50,0.1)",
  border: "1px solid rgba(220,50,50,0.4)",
  color: "#f87171",
  borderRadius: 4,
  padding: "6px 14px",
  cursor: "pointer",
  fontSize: 13,
};
const BC: React.CSSProperties = {
  background: "transparent",
  border: "1px solid rgba(138,155,181,0.3)",
  color: "#8a9bb5",
  borderRadius: 4,
  padding: "6px 14px",
  cursor: "pointer",
  fontSize: 13,
  marginRight: 8,
};

function getIdField(tableType: TableType): string {
  const map: Record<TableType, string> = {
    lessons: "lessonEntryId",
    practices: "practiceId",
    assignments: "assignmentId",
    progress: "progressId",
    repertoire: "repertoireId",
    messages: "messageId",
    billing: "billingId",
    collaboration: "collaborationId",
  };
  return map[tableType];
}

function getRecordId(r: AnyRecord, tableType: TableType): string {
  return (r as unknown as Record<string, string>)[getIdField(tableType)];
}

function getRecordSummary(
  r: AnyRecord,
  tableType: TableType,
): { primary: string; secondary: string } {
  switch (tableType) {
    case "lessons": {
      const l = r as StudentLesson;
      return {
        primary: l.lessonDate || "(no date)",
        secondary: `${Number(l.duration)} min · ${l.topics || ""}`,
      };
    }
    case "practices": {
      const p = r as StudentPractice;
      return {
        primary: p.practiceDate || "(no date)",
        secondary: `${Number(p.duration)} min · ${p.pieceWorkedOn || ""}`,
      };
    }
    case "assignments": {
      const a = r as StudentAssignment;
      return {
        primary: a.title || "(untitled)",
        secondary: `${a.priority} · ${a.status} · Due: ${a.dueDate}`,
      };
    }
    case "progress": {
      const pg = r as StudentProgress;
      return {
        primary: pg.skillCategory || "(category)",
        secondary: `Score: ${Number(pg.score)} · ${pg.date}`,
      };
    }
    case "repertoire": {
      const rp = r as StudentRepertoire;
      return {
        primary: rp.title || "(untitled)",
        secondary: `${rp.composer} · ${rp.status}`,
      };
    }
    case "messages": {
      const m = r as StudentMessage;
      return {
        primary: m.subject || "(no subject)",
        secondary: `To: ${m.toUsername} · ${m.timestamp?.slice(0, 10)}`,
      };
    }
    case "billing": {
      const b = r as StudentBilling;
      return {
        primary: b.billingMonth || "(no month)",
        secondary: `$${b.tuitionAmount} · Paid: $${b.amountPaid} · ${b.status}`,
      };
    }
    case "collaboration": {
      const c = r as StudentCollaboration;
      return { primary: c.groupName || "(group)", secondary: `${c.groupType}` };
    }
  }
}

async function fetchRecords(
  actor: Awaited<ReturnType<typeof getActor>>,
  tableType: TableType,
  studentUsername: string,
): Promise<AnyRecord[]> {
  switch (tableType) {
    case "lessons":
      return (await actor.getLessonEntriesByStudent(studentUsername)).map(
        ([, r]) => r,
      );
    case "practices":
      return (await actor.getPracticesByStudent(studentUsername)).map(
        ([, r]) => r,
      );
    case "assignments":
      return (await actor.getAssignmentsByStudent(studentUsername)).map(
        ([, r]) => r,
      );
    case "progress":
      return (await actor.getProgressByStudent(studentUsername)).map(
        ([, r]) => r,
      );
    case "repertoire":
      return (await actor.getRepertoireByStudent(studentUsername)).map(
        ([, r]) => r,
      );
    case "messages":
      return (await actor.getMessagesByStudent(studentUsername)).map(
        ([, r]) => r,
      );
    case "billing":
      return (await actor.getBillingsByStudent(studentUsername)).map(
        ([, r]) => r,
      );
    case "collaboration":
      return (await actor.getCollaborationsByStudent(studentUsername)).map(
        ([, r]) => r,
      );
  }
}

async function saveRecord(
  actor: Awaited<ReturnType<typeof getActor>>,
  tableType: TableType,
  id: string,
  record: AnyRecord,
): Promise<void> {
  switch (tableType) {
    case "lessons":
      return actor.saveStudentLesson(id, record as StudentLesson);
    case "practices":
      return actor.saveStudentPractice(id, record as StudentPractice);
    case "assignments":
      return actor.saveStudentAssignment(id, record as StudentAssignment);
    case "progress":
      return actor.saveStudentProgress(id, record as StudentProgress);
    case "repertoire":
      return actor.saveStudentRepertoire(id, record as StudentRepertoire);
    case "messages":
      return actor.saveStudentMessage(id, record as StudentMessage);
    case "billing":
      return actor.saveStudentBilling(id, record as StudentBilling);
    case "collaboration":
      return actor.saveStudentCollaboration(id, record as StudentCollaboration);
  }
}

async function deleteRecord(
  actor: Awaited<ReturnType<typeof getActor>>,
  tableType: TableType,
  id: string,
): Promise<boolean> {
  switch (tableType) {
    case "lessons":
      return actor.deleteStudentLesson(id);
    case "practices":
      return actor.deleteStudentPractice(id);
    case "assignments":
      return actor.deleteStudentAssignment(id);
    case "progress":
      return actor.deleteStudentProgress(id);
    case "repertoire":
      return actor.deleteStudentRepertoire(id);
    case "messages":
      return actor.deleteStudentMessage(id);
    case "billing":
      return actor.deleteStudentBilling(id);
    case "collaboration":
      return actor.deleteStudentCollaboration(id);
  }
}

// ─── Form state types ───────────────────────────────────────────────────────

type LessonForm = {
  lessonDate: string;
  duration: string;
  topics: string;
  teacherNotes: string;
  homeworkAssigned: string;
};
type PracticeForm = {
  practiceDate: string;
  duration: string;
  pieceWorkedOn: string;
  studentNotes: string;
  teacherFeedback: string;
  rating: string;
};
type AssignmentForm = {
  title: string;
  description: string;
  dueDate: string;
  priority: string;
  status: string;
  teacherFeedback: string;
  attachedExampleUrl: string;
};
type ProgressForm = {
  date: string;
  skillCategory: string;
  score: string;
  notes: string;
  goalSet: string;
  goalMet: boolean;
};
type RepertoireForm = {
  title: string;
  composer: string;
  genre: string;
  startDate: string;
  performanceDate: string;
  status: string;
  notes: string;
};
type MessageForm = {
  subject: string;
  body: string;
  toUsername: string;
  isRead: boolean;
  isPinned: boolean;
};
type BillingForm = {
  billingMonth: string;
  tuitionAmount: string;
  amountPaid: string;
  paymentDate: string;
  status: string;
  notes: string;
};
type CollaborationForm = {
  groupName: string;
  groupType: string;
  members: string;
  sharedRepertoire: string;
  rehearsalDates: string;
};
type AnyForm =
  | LessonForm
  | PracticeForm
  | AssignmentForm
  | ProgressForm
  | RepertoireForm
  | MessageForm
  | BillingForm
  | CollaborationForm;

function emptyForm(tableType: TableType): AnyForm {
  switch (tableType) {
    case "lessons":
      return {
        lessonDate: "",
        duration: "30",
        topics: "",
        teacherNotes: "",
        homeworkAssigned: "",
      };
    case "practices":
      return {
        practiceDate: "",
        duration: "30",
        pieceWorkedOn: "",
        studentNotes: "",
        teacherFeedback: "",
        rating: "5",
      };
    case "assignments":
      return {
        title: "",
        description: "",
        dueDate: "",
        priority: "Medium",
        status: "Pending",
        teacherFeedback: "",
        attachedExampleUrl: "",
      };
    case "progress":
      return {
        date: "",
        skillCategory: "",
        score: "50",
        notes: "",
        goalSet: "",
        goalMet: false,
      };
    case "repertoire":
      return {
        title: "",
        composer: "",
        genre: "",
        startDate: "",
        performanceDate: "",
        status: "Learning",
        notes: "",
      };
    case "messages":
      return {
        subject: "",
        body: "",
        toUsername: "",
        isRead: false,
        isPinned: false,
      };
    case "billing":
      return {
        billingMonth: "",
        tuitionAmount: "0",
        amountPaid: "0",
        paymentDate: "",
        status: "Unpaid",
        notes: "",
      };
    case "collaboration":
      return {
        groupName: "",
        groupType: "",
        members: "",
        sharedRepertoire: "",
        rehearsalDates: "",
      };
  }
}

function formFromRecord(r: AnyRecord, tableType: TableType): AnyForm {
  switch (tableType) {
    case "lessons": {
      const l = r as StudentLesson;
      return {
        lessonDate: l.lessonDate,
        duration: String(Number(l.duration)),
        topics: l.topics,
        teacherNotes: l.teacherNotes,
        homeworkAssigned: l.homeworkAssigned,
      };
    }
    case "practices": {
      const p = r as StudentPractice;
      return {
        practiceDate: p.practiceDate,
        duration: String(Number(p.duration)),
        pieceWorkedOn: p.pieceWorkedOn,
        studentNotes: p.studentNotes,
        teacherFeedback: p.teacherFeedback,
        rating: String(Number(p.rating)),
      };
    }
    case "assignments": {
      const a = r as StudentAssignment;
      return {
        title: a.title,
        description: a.description,
        dueDate: a.dueDate,
        priority: a.priority,
        status: a.status,
        teacherFeedback: a.teacherFeedback,
        attachedExampleUrl: a.attachedExampleUrl,
      };
    }
    case "progress": {
      const pg = r as StudentProgress;
      return {
        date: pg.date,
        skillCategory: pg.skillCategory,
        score: String(Number(pg.score)),
        notes: pg.notes,
        goalSet: pg.goalSet,
        goalMet: pg.goalMet,
      };
    }
    case "repertoire": {
      const rp = r as StudentRepertoire;
      return {
        title: rp.title,
        composer: rp.composer,
        genre: rp.genre,
        startDate: rp.startDate,
        performanceDate: rp.performanceDate,
        status: rp.status,
        notes: rp.notes,
      };
    }
    case "messages": {
      const m = r as StudentMessage;
      return {
        subject: m.subject,
        body: m.body,
        toUsername: m.toUsername,
        isRead: m.isRead,
        isPinned: m.isPinned,
      };
    }
    case "billing": {
      const b = r as StudentBilling;
      return {
        billingMonth: b.billingMonth,
        tuitionAmount: String(b.tuitionAmount),
        amountPaid: String(b.amountPaid),
        paymentDate: b.paymentDate,
        status: b.status,
        notes: b.notes,
      };
    }
    case "collaboration": {
      const c = r as StudentCollaboration;
      return {
        groupName: c.groupName,
        groupType: c.groupType,
        members: c.members,
        sharedRepertoire: c.sharedRepertoire,
        rehearsalDates: c.rehearsalDates,
      };
    }
  }
}

function buildRecord(
  form: AnyForm,
  tableType: TableType,
  id: string,
  teacherUsername: string,
  studentUsername: string,
): AnyRecord {
  switch (tableType) {
    case "lessons": {
      const f = form as LessonForm;
      return {
        lessonEntryId: id,
        teacherUsername,
        studentUsername,
        lessonDate: f.lessonDate,
        duration: BigInt(Number(f.duration) || 0),
        topics: f.topics,
        teacherNotes: f.teacherNotes,
        homeworkAssigned: f.homeworkAssigned,
      };
    }
    case "practices": {
      const f = form as PracticeForm;
      return {
        practiceId: id,
        teacherUsername,
        studentUsername,
        practiceDate: f.practiceDate,
        duration: BigInt(Number(f.duration) || 0),
        pieceWorkedOn: f.pieceWorkedOn,
        studentNotes: f.studentNotes,
        teacherFeedback: f.teacherFeedback,
        rating: BigInt(Number(f.rating) || 0),
      };
    }
    case "assignments": {
      const f = form as AssignmentForm;
      return {
        assignmentId: id,
        teacherUsername,
        studentUsername,
        title: f.title,
        description: f.description,
        dueDate: f.dueDate,
        priority: f.priority,
        status: f.status,
        teacherFeedback: f.teacherFeedback,
        attachedExampleUrl: f.attachedExampleUrl,
      };
    }
    case "progress": {
      const f = form as ProgressForm;
      return {
        progressId: id,
        teacherUsername,
        studentUsername,
        date: f.date,
        skillCategory: f.skillCategory,
        score: BigInt(Number(f.score) || 0),
        notes: f.notes,
        goalSet: f.goalSet,
        goalMet: f.goalMet,
      };
    }
    case "repertoire": {
      const f = form as RepertoireForm;
      return {
        repertoireId: id,
        teacherUsername,
        studentUsername,
        title: f.title,
        composer: f.composer,
        genre: f.genre,
        startDate: f.startDate,
        performanceDate: f.performanceDate,
        status: f.status,
        notes: f.notes,
      };
    }
    case "messages": {
      const f = form as MessageForm;
      return {
        messageId: id,
        teacherUsername,
        studentUsername,
        fromUsername: teacherUsername,
        toUsername: f.toUsername || studentUsername,
        subject: f.subject,
        body: f.body,
        timestamp: new Date().toISOString(),
        isRead: f.isRead,
        isPinned: f.isPinned,
      };
    }
    case "billing": {
      const f = form as BillingForm;
      return {
        billingId: id,
        teacherUsername,
        studentUsername,
        billingMonth: f.billingMonth,
        tuitionAmount: Number.parseFloat(f.tuitionAmount) || 0,
        amountPaid: Number.parseFloat(f.amountPaid) || 0,
        paymentDate: f.paymentDate,
        status: f.status,
        notes: f.notes,
      };
    }
    case "collaboration": {
      const f = form as CollaborationForm;
      return {
        collaborationId: id,
        teacherUsername,
        studentUsername,
        groupName: f.groupName,
        groupType: f.groupType,
        members: f.members,
        sharedRepertoire: f.sharedRepertoire,
        rehearsalDates: f.rehearsalDates,
      };
    }
  }
}

// ─── Form renderer ──────────────────────────────────────────────────────────

function renderFormFields(
  tableType: TableType,
  form: AnyForm,
  setForm: React.Dispatch<React.SetStateAction<AnyForm>>,
) {
  function set(k: string, v: string | boolean) {
    setForm((f) => ({ ...f, [k]: v }));
  }
  switch (tableType) {
    case "lessons": {
      const f = form as LessonForm;
      return (
        <>
          <div style={LS}>Lesson Date</div>
          <input
            type="date"
            style={IS}
            value={f.lessonDate}
            onChange={(e) => set("lessonDate", e.target.value)}
          />
          <div style={LS}>Duration (min)</div>
          <input
            type="number"
            style={IS}
            value={f.duration}
            onChange={(e) => set("duration", e.target.value)}
          />
          <div style={LS}>Topics</div>
          <input
            style={IS}
            value={f.topics}
            onChange={(e) => set("topics", e.target.value)}
          />
          <div style={LS}>Teacher Notes</div>
          <textarea
            style={SS}
            value={f.teacherNotes}
            onChange={(e) => set("teacherNotes", e.target.value)}
          />
          <div style={LS}>Homework Assigned</div>
          <textarea
            style={SS}
            value={f.homeworkAssigned}
            onChange={(e) => set("homeworkAssigned", e.target.value)}
          />
        </>
      );
    }
    case "practices": {
      const f = form as PracticeForm;
      return (
        <>
          <div style={LS}>Practice Date</div>
          <input
            type="date"
            style={IS}
            value={f.practiceDate}
            onChange={(e) => set("practiceDate", e.target.value)}
          />
          <div style={LS}>Duration (min)</div>
          <input
            type="number"
            style={IS}
            value={f.duration}
            onChange={(e) => set("duration", e.target.value)}
          />
          <div style={LS}>Piece Worked On</div>
          <input
            style={IS}
            value={f.pieceWorkedOn}
            onChange={(e) => set("pieceWorkedOn", e.target.value)}
          />
          <div style={LS}>Student Notes</div>
          <textarea
            style={SS}
            value={f.studentNotes}
            onChange={(e) => set("studentNotes", e.target.value)}
          />
          <div style={LS}>Teacher Feedback</div>
          <textarea
            style={SS}
            value={f.teacherFeedback}
            onChange={(e) => set("teacherFeedback", e.target.value)}
          />
          <div style={LS}>Rating (0–10)</div>
          <input
            type="number"
            min="0"
            max="10"
            style={IS}
            value={f.rating}
            onChange={(e) => set("rating", e.target.value)}
          />
        </>
      );
    }
    case "assignments": {
      const f = form as AssignmentForm;
      return (
        <>
          <div style={LS}>Title</div>
          <input
            style={IS}
            value={f.title}
            onChange={(e) => set("title", e.target.value)}
          />
          <div style={LS}>Description</div>
          <textarea
            style={SS}
            value={f.description}
            onChange={(e) => set("description", e.target.value)}
          />
          <div style={LS}>Due Date</div>
          <input
            type="date"
            style={IS}
            value={f.dueDate}
            onChange={(e) => set("dueDate", e.target.value)}
          />
          <div style={LS}>Priority</div>
          <select
            style={IS}
            value={f.priority}
            onChange={(e) => set("priority", e.target.value)}
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
          <div style={LS}>Status</div>
          <select
            style={IS}
            value={f.status}
            onChange={(e) => set("status", e.target.value)}
          >
            <option>Pending</option>
            <option>In Progress</option>
            <option>Completed</option>
          </select>
          <div style={LS}>Teacher Feedback</div>
          <textarea
            style={SS}
            value={f.teacherFeedback}
            onChange={(e) => set("teacherFeedback", e.target.value)}
          />
          <div style={LS}>Attached Example URL</div>
          <input
            style={IS}
            value={f.attachedExampleUrl}
            onChange={(e) => set("attachedExampleUrl", e.target.value)}
          />
        </>
      );
    }
    case "progress": {
      const f = form as ProgressForm;
      return (
        <>
          <div style={LS}>Date</div>
          <input
            type="date"
            style={IS}
            value={f.date}
            onChange={(e) => set("date", e.target.value)}
          />
          <div style={LS}>Skill Category</div>
          <input
            style={IS}
            value={f.skillCategory}
            onChange={(e) => set("skillCategory", e.target.value)}
          />
          <div style={LS}>Score (0–100)</div>
          <input
            type="number"
            min="0"
            max="100"
            style={IS}
            value={f.score}
            onChange={(e) => set("score", e.target.value)}
          />
          <div style={LS}>Notes</div>
          <textarea
            style={SS}
            value={f.notes}
            onChange={(e) => set("notes", e.target.value)}
          />
          <div style={LS}>Goal Set</div>
          <input
            style={IS}
            value={f.goalSet}
            onChange={(e) => set("goalSet", e.target.value)}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 10,
            }}
          >
            <input
              type="checkbox"
              id="goalMet"
              checked={f.goalMet}
              onChange={(e) => set("goalMet", e.target.checked)}
              style={{ accentColor: "#c9a84c" }}
            />
            <label htmlFor="goalMet" style={{ color: "#8a9bb5", fontSize: 13 }}>
              Goal Met
            </label>
          </div>
        </>
      );
    }
    case "repertoire": {
      const f = form as RepertoireForm;
      return (
        <>
          <div style={LS}>Title</div>
          <input
            style={IS}
            value={f.title}
            onChange={(e) => set("title", e.target.value)}
          />
          <div style={LS}>Composer</div>
          <input
            style={IS}
            value={f.composer}
            onChange={(e) => set("composer", e.target.value)}
          />
          <div style={LS}>Genre</div>
          <input
            style={IS}
            value={f.genre}
            onChange={(e) => set("genre", e.target.value)}
          />
          <div style={LS}>Start Date</div>
          <input
            type="date"
            style={IS}
            value={f.startDate}
            onChange={(e) => set("startDate", e.target.value)}
          />
          <div style={LS}>Performance Date</div>
          <input
            type="date"
            style={IS}
            value={f.performanceDate}
            onChange={(e) => set("performanceDate", e.target.value)}
          />
          <div style={LS}>Status</div>
          <select
            style={IS}
            value={f.status}
            onChange={(e) => set("status", e.target.value)}
          >
            <option>Learning</option>
            <option>Ready</option>
            <option>Performed</option>
          </select>
          <div style={LS}>Notes</div>
          <textarea
            style={SS}
            value={f.notes}
            onChange={(e) => set("notes", e.target.value)}
          />
        </>
      );
    }
    case "messages": {
      const f = form as MessageForm;
      return (
        <>
          <div style={LS}>Subject</div>
          <input
            style={IS}
            value={f.subject}
            onChange={(e) => set("subject", e.target.value)}
          />
          <div style={LS}>Body</div>
          <textarea
            style={{ ...SS, height: 90 }}
            value={f.body}
            onChange={(e) => set("body", e.target.value)}
          />
          <div style={{ display: "flex", gap: 16, marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input
                type="checkbox"
                id="isRead"
                checked={f.isRead}
                onChange={(e) => set("isRead", e.target.checked)}
                style={{ accentColor: "#c9a84c" }}
              />
              <label
                htmlFor="isRead"
                style={{ color: "#8a9bb5", fontSize: 13 }}
              >
                Is Read
              </label>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input
                type="checkbox"
                id="isPinned"
                checked={f.isPinned}
                onChange={(e) => set("isPinned", e.target.checked)}
                style={{ accentColor: "#c9a84c" }}
              />
              <label
                htmlFor="isPinned"
                style={{ color: "#8a9bb5", fontSize: 13 }}
              >
                Pinned
              </label>
            </div>
          </div>
        </>
      );
    }
    case "billing": {
      const f = form as BillingForm;
      return (
        <>
          <div style={LS}>Billing Month (e.g. 2026-05)</div>
          <input
            style={IS}
            value={f.billingMonth}
            onChange={(e) => set("billingMonth", e.target.value)}
          />
          <div style={LS}>Tuition Amount ($)</div>
          <input
            type="number"
            step="0.01"
            style={IS}
            value={f.tuitionAmount}
            onChange={(e) => set("tuitionAmount", e.target.value)}
          />
          <div style={LS}>Amount Paid ($)</div>
          <input
            type="number"
            step="0.01"
            style={IS}
            value={f.amountPaid}
            onChange={(e) => set("amountPaid", e.target.value)}
          />
          <div style={LS}>Payment Date</div>
          <input
            type="date"
            style={IS}
            value={f.paymentDate}
            onChange={(e) => set("paymentDate", e.target.value)}
          />
          <div style={LS}>Status</div>
          <select
            style={IS}
            value={f.status}
            onChange={(e) => set("status", e.target.value)}
          >
            <option>Paid</option>
            <option>Partial</option>
            <option>Unpaid</option>
            <option>Waived</option>
          </select>
          <div style={LS}>Notes</div>
          <textarea
            style={SS}
            value={f.notes}
            onChange={(e) => set("notes", e.target.value)}
          />
        </>
      );
    }
    case "collaboration": {
      const f = form as CollaborationForm;
      return (
        <>
          <div style={LS}>Group Name</div>
          <input
            style={IS}
            value={f.groupName}
            onChange={(e) => set("groupName", e.target.value)}
          />
          <div style={LS}>Group Type</div>
          <input
            style={IS}
            value={f.groupType}
            onChange={(e) => set("groupType", e.target.value)}
          />
          <div style={LS}>Members (pipe-separated usernames)</div>
          <textarea
            style={SS}
            value={f.members}
            onChange={(e) => set("members", e.target.value)}
          />
          <div style={LS}>Shared Repertoire (pipe-separated)</div>
          <textarea
            style={SS}
            value={f.sharedRepertoire}
            onChange={(e) => set("sharedRepertoire", e.target.value)}
          />
          <div style={LS}>Rehearsal Dates (pipe-separated)</div>
          <textarea
            style={SS}
            value={f.rehearsalDates}
            onChange={(e) => set("rehearsalDates", e.target.value)}
          />
        </>
      );
    }
  }
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function TeacherStudentExtendedModal({
  profile,
  tableType,
  title,
  onClose,
}: Props) {
  const [_students, setStudents] = useState<StudentDetail[]>([]);
  const [studentUsernames, setStudentUsernames] = useState<string[]>([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [records, setRecords] = useState<AnyRecord[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<AnyRecord | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState<AnyForm>(emptyForm(tableType));
  const [saving, setSaving] = useState(false);

  // Fetch teacher's students
  useEffect(() => {
    let active = true;
    async function loadStudents() {
      setLoadingStudents(true);
      try {
        const actor = await getActor();
        const all = await actor.getAllStudentDetails();
        const tsPairs = await actor.getTeacherStudents(profile.username);
        const myStudentUsernames = new Set(
          tsPairs.map((ts) =>
            typeof ts === "string"
              ? ts
              : (ts as { studentUserName: string }).studentUserName,
          ),
        );
        const mine = all.filter(([u]) => myStudentUsernames.has(u));
        if (active) {
          setStudents(mine.map(([, d]) => d));
          setStudentUsernames(mine.map(([u]) => u));
        }
      } catch (e) {
        if (active) setError(String(e));
      } finally {
        if (active) setLoadingStudents(false);
      }
    }
    loadStudents();
    return () => {
      active = false;
    };
  }, [profile.username]);

  async function loadRecords(studentUsername: string) {
    if (!studentUsername) {
      setRecords([]);
      return;
    }
    setLoadingRecords(true);
    setError("");
    try {
      const actor = await getActor();
      const result = await fetchRecords(actor, tableType, studentUsername);
      setRecords(result);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoadingRecords(false);
    }
  }

  function handleStudentChange(username: string) {
    setSelectedStudent(username);
    setEditing(null);
    setIsAdding(false);
    setForm(emptyForm(tableType));
    loadRecords(username);
  }

  function startAdd() {
    setForm(emptyForm(tableType));
    setEditing(null);
    setIsAdding(true);
  }

  function startEdit(r: AnyRecord) {
    setEditing(r);
    setForm(formFromRecord(r, tableType));
    setIsAdding(true);
  }

  function cancelForm() {
    setIsAdding(false);
    setEditing(null);
    setForm(emptyForm(tableType));
  }

  async function handleSave() {
    if (!selectedStudent) return;
    setSaving(true);
    setError("");
    try {
      const actor = await getActor();
      const idField = getIdField(tableType);
      const id = editing
        ? (editing as unknown as Record<string, string>)[idField]
        : crypto.randomUUID();
      const record = buildRecord(
        form,
        tableType,
        id,
        profile.username,
        selectedStudent,
      );
      await saveRecord(actor, tableType, id, record);
      await loadRecords(selectedStudent);
      cancelForm();
    } catch (e) {
      setError(String(e));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(r: AnyRecord) {
    if (!confirm("Delete this record?")) return;
    const id = getRecordId(r, tableType);
    try {
      const actor = await getActor();
      await deleteRecord(actor, tableType, id);
      await loadRecords(selectedStudent);
    } catch (e) {
      setError(String(e));
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.7)",
      }}
      data-ocid="teacher-student-ext.dialog"
    >
      <div
        style={{
          background: "#0f1729",
          border: "1px solid rgba(201,168,76,0.3)",
          borderRadius: 10,
          width: "100%",
          maxWidth: 740,
          maxHeight: "90vh",
          overflowY: "auto",
          padding: 28,
          position: "relative",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <h2
            style={{
              color: "#c9a84c",
              fontSize: 20,
              fontWeight: 700,
              margin: 0,
            }}
          >
            {title}
          </h2>
          <button
            type="button"
            style={BC}
            onClick={onClose}
            data-ocid="teacher-student-ext.close_button"
          >
            Close
          </button>
        </div>

        {/* Student picker */}
        <div style={{ marginBottom: 20 }}>
          <div style={LS}>Select Student</div>
          {loadingStudents ? (
            <div
              style={{ color: "#8a9bb5", fontSize: 13 }}
              data-ocid="teacher-student-ext.loading_state"
            >
              Loading students...
            </div>
          ) : (
            <select
              style={{ ...IS, marginBottom: 0 }}
              value={selectedStudent}
              onChange={(e) => handleStudentChange(e.target.value)}
              data-ocid="teacher-student-ext.select"
            >
              <option value="">— Choose a student —</option>
              {studentUsernames.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          )}
        </div>

        {error && (
          <div
            style={{ color: "#f87171", marginBottom: 12, fontSize: 13 }}
            data-ocid="teacher-student-ext.error_state"
          >
            {error}
          </div>
        )}

        {/* Add button */}
        {selectedStudent && !isAdding && (
          <div style={{ marginBottom: 16 }}>
            <button
              type="button"
              style={BG}
              onClick={startAdd}
              data-ocid="teacher-student-ext.open_modal_button"
            >
              + Add Record
            </button>
          </div>
        )}

        {/* Inline form */}
        {isAdding && (
          <div
            style={{
              ...CARD,
              border: "1px solid rgba(201,168,76,0.4)",
              marginBottom: 20,
            }}
          >
            <h3
              style={{
                color: "#f5f0e8",
                fontWeight: 600,
                marginBottom: 14,
                fontSize: 15,
              }}
            >
              {editing ? "Edit Record" : "New Record"}
            </h3>
            {renderFormFields(
              tableType,
              form,
              setForm as React.Dispatch<React.SetStateAction<AnyForm>>,
            )}
            <div style={{ marginTop: 6 }}>
              <button
                type="button"
                style={BG}
                onClick={handleSave}
                disabled={saving}
                data-ocid="teacher-student-ext.save_button"
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                style={BC}
                onClick={cancelForm}
                data-ocid="teacher-student-ext.cancel_button"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Records list */}
        {selectedStudent &&
          !loadingRecords &&
          records.length === 0 &&
          !isAdding && (
            <div
              style={{ color: "#8a9bb5", textAlign: "center", padding: 28 }}
              data-ocid="teacher-student-ext.empty_state"
            >
              No records found for this student.
            </div>
          )}
        {loadingRecords && (
          <div style={{ color: "#8a9bb5", textAlign: "center", padding: 28 }}>
            Loading records...
          </div>
        )}
        {records.map((r, i) => {
          const { primary, secondary } = getRecordSummary(r, tableType);
          return (
            <div
              key={getRecordId(r, tableType)}
              style={CARD}
              data-ocid={`teacher-student-ext.item.${i + 1}`}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      color: "#c9a84c",
                      fontWeight: 600,
                      fontSize: 14,
                      marginBottom: 3,
                    }}
                  >
                    {primary}
                  </div>
                  <div style={{ color: "#8a9bb5", fontSize: 12 }}>
                    {secondary}
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 6,
                    marginLeft: 12,
                    flexShrink: 0,
                  }}
                >
                  <button
                    type="button"
                    style={BG}
                    onClick={() => startEdit(r)}
                    data-ocid={`teacher-student-ext.edit_button.${i + 1}`}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    style={BD}
                    onClick={() => handleDelete(r)}
                    data-ocid={`teacher-student-ext.delete_button.${i + 1}`}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
