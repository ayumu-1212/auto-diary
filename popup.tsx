import { useEffect } from "react"
import styled from "@emotion/styled"
import { useStorage } from "@plasmohq/storage/hook"
import { Storage } from "@plasmohq/storage"

import { Accordion, AccordionDetails, AccordionSummary, Typography, Grid, IconButton, Box } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ReplayIcon from '@mui/icons-material/Replay';

import { getDiaries } from "~hooks"
import type { CommitDay } from "~hooks"

import { postPrompt, getHistory } from "~apis"

type HistoryDay = {
  date: Date
  items: chrome.history.HistoryItem[]
}

function IndexPopup() {
  const [updateTimes, setUpdateTimes] = useStorage<number>({
    key: "updateTimes",
    instance: new Storage({
      area: "local"
    })
  }, 0)

  const [historyItems, setHistoryItems] = useStorage<HistoryDay[]>({
    key: "historyItems",
    instance: new Storage({
      area: "local"
    })
  }, [])

  const [diaries, setDiaries] = useStorage<CommitDay[]>({
    key: "diaries",
    instance: new Storage({
      area: "local"
    })
  }, [])

  const [headers, setHeaders] = useStorage<String[]>({
    key: "headers",
    instance: new Storage({
      area: "local"
    })
  }, [])

  useEffect(() => {
    const fetchCommitData = async() => {
      const data = await getDiaries()
      await setDiaries(data)
    }
    fetchCommitData()
  }, [updateTimes])

  useEffect(() => {
    const fetchSearchData = async() => {
      const historyItems: HistoryDay[] = []
      for (const date of diaries.map((diary) => (new Date(diary.date)))) {
        const historyDay : HistoryDay = {
          date: date,
          items: []
        }
        const endTime = new Date(date.setHours(23))
        const history = await getHistory({
          startTime: date,
          endTime,
        })
        historyDay.items = history
        historyItems.push(historyDay)
      }
      setHistoryItems(historyItems)
    }
    fetchSearchData()
  }, [diaries])

  useEffect(() => {
    const headers = []
    const onPostAi = async() => {
      for (const index of [0, 1, 2, 3, 4]) {
        const prompt = `以下はとあるエンジニアが同日で行った、Githubのコミットメッセージの履歴とGoogleの検索履歴である。この情報からエンジニアが1日で何をしたのかを50字で答えてください。\n\n
          commitメッセージ\n
          ${diaries.length > index ? diaries[index].commits.map((commit) => (`- ${commit.message}\n`)) : ''}\n
          Googleの検索履歴\n
          ${historyItems.length > index ? historyItems[index].items.map((item) => (`- ${item}\n`)) : ''}
        `
        const header = await postPrompt({prompt})
        headers.push(header)
      }
      setHeaders(headers)
    }
    onPostAi()
  }, [historyItems])

  const formatDate = (date: Date) => {
    const month = date.getMonth() + 1
    const day = date.getDate()
    const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()]
  
    return `${month}月${day}日 (${dayOfWeek})`
  }

  return (
    <ContainerStyle>
      <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'flex-start'}}>
          <TitleStyle>DayBack</TitleStyle>
          <SubTitleStyle>~わい前回何やったっけ？~</SubTitleStyle>
        </Box>
        <IconButton onClick={() => setUpdateTimes(updateTimes + 1)}>
          <ReplayIcon />
        </IconButton>
      </Box>
      {diaries.map((diary, index) => (
        <Accordion>
          <AccordionSummary aria-controls="panel1a-content" id="panel1a-header" expandIcon={<ExpandMoreIcon />}>
            <Box sx={{display: 'flex', flexDirection: 'column'}}>
              <Typography>
                {formatDate(new Date(diary.date))}
              </Typography>
              <Typography>
                {headers.length > index ? headers[index] : ''}
              </Typography>
            </Box>
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
