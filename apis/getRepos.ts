export type Repo = {
  name: string
  full_name: string
  owner: string
  updated_at: Date
}

const TOKEN = process.env.PLASMO_PUBLIC_GITHUB_TOKEN

export const getRepos = async() => {
  const items: Repo[] = []

  await fetch(`https://api.github.com/user/repos?sort=updated&direction=desc`, {
    headers: {
      Authorization: `token ${TOKEN}`
    }
  })
  .then(response => response.json())
  .then(data => {
    data.forEach(d => {
      items.push(
        {
          name: d.name,
          full_name: d.full_name,
          owner: d.owner.login,
          updated_at: new Date(d.updated_at)
        }
      )
    })
  })
  .catch(error => console.error(error))

  return items
}