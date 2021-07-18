// You'll need to register an App on Reddit at https://www.reddit.com/prefs/apps/

'use strict'

const subreddit = 'productivity'
const limit = 10
const include_subreddit_tag = true

const comment_depth = 1 // don't go crazy, 0, 1 or 2 are usually more than enough
const comment_limit = 100

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

      submission.expandReplies({limit: comment_limit, depth: comment_depth}).then(saveComments)
  })

  output.push('- tags: #redditexport' + (include_subreddit_tag ? (', #' + subreddit) : ''))

  fs.writeFile(note_name + '.md', output.join('\r\n'), () => {  })
})

function saveComments(submission) {
  const comments_file = submission.id + '_comments.md'
  const comments = getComments(submission.comments, 0)

  fs.writeFile(submission.id + '_comments.json', JSON.stringify(getComments(submission.comments, 0)), () => { })
}

function getComments(comments, depth) {
  let result = []
  comments.forEach(c => {
    let comment = {
      depth: depth,
      id: c.id,
      body: c.body,
      author: c.author.name,
      permalink: 'https://reddit.com' + c.permalink
    }

    // if has replies and not root_only, get recursively
    if (depth < comment_depth && c.replies.length > 0) {
      comment.replies = getComments(c.replies, depth + 1)
    }

    result.push(comment)
  })

  return result;
}
