type Props = {
  prompt: string
}

const AI_TOKEN = process.env.PLASMO_PUBLIC_OPEN_AI_TOKEN

export const postPrompt = async({prompt}: Props) => {
  const requestBody = {
    model: "text-davinci-003",
    prompt: prompt,
    temperature: 1,
    max_tokens: 2048,
  }
  const result : string = await fetch('https://api.openai.com/v1/completions', {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${AI_TOKEN}`
    },
    body: JSON.stringify(requestBody)
  })
  .then(response => response.json())
  .then(data => {
    return data.choices[0].text.trim()
  })
  .catch(error => console.error(error))
  return result
}