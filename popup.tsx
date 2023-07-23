import { useState } from "react"
import { getCommits } from "~apis/getCommits"
import { getRepos } from "~apis/getRepos"
import type { Repo } from "~apis/getRepos"

import { Flex, Heading, Spacer, Grid, GridItem } from '@chakra-ui/react'
import { getDiaries } from "~hooks/getDiaries"

function IndexPopup() {
  const [historyItems, setHistoryItems] = useState<chrome.history.HistoryItem[]>([])
  const [commitItems, setCommitItems] = useState([])
  const [repoItems, setRepoItems] = useState<Repo[]>([])

  const getHistory = async() => {
    const now = new Date()

    const text = ""
    const startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0).getTime()
    const endTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0).getTime()
    const maxResults = 10
    const items = await chrome.history.search({
      text,
      startTime,
      endTime,
      maxResults,
    })
    setHistoryItems(items)
  }

  const onRepos = async() => {
    const repos = await getRepos()
    setRepoItems(repos)
  }

  const onCommits = async() => {
    const commits = await getCommits({owner: 'ayumu-1212', repo: 'dnn_of_crystal_grain_diameter_distributional'})
    setCommitItems(commits)
  }

  const onDiaries = async () => {
    const data = await getDiaries()
    console.log(data)
  }

  return (
    <Flex direction="column" p='1rem' w='30rem'>
      <Heading as="h2" size="md">DayBack</Heading>
      <button id="getHistory" onClick={getHistory}>getHistory</button>
      <button id="getCommits" onClick={onCommits}>getCommits</button>
      <button id="getRepos" onClick={onRepos}>getRepos</button>
      <button id="getDiaries" onClick={onDiaries}>getDiaries</button>
      <div>
        <ul>
          {historyItems.map((item) => (<li id={item.id} key={item.id}>{item.title}</li>))}
        </ul>
      </div>
      <div>
        <ul>
          {commitItems.map((item, index) => (<li id={`commit-${index}-id`} key={`commit-${index}-key`}>{item.message}</li>))}
        </ul>
      </div>
      <div>
        <ul>
          {repoItems.map((item, index) => (<li id={`repo-${index}-id`} key={`repo-${index}-key`}>{item.name}, {item.updated_at.toISOString()}</li>))}
        </ul>
      </div>
    </Flex>
  )
}

export default IndexPopup
