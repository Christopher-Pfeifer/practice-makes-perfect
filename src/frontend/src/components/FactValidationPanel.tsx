import { Button } from "@/components/ui/button";
import { getActor } from "@/lib/actor";
import { useState } from "react";

interface Mismatch {
  factTable: string;
  dataTable: string;
  field: string;
  value: string;
  count: number;
}

export default function FactValidationPanel() {
  const [loading, setLoading] = useState(false);
  const [mismatches, setMismatches] = useState<Mismatch[]>([]);
  const [hasRun, setHasRun] = useState(false);

  const runValidation = async () => {
    setLoading(true);
    setHasRun(false);
    setMismatches([]);

    try {
      const actor = getActor();

      const [
        skillLevels,
        theoryLevels,
        voiceTypes,
        roles,
        assignmentStatuses,
        billingStatuses,
        repertoireStatuses,
        priorities,
        genres,
        skillCategories,
        groupTypes,
        certifications,
        ensembleTypes,
        instruments,
        profiles,
        studentDetails,
        teacherDetails,
        studentAssignments,
        studentBilling,
        studentRepertoire,
        studentProgress,
        studentCollaboration,
      ] = await Promise.all([
        actor.getSkillLevels(),
        actor.getTheoryLevels(),
        actor.getVoiceTypes(),
        actor.getFactRoles(),
        actor.getAssignmentStatuses(),
        actor.getBillingStatuses(),
        actor.getRepertoireStatuses(),
        actor.getPriorities(),
        actor.getGenres(),
        actor.getSkillCategories(),
        actor.getGroupTypes(),
        actor.getCertifications(),
        actor.getEnsembleTypes(),
        actor.getInstruments(),
        actor.getAllProfiles(),
        actor.getAllStudentDetails(),
        actor.getAllTeacherDetails(),
        actor.getAllStudentAssignments(),
        actor.getAllStudentBillings(),
        actor.getAllStudentRepertoire(),
        actor.getAllStudentProgress(),
        actor.getAllStudentCollaborations(),
      ]);

      const results: Mismatch[] = [];

      const addMismatch = (
        factTable: string,
        dataTable: string,
        field: string,
        value: string,
        count: number,
      ) => {
        const existing = results.find(
          (m) =>
            m.factTable === factTable &&
            m.dataTable === dataTable &&
            m.field === field &&
            m.value === value,
        );
        if (existing) {
          existing.count += count;
        } else {
          results.push({ factTable, dataTable, field, value, count });
        }
      };

      const checkSimple = (
        factValues: string[],
        factTableName: string,
        dataTable: string,
        field: string,
        records: Array<[string, unknown]>,
        fieldName: string,
      ) => {
        const factSet = new Set(factValues.map((v) => v.trim()));
        const valueCounts = new Map<string, number>();
        for (const [, record] of records) {
          const rec = record as Record<string, unknown>;
          const val = (rec[fieldName] as string | undefined) ?? "";
          if (val.trim() === "") continue;
          valueCounts.set(val.trim(), (valueCounts.get(val.trim()) ?? 0) + 1);
        }
        for (const [value, count] of valueCounts.entries()) {
          if (!factSet.has(value)) {
            addMismatch(factTableName, dataTable, field, value, count);
          }
        }
      };

      const checkPipeSeparated = (
        factValues: string[],
        factTableName: string,
        dataTable: string,
        field: string,
        records: Array<[string, unknown]>,
        fieldName: string,
      ) => {
        const factSet = new Set(factValues.map((v) => v.trim()));
        const valueCounts = new Map<string, number>();
        for (const [, record] of records) {
          const rec = record as Record<string, unknown>;
          const raw = (rec[fieldName] as string | undefined) ?? "";
          if (raw.trim() === "") continue;
          const segments = raw.split("|").map((s) => s.trim());
          for (const seg of segments) {
            if (seg === "") continue;
            valueCounts.set(seg, (valueCounts.get(seg) ?? 0) + 1);
          }
        }
        for (const [value, count] of valueCounts.entries()) {
          if (!factSet.has(value)) {
            addMismatch(factTableName, dataTable, field, value, count);
          }
        }
      };

      checkSimple(
        skillLevels,
        "Skill Levels",
        "studentDetails",
        "skillLevel",
        studentDetails as Array<[string, unknown]>,
        "skillLevel",
      );
      checkSimple(
        theoryLevels,
        "Theory Levels",
        "studentDetails",
        "theoryLevel",
        studentDetails as Array<[string, unknown]>,
        "theoryLevel",
      );
      checkSimple(
        voiceTypes,
        "Voice Types",
        "studentDetails",
        "voiceType",
        studentDetails as Array<[string, unknown]>,
        "voiceType",
      );
      checkSimple(
        voiceTypes,
        "Voice Types",
        "teacherDetails",
        "voiceType",
        teacherDetails as Array<[string, unknown]>,
        "voiceType",
      );
      checkSimple(
        roles,
        "Roles",
        "profiles",
        "role",
        profiles as Array<[string, unknown]>,
        "role",
      );
      checkSimple(
        assignmentStatuses,
        "Assignment Statuses",
        "studentAssignments",
        "status",
        studentAssignments as Array<[string, unknown]>,
        "status",
      );
      checkSimple(
        billingStatuses,
        "Billing Statuses",
        "studentBilling",
        "status",
        studentBilling as Array<[string, unknown]>,
        "status",
      );
      checkSimple(
        repertoireStatuses,
        "Repertoire Statuses",
        "studentRepertoire",
        "status",
        studentRepertoire as Array<[string, unknown]>,
        "status",
      );
      checkSimple(
        priorities,
        "Priorities",
        "studentAssignments",
        "priority",
        studentAssignments as Array<[string, unknown]>,
        "priority",
      );
      checkSimple(
        genres,
        "Genres",
        "studentRepertoire",
        "genre",
        studentRepertoire as Array<[string, unknown]>,
        "genre",
      );
      checkSimple(
        skillCategories,
        "Skill Categories",
        "studentProgress",
        "skillCategory",
        studentProgress as Array<[string, unknown]>,
        "skillCategory",
      );
      checkSimple(
        groupTypes,
        "Group Types",
        "studentCollaboration",
        "groupType",
        studentCollaboration as Array<[string, unknown]>,
        "groupType",
      );

      checkPipeSeparated(
        certifications,
        "Certifications",
        "teacherDetails",
        "certifications",
        teacherDetails as Array<[string, unknown]>,
        "certifications",
      );
      checkPipeSeparated(
        ensembleTypes,
        "Ensemble Types",
        "studentDetails",
        "ensembleParticipation",
        studentDetails as Array<[string, unknown]>,
        "ensembleParticipation",
      );
      checkPipeSeparated(
        instruments,
        "Instruments",
        "teacherDetails",
        "instruments",
        teacherDetails as Array<[string, unknown]>,
        "instruments",
      );
      checkPipeSeparated(
        instruments,
        "Instruments",
        "studentDetails",
        "instruments",
        studentDetails as Array<[string, unknown]>,
        "instruments",
      );

      setMismatches(results);
    } catch (err) {
      console.error("Validation error:", err);
      alert("Validation failed. Check console for details.");
    } finally {
      setLoading(false);
      setHasRun(true);
    }
  };

  const copyReport = () => {
    const lines = mismatches.map(
      (m) =>
        `${m.dataTable}.${m.field}: "${m.value}" (${m.count} record${m.count === 1 ? "" : "s"})`,
    );
    const text = lines.join("\n");
    navigator.clipboard.writeText(text).then(() => {
      alert("Report copied to clipboard.");
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">
          FACT Table Validation
        </h2>
        <Button
          onClick={runValidation}
          disabled={loading}
          className="bg-amber-500 hover:bg-amber-600 text-navy-900 font-semibold"
          data-ocid="fact_validation.run_button"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="inline-block w-4 h-4 border-2 border-navy-900 border-t-transparent rounded-full animate-spin" />
              Running...
            </span>
          ) : (
            "Run Validation"
          )}
        </Button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && hasRun && mismatches.length === 0 && (
        <div className="bg-emerald-900/40 border border-emerald-500/50 rounded-lg p-6 text-center">
          <p className="text-emerald-300 text-lg font-medium">
            All FACT-governed fields are valid — no mismatches found.
          </p>
        </div>
      )}

      {!loading && hasRun && mismatches.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-red-300 font-medium">
              {mismatches.length} mismatch
              {mismatches.length === 1 ? "" : "es"} found
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={copyReport}
              className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10"
              data-ocid="fact_validation.copy_report_button"
            >
              Copy Report
            </Button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-700">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-800 text-slate-300 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3">Data Table.Field</th>
                  <th className="px-4 py-3">Orphaned Value</th>
                  <th className="px-4 py-3">Record Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {mismatches.map((m, idx) => (
                  <tr
                    key={`${m.factTable}-${m.dataTable}-${m.field}-${m.value}`}
                    className="bg-slate-900/50 hover:bg-slate-800/60 transition-colors"
                    data-ocid={`fact_validation.mismatch.item.${idx + 1}`}
                  >
                    <td className="px-4 py-3 font-mono text-amber-300">
                      {m.dataTable}.{m.field}
                    </td>
                    <td className="px-4 py-3 text-white">{m.value}</td>
                    <td className="px-4 py-3 text-slate-300">{m.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
