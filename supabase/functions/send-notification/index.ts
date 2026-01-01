import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'Telloo <notifications@telloo.com>'
const APP_URL = Deno.env.get('APP_URL') || 'https://telloo.vercel.app'

interface NotificationPayload {
  type: 'new_comment' | 'status_change' | 'new_vote'
  postId: string
  triggeredBy?: string
  newStatus?: string
  commentContent?: string
}

serve(async (req) => {
  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const payload: NotificationPayload = await req.json()
    const { type, postId, triggeredBy, newStatus, commentContent } = payload

    // Get post details
    const { data: post, error: postError } = await supabaseAdmin
      .from('feedback_posts')
      .select(`
        *,
        boards (title, slug)
      `)
      .eq('id', postId)
      .single()

    if (postError || !post) {
      throw new Error('Post not found')
    }

    // Get subscribers for this post
    const { data: subscribers } = await supabaseAdmin
      .from('feedback_subscriptions')
      .select(`
        user_id,
        profiles (nickname),
        notification_preferences (email_new_comment, email_status_change, email_new_vote)
      `)
      .eq('post_id', postId)
      .neq('user_id', triggeredBy) // Don't notify the person who triggered the action

    if (!subscribers || subscribers.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Get user emails
    const userIds = subscribers.map(s => s.user_id)
    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers()
    const userEmails = users
      .filter(u => userIds.includes(u.id))
      .reduce((acc, u) => ({ ...acc, [u.id]: u.email }), {} as Record<string, string>)

    // Filter subscribers based on notification preferences
    const prefKey = type === 'new_comment' ? 'email_new_comment' :
                    type === 'status_change' ? 'email_status_change' : 'email_new_vote'

    const eligibleSubscribers = subscribers.filter(s => {
      const prefs = s.notification_preferences?.[0]
      return !prefs || prefs[prefKey] !== false // Default to true if no preference set
    })

    if (eligibleSubscribers.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Build email content
    let subject = ''
    let htmlContent = ''
    const postUrl = `${APP_URL}/${post.boards.slug}?post=${post.id}`

    switch (type) {
      case 'new_comment':
        subject = `New comment on "${post.title}"`
        htmlContent = `
          <h2>New comment on your subscribed post</h2>
          <p><strong>${post.title}</strong></p>
          <blockquote style="border-left: 3px solid #2dd4bf; padding-left: 12px; margin: 16px 0; color: #666;">
            ${commentContent}
          </blockquote>
          <p><a href="${postUrl}" style="color: #2dd4bf;">View the conversation</a></p>
        `
        break

      case 'status_change':
        subject = `Status update: "${post.title}" is now ${newStatus?.replace('_', ' ')}`
        htmlContent = `
          <h2>Status Update</h2>
          <p>The post <strong>"${post.title}"</strong> has been updated to:</p>
          <p style="font-size: 18px; color: #2dd4bf; font-weight: bold;">${newStatus?.replace('_', ' ').toUpperCase()}</p>
          <p><a href="${postUrl}" style="color: #2dd4bf;">View the post</a></p>
        `
        break

      case 'new_vote':
        subject = `New vote on "${post.title}"`
        htmlContent = `
          <h2>Your post received a vote!</h2>
          <p><strong>${post.title}</strong></p>
          <p><a href="${postUrl}" style="color: #2dd4bf;">View the post</a></p>
        `
        break
    }

    const emailTemplate = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0a; color: #e5e5e5; padding: 40px 20px;">
          <div style="max-width: 500px; margin: 0 auto; background: #1a1a1a; border-radius: 12px; padding: 32px; border: 1px solid #333;">
            <div style="text-align: center; margin-bottom: 24px;">
              <span style="font-size: 24px; font-weight: bold; color: #2dd4bf;">Telloo</span>
            </div>
            ${htmlContent}
            <hr style="border: none; border-top: 1px solid #333; margin: 24px 0;">
            <p style="font-size: 12px; color: #666; text-align: center;">
              You're receiving this because you're subscribed to this post on ${post.boards.title}.
              <br><a href="${APP_URL}/s/dashboard" style="color: #2dd4bf;">Manage your notification preferences</a>
            </p>
          </div>
        </body>
      </html>
    `

    // Send emails via Resend
    let sentCount = 0
    for (const subscriber of eligibleSubscribers) {
      const email = userEmails[subscriber.user_id]
      if (!email) continue

      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: FROM_EMAIL,
            to: email,
            subject,
            html: emailTemplate,
          }),
        })

        if (response.ok) {
          sentCount++
        } else {
          console.error('Failed to send email:', await response.text())
        }
      } catch (error) {
        console.error('Error sending email:', error)
      }
    }

    return new Response(JSON.stringify({ sent: sentCount }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
