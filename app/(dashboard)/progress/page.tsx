import { BookOpen, Flame, PenLine, Trophy } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { scoreLevelProgress } from "@/lib/data/personalization";
import { getTranslations } from "next-intl/server";
import {
  dailyStatsColl,
  grammarTopicsColl,
  userGrammarProgressColl,
  userVocabProgressColl,
  userWritingSubmissionsColl,
} from "@/lib/models/collections";

export default async function ProgressPage() {
  const t = await getTranslations("progress");
  const user = await getCurrentUser();
  if (!user) return null;

  const [vocab, grammarTotal, grammarDone, writings, stats] = await Promise.all([
    (await userVocabProgressColl()).find({ userId: user._id }).toArray(),
    (await grammarTopicsColl()).countDocuments({ isPublished: true }),
    (await userGrammarProgressColl()).countDocuments({ userId: user._id, status: "completed" }),
    (await userWritingSubmissionsColl()).countDocuments({ userId: user._id }),
    (await dailyStatsColl()).find({ userId: user._id }).sort({ date: -1 }).limit(30).toArray(),
  ]);
  const knownWords = vocab.filter((row) => row.status === "known" || row.status === "review").length;
  const levelProgress = scoreLevelProgress(user.currentGermanLevel, user.targetGermanLevel, knownWords);
  const totals = stats.reduce(
    (acc, row) => ({
      wordsReviewed: acc.wordsReviewed + row.wordsReviewed,
      wordsLearned: acc.wordsLearned + row.wordsLearned,
      minutesStudied: acc.minutesStudied + row.minutesStudied,
      correctAnswers: acc.correctAnswers + row.correctAnswers,
      totalAnswers: acc.totalAnswers + row.totalAnswers,
    }),
    { wordsReviewed: 0, wordsLearned: 0, minutesStudied: 0, correctAnswers: 0, totalAnswers: 0 }
  );
  const accuracy = totals.totalAnswers ? Math.round((totals.correctAnswers / totals.totalAnswers) * 100) : 0;

  return (
    <div className="space-y-5 animate-fade-slide-up">
      <div>
        <h1 className="text-xl font-bold">{t("title")}</h1>
        <p className="text-xs text-muted-foreground">{user.currentGermanLevel} {t("to")} {user.targetGermanLevel}</p>
      </div>

      <div className="rounded-lg border border-border bg-card p-5">
        <div className="mb-2 flex justify-between text-sm">
          <span className="font-medium">{t("levelProgress")}</span>
          <span className="font-bold">{levelProgress}%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary" style={{ width: `${levelProgress}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label={t("assignedWords")} value={vocab.length} icon={BookOpen} color="blue" sublabel={`${knownWords} ${t("inReview")}`} />
        <StatCard label={t("streak")} value={user.streakCount} icon={Flame} color="orange" sublabel={t("days")} />
        <StatCard label={t("grammar")} value={`${grammarDone}/${grammarTotal}`} icon={Trophy} color="purple" sublabel={t("completed")} />
        <StatCard label={t("writing")} value={writings} icon={PenLine} color="green" sublabel={t("submissions")} />
        <StatCard label={t("reviews")} value={totals.wordsReviewed} icon={BookOpen} color="blue" sublabel={`${totals.wordsLearned} ${t("learned")}`} />
        <StatCard label={t("studyTime")} value={`${totals.minutesStudied}m`} icon={Flame} color="orange" sublabel={`${user.totalStudyDays} ${t("studyDays")}`} />
        <StatCard label={t("accuracy")} value={`${accuracy}%`} icon={Trophy} color="purple" sublabel={t("last30Days")} />
      </div>
    </div>
  );
}
