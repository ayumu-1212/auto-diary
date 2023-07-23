import type { Commit } from "~apis/getCommits"

export type CommitDay = {
  date: Date
  commits: Commit[]
}

type Props = {
  commits: Commit[]
  latestDays: Date[]
  commitDays: CommitDay[]
  maxDays: number
}


export const getCommitDays = ({commits, latestDays, commitDays, maxDays}: Props) => {
  for (let commit of commits) {
    console.log(commit)
    const targetDate = commit.date

    // 朝の9時までは前日です
    const beforeHour = 9
    const diffHours = targetDate.getHours() - beforeHour
    targetDate.setHours(diffHours)

    // 時間を無視します
    targetDate.setHours(0, 0, 0, 0)

    // 最初の1コミット目
    if (latestDays.length == 0) {
      latestDays.push(targetDate)
      commitDays.push(
        {
          date: targetDate,
          commits: [commit]
        }
      )
      console.log(1)
      continue
    }

    // 日時が前を越さなかったら終わり
    if (latestDays.length == maxDays && targetDate < latestDays[maxDays - 1]) {
      break
    }

    // まだ直近の日時が埋まっていない場合 or どこかしらに入る場合
    for (let i = 0; i < latestDays.length; i++){
      const latestDay = latestDays[i]
      // 日時が一致した場合
      if (latestDay.getTime() == targetDate.getTime()) {
        commitDays[i].commits.push(commit)
        break
      }
      // 日時が既存の登録より最近の場合
      if (latestDay < targetDate) {
        latestDays.splice(i, 0, targetDate)
        commitDays.splice(i, 0, {
          date: targetDate,
          commits: [commit]
        })
        break
      }
      // 日時が既存の登録より前の場合
      if (latestDays.length < maxDays && i == latestDays.length - 1) {
        latestDays.push(targetDate)
        commitDays.push({
          date: targetDate,
          commits: [commit]
        })
        break
      }
    }
  }
  return {latestDays: latestDays, commitDays: commitDays}
}