import { getRepos, getCommits } from '../apis'
import { getCommitDays } from './getCommitDays'
import type { CommitDay} from './getCommitDays'

const MAX_DAYS = 5

export const getDiaries = async () => {
  const repos = await getRepos()
  let latestDays : Date[] = []
  let commitDays : CommitDay[] = []

  for (let repo of repos) {
    // レポジトリの最新更新日が、前を越えなくなったら終わり。
    if (latestDays.length == MAX_DAYS && repo.updated_at < latestDays[MAX_DAYS - 1]) break

    const since = latestDays.length == MAX_DAYS ? latestDays[MAX_DAYS - 1] : undefined

    const commits = await getCommits({owner: repo.owner, repo: repo.name, since: since})
    const daysData = getCommitDays({
      commits: commits,
      latestDays: latestDays,
      commitDays: commitDays,
      maxDays: MAX_DAYS
    })
    latestDays = daysData.latestDays
    commitDays = daysData.commitDays
  }

  return commitDays
}