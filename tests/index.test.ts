import { config } from 'dotenv'
import { GeneralUtil } from '../dist/utils'
import { Instagrapi, TProfile, TLastPosts, TPost, TComment } from '../dist/index'

describe('Utils', () => {
  test('Convert ms to date', () => {
    const nowDate = new Date()
    const ms = nowDate.getTime()
    const date = GeneralUtil.msToDate(ms)

    expect(date).toBe(nowDate.toISOString())
  })
})

describe('Instagrapi', () => {
  process.env.NODE_ENV = 'testing'
  config()

  const instagrapi = new Instagrapi({
    sessionId: process.env.SESSION_ID as string
  })

  describe('OK', () => {
    test('Get profile', async () => {
      const profile: TProfile = await instagrapi.getProfile('instagram')
      expect(profile).toMatchObject(<TProfile>{ name: 'Instagram' })
    })

    test('Get last posts', async () => {
      const lastPosts: TLastPosts = await instagrapi.getLastPosts('instagram')
      expect(lastPosts).toBeTruthy()
    })

    test('Get post', async () => {
      const post: TPost = await instagrapi.getPost('https://www.instagram.com/p/CI8nNX0DC4U')
      const comment: TComment = post.lastComments[0]

      expect(comment.author).toBeDefined()
    })

    test('Get media file with proxy', async () => {
      const proxy = 'https://css-battle-proxy.herokuapp.com'

      const instagrapiWithProxy = new Instagrapi({
        sessionId: process.env.SESSION_ID as string,
        proxy
      })

      const profile: TProfile = await instagrapiWithProxy.getProfile('instagram')
      const regex = new RegExp(`(${proxy})/https://instagram*`)

      expect(profile.image.standard).toMatch(regex)
    })
  })

  describe('ERROR', () => {
    test('Username not found', async () => {
      try {
        await instagrapi.getProfile('abc')
      } catch (error) {
        expect(error).toMatchObject(<Error>{ message: 'Username not found' })
      }
    })

    test('Post url not found', async () => {
      try {
        await instagrapi.getPost('http://urlfake')
      } catch (error) {
        expect(error).toMatchObject(<Error>{ message: 'Post url not found' })
      }
    })
  })
})
