type Props = {
  owner: string
  repo: string
  since?: Date
}

export type Commit = {
  committer: string
  message: string
  date: Date
}

const TOKEN = process.env.PLASMO_PUBLIC_GITHUB_TOKEN

export const getCommits = async({owner, repo, since}: Props) => {

  const maxResults = 100
  const items : Commit[] = []

  await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=${maxResults}${since ? '&since=' + since.toISOString() : ''}`, {
    headers: {
      Authorization: `token ${TOKEN}`
    }
  })
  .then(response => response.json())
  .then(data => {
    data.forEach(d => {
      items.push({
        committer: d.committer.login,
        message: d.commit.message,
        date: new Date(d.commit.committer.date)
      })
    })
  })
  .catch(error => console.error(error))

  return items
}