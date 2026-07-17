const ContentReport = require("../models/contentReport");
const Communities = require("../models/community");
const CommunityComment = require("../models/communityComment");
const User = require("../models/user");

// 텔레그램 메시지 작성에 필요한 대상 게시물/댓글/신고자 정보를 조립
async function buildReportInfo(report) {
  let post = null;
  let comment = null;

  if (report.targetType === "comment") {
    comment = await CommunityComment.findById(report.targetId);
    if (comment) post = await Communities.findById(comment.communityId);
  } else {
    post = await Communities.findById(report.targetId);
  }

  const reporters = await User.find({ _id: { $in: report.reporters } });

  return { report, post, comment, reporters };
}

// 신고 접수. 같은 대상에 pending 신고가 있으면 신고자만 누적 (한 건으로 관리)
async function submitReport({ targetType, targetId, reporterId }) {
  let report = await ContentReport.findOne({
    targetType,
    targetId,
    status: "pending",
  });

  if (report) {
    await ContentReport.updateOne(
      { _id: report._id },
      { $addToSet: { reporters: reporterId } },
    );
    report = await ContentReport.findById(report._id);
  } else {
    let communityId = targetId;
    if (targetType === "comment") {
      const comment = await CommunityComment.findById(targetId);
      communityId = comment ? comment.communityId : null;
    }
    report = await ContentReport.create({
      targetType,
      targetId,
      communityId,
      reporters: [reporterId],
    });
  }

  return buildReportInfo(report);
}

// 신고 대상 콘텐츠 숨김 처리 (앱에서 게시물은 목록/상세 제외, 댓글은 "숨겨진 댓글" 표시)
async function hideReportedContent(reportId) {
  const report = await ContentReport.findById(reportId);
  if (!report) {
    return { success: false, reason: "신고 내역을 찾을 수 없습니다." };
  }
  if (report.status !== "pending") {
    return { success: false, reason: "이미 처리된 신고입니다." };
  }

  if (report.targetType === "comment") {
    await CommunityComment.updateOne(
      { _id: report.targetId },
      { status: "hide" },
    );
  } else {
    await Communities.updateOne({ _id: report.targetId }, { status: "hide" });
  }

  report.status = "hidden";
  await report.save();

  return { success: true, report };
}

// 신고 무시 (콘텐츠는 그대로 유지)
async function dismissReport(reportId) {
  const report = await ContentReport.findById(reportId);
  if (!report) {
    return { success: false, reason: "신고 내역을 찾을 수 없습니다." };
  }
  if (report.status !== "pending") {
    return { success: false, reason: "이미 처리된 신고입니다." };
  }

  report.status = "dismissed";
  await report.save();

  return { success: true, report };
}

module.exports = {
  submitReport,
  buildReportInfo,
  hideReportedContent,
  dismissReport,
};
