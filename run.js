// You'll need to register an App on Reddit at https://www.reddit.com/prefs/apps/

'use strict'

const subreddit = 'productivity'
const limit = 100

const snoowrap = require('snoowrap')
const fs = require('fs')
const date = require('date-and-time')

const r = new snoowrap({
  userAgent: 'YOUR_REDDIT_APP_NAME',
  clientId: 'CLIENT_ID',
  clientSecret: 'CLIENT_SECRET',
  username: 'USERNAME',
  password: 'PASSWORD'
})

const currDate = new Date()
const note_name = date.format(currDate, 'YYYYMMDD-HHmmss') + '_' + subreddit

let output = []

output.push('# Subreddit Export - ' + date.format(currDate, 'YYYY-MM-DD HH:mm:ss') + ' - /r/' + subreddit)
output.push('---')

r.getHot(subreddit, { limit: limit }).then(dat => {
  dat.forEach(submission => {
      const permalink = 'https://old.reddit.com' + submission.permalink
      const author = submission.author.name

      output.push('## ' + submission.title)
      output.push('*[' + submission.id + '](' + permalink + ') - author: ' + author + '*')
      output.push('')

      if (submission.is_self) {
        if (submission.selftext === '') output.push('No Content.')
        else output.push(submission.selftext)
      } else {
        output.push('[LINK](' + submission.url + ')')
      }

      output.push('---')
  })

    fs.writeFile(note_name + '.md', output.join('\r\n'), () => { })
})
