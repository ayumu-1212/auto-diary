type Props = {
  startTime: Date
  endTime: Date
}

export const getHistory = async({startTime, endTime}: Props) => {
  const text = ""
  const maxResults = 10
  const history = await chrome.history.search({
    text,
    startTime: startTime.getTime(),
    endTime: endTime.getTime(),
    maxResults,
  })
  return history
}