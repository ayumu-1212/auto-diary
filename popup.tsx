import { useState } from "react"

function IndexPopup() {
  const [historyItems, setHistoryItems] = useState<chrome.history.HistoryItem[]>([])
  const [commitItems, setCommitItems] = useState([])

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

  const getCommits = async() => {
    // すぐ消す
    const token="token"

    const maxResults = 5
    const items = []

    await fetch(`https://api.github.com/repos/ayumu-1212/dnn_of_crystal_grain_diameter_distributional/commits?per_page=${maxResults}`, {
      headers: {
        Authorization: `token ${token}`
      }
    })
    .then(response => response.json())
    .then(data => {
      data.forEach(d => {
        items.push(d.commit.message)
      })
    })
    .catch(error => console.error(error))

    setCommitItems(items)
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: 16
      }}>
      <h2>
        Welcome to your
        <a href="https://www.plasmo.com" target="_blank">
          {" "}
          Plasmo
        </a>{" "}
        Extension!
      </h2>
      <button id="getHistory" onClick={getHistory}>getHistory</button>
      <button id="getCommits" onClick={getCommits}>getCommits</button>
      <div>
        <ul>
          {historyItems.map((item) => (<li id={item.id} key={item.id}>{item.title}</li>))}
        </ul>
      </div>
      <div>
        <ul>
          {commitItems.map((item) => (<li id={item.id} key={item.id}>{item}</li>))}
        </ul>
      </div>
    </div>
  )
}

export default IndexPopup
