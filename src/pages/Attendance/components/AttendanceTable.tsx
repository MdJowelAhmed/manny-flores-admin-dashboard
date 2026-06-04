import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Info, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AttendanceRecord, AttendanceStatus } from "../attendanceData";
import { STATUS_STYLES } from "../attendanceData";
import { cn } from "@/utils/cn";
import { useNavigate } from "react-router-dom";

interface AttendanceTableProps {
  records: AttendanceRecord[];
  onView: (r: AttendanceRecord) => void;
  onEdit?: (r: AttendanceRecord, e: React.MouseEvent) => void;
  onLock?: (r: AttendanceRecord) => void;
  onDelete?: (r: AttendanceRecord) => void;
  onStatusChange?: (r: AttendanceRecord, isActive: boolean) => void;
}

export function AttendanceTable({
  records,
  onLock,
}: AttendanceTableProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const viewRecord = (id: string) => {

    navigate(`/attendance/employee/${id}`);
  }

  return (
    <div className="w-full overflow-auto">
      <table className="w-full min-w-[800px]">
        <thead>
          <tr className="bg-secondary-foreground text-accent">
            <th className="px-4 py-4 text-left text-sm font-semibold">
              {t("common.date")}
            </th>
            <th className="px-4 py-4 text-left text-sm font-semibold">
              {t("attendance.employee")}
            </th>
            {/* <th className="px-4 py-4 text-left text-sm font-semibold">{t('companyProjects.project')}</th> */}
            <th className="px-4 py-4 text-left text-sm font-semibold">
              {t("attendance.checkIn")}
            </th>
            <th className="px-4 py-4 text-left text-sm font-semibold">
              {t("attendance.checkOut")}
            </th>
            <th className="px-4 py-4 text-left text-sm font-semibold">
              {t("attendance.totalHours")}
            </th>
            <th className="px-4 py-4 text-left text-sm font-semibold">
              {t("common.status")}
            </th>
            {/* <th className="px-4 py-4 text-left text-sm font-semibold">{t('common.active')}</th> */}
            <th className="px-4 py-4 text-right text-sm font-semibold">
              {t("common.actions")}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {records.length === 0 ? (
            <tr>
              <td
                colSpan={9}
                className="px-4 py-8 text-center text-muted-foreground text-sm"
              >
                {t("attendance.noRecordsFound")}
              </td>
            </tr>
          ) : (
            records.map((r, index) => {
              const style = STATUS_STYLES[r.status as AttendanceStatus];
              const isLate = r.status === "Late";
              return (
                <motion.tr
                  key={r.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.02 * index }}
                  className="hover:bg-gray-50/50 transition-colors shadow-sm"
                >
                  <td className="px-4 py-3 text-sm text-slate-700">{r.date}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">
                    {r.employee}
                  </td>
                  {/* <td className="px-4 py-3 text-sm text-slate-700">{r.project}</td> */}
                  <td
                    className={cn(
                      "px-4 py-3 text-sm",
                      isLate ? "text-amber-600 font-medium" : "text-slate-700",
                    )}
                  >
                    {r.checkIn}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">
                    {r.checkOut}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">
                    {r.totalHours}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex px-3 py-1 rounded-full text-xs font-medium w-16 text-center",
                        style?.bg ?? "bg-secondary-foreground",
                        style?.text ?? "text-slate-700",
                      )}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => viewRecord(r.userId!)}
                        className="h-8 w-8 text-sky-500 hover:bg-sky-50"
                      >
                        <Info className="h-5 w-5" />
                      </Button>
                      {onLock && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => onLock(r)}
                          className="h-8 w-8 text-emerald-600 hover:bg-emerald-50"
                        >
                          <Lock className="h-5 w-5" />
                        </Button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
