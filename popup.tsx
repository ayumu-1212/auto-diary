import { useState, useEffect } from "react"
import styled from "@emotion/styled"

import { Accordion, AccordionDetails, AccordionSummary, Typography, Grid } from '@mui/material'

import { getDiaries } from "~hooks/getDiaries"
import type { CommitDay } from "~hooks/getCommitDays"

type HistoryDay = {
  date: Date
  items: chrome.history.HistoryItem[]
}

function IndexPopup() {
  const [historyItems, setHistoryItems] = useState<HistoryDay[]>([])

  const [diaries, setDiaries] = useState<CommitDay[]>([])

  const [headers, setHeaders] = useState<String[]>([])

  useEffect(() => {
    const fetchCommitData = async() => {
      const data = await getDiaries()
      await setDiaries(data)
      // await fetchSearchData()
    }
    fetchCommitData()
  }, [])

  useEffect(() => {
    const fetchSearchData = async() => {
      const text = ""
      const maxResults = 10
      const historyItems: HistoryDay[] = []
      for (const date of diaries.map((diary) => (diary.date))) {
        const historyDay : HistoryDay = {
          date: date,
          items: []
        }
        const startTime = date.getTime()
        const endTime = date.setHours(23)
        const history = await chrome.history.search({
          text,
          startTime,
          endTime,
          maxResults,
        })
        historyDay.items = history
        historyItems.push(historyDay)
      }
      setHistoryItems(historyItems)
    }
    fetchSearchData()
  }, [diaries])

  useEffect(() => {
    const AI_TOKEN = process.env.PLASMO_PUBLIC_OPEN_AI_TOKEN
    const headers = []
    const onPostAi = async() => {
      for (const index of [0, 1, 2, 3, 4]) {
        const prompt = `以下はとあるエンジニアが同日で行った、Githubのコミットメッセージの履歴とGoogleの検索履歴である。この情報からエンジニアが1日で何をしたのかを50字で答えてください。\n\n
          commitメッセージ\n
          ${diaries.length > index ? diaries[index].commits.map((commit) => (`- ${commit.message}\n`)) : ''}\n
          Googleの検索履歴\n
          ${historyItems.length > index ? historyItems[index].items.map((item) => (`- ${item}\n`)) : ''}
        `
        const requestBody = {
          model: "text-davinci-003",
          prompt: prompt,
          temperature: 1,
          max_tokens: 2048,
        }
        await fetch('https://api.openai.com/v1/completions', {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${AI_TOKEN}`
          },
          body: JSON.stringify(requestBody)
        })
        .then(response => response.json())
        .then(data => {
          console.log(data.choices[0].text.trim())
          headers.push(data.choices[0].text.trim())
        })
        .catch(error => console.error(error))
      }
      setHeaders(headers)
    }
    onPostAi()
  }, [historyItems])

  const formatDate = (date: Date) => {
    // const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()]
  
    return `${month}月${day}日 (${dayOfWeek})`
  }

  return (
    <ContainerStyle>
      <TitleStyle>DayBack</TitleStyle><SubTitleStyle>~わい前回何やったっけ？~</SubTitleStyle>
      {diaries.map((diary, index) => (
        <Accordion>
          <AccordionSummary aria-controls="panel1a-content" id="panel1a-header">
            <Typography>
              {formatDate(diary.date)}<br />{headers.length > index ? headers[index] : ''}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <H3Style>
                  Github
                </H3Style>
                <ul>
                  {diary.commits.map((commit, ci) => (<li id={`commit-${index}-${ci}`} key={`commit-${index}-${ci}`}>{commit.message}</li>))}
                </ul>
              </Grid>
              <Grid item xs={6}>
                <H3Style>
                  Google
                </H3Style>
                <ul>
                  {historyItems.length > index ? historyItems[index].items.map((item, hi) => (<li id={`history-${index}-${hi}`} key={`history-${index}-${hi}`}>{item.title}</li>)) : ''}
                </ul>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}
    </ContainerStyle>
  )
}

const ContainerStyle = styled.div`
  width: 500px;
`

const TitleStyle = styled.h2`
  display: inline-block;
  font-weight: bold;
`

const SubTitleStyle = styled.h3`
  display: inline-block;
  margin-left: 1rem;
  font-size: 0.5rem;
  font-weight: none;
`

const H3Style = styled.h3`
  font-weight: bold;
`

export default IndexPopup
