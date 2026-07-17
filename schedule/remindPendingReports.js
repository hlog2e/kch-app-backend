const ContentReport = require("../models/contentReport");
const reportService = require("../services/report.service");
const telegram = require("../utils/telegram");

const SKIP_IF_CREATED_WITHIN_MS = 5 * 60 * 1000;
const DELAY_BETWEEN_MS = 1000;
const ESCALATE_THRESHOLD_MS = 24 * 60 * 60 * 1000;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// 신고 대상이 삭제되거나 이미 숨겨졌으면 리마인드할 필요 없음
function isTargetGone(info) {
  const target = info.report.targetType === "comment" ? info.comment : info.post;
  return !target || target.status !== "normal";
}

module.exports = async () => {
  try {
    const cutoff = new Date(Date.now() - SKIP_IF_CREATED_WITHIN_MS);
    const pendings = await ContentReport.find({
      status: "pending",
      createdAt: { $lt: cutoff },
    }).sort({ createdAt: 1 });

    if (pendings.length === 0) return;
    console.log(`[ReportReminder] pending ${pendings.length}건 재알림 시작`);

    for (const report of pendings) {
      try {
        const info = await reportService.buildReportInfo(report);

        if (isTargetGone(info)) {
          report.status = "dismissed";
          await report.save();
          console.log(`[ReportReminder] ${report._id} 대상 소멸 — 자동 종결`);
          continue;
        }

        const elapsedMs = Date.now() - report.createdAt.getTime();
        const attempts = (report.notifyAttempts || 0) + 1;
        const escalate = elapsedMs >= ESCALATE_THRESHOLD_MS;

        await telegram.notifyNewReport(info, {
          isReminder: true,
          attempts,
          elapsedMs,
          escalate,
        });

        report.notifyAttempts = attempts;
        report.lastNotifiedAt = new Date();
        await report.save();
      } catch (err) {
        console.error(`[ReportReminder] ${report._id} 재알림 실패:`, err);
      }
      await sleep(DELAY_BETWEEN_MS);
    }

    console.log(`[ReportReminder] pending 재알림 완료`);
  } catch (error) {
    console.error("remindPendingReports error:", error);
  }
};
