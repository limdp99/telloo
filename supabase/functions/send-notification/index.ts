import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'Telloo <notifications@telloo.io>'
const APP_URL = Deno.env.get('APP_URL') || 'https://telloo.io'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationPayload {
  type: 'new_comment' | 'status_change' | 'new_post'
  postId: string
  boardId?: string
  triggeredBy?: string
  newStatus?: string
  commentContent?: string
  postTitle?: string
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verify caller has valid Supabase auth
    const authHeader = req.headers.get('Authorization')
    if (authHeader) {
      const callerClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        { global: { headers: { Authorization: authHeader } } }
      )
      const { data: { user: caller } } = await callerClient.auth.getUser()
      // Allow unauthenticated calls only from internal (no auth header = Supabase invoke)
      if (authHeader && !caller) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    let payload: NotificationPayload
    try {
      payload = await req.json()
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { type, postId, boardId, triggeredBy, newStatus, commentContent, postTitle } = payload

    if (!type || !postId) {
      return new Response(JSON.stringify({ error: 'Missing required fields: type, postId' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Get post details
    const { data: post, error: postError } = await supabaseAdmin
      .from('feedback_posts')
      .select(`
        *,
        boards (title, slug, owner_id)
      `)
      .eq('id', postId)
      .single()

    if (postError || !post) {
      throw new Error('Post not found')
    }

    const postUrl = `${APP_URL}/${post.boards.slug}?post=${post.id}`
    const emailsToSend: { email: string; subject: string; html: string }[] = []

    // HTML escape to prevent injection in emails
    const escapeHtml = (str: string): string => {
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
    }

    // Helper function to get user email by ID (direct lookup)
    const getUserEmail = async (userId: string): Promise<string | null> => {
      const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(userId)
      return user?.email || null
    }

    // Case 1 & 4: New comment notification
    if (type === 'new_comment') {
      const recipientIds = new Set<string>()

      // Case 1: Notify post author
      if (post.user_id && post.user_id !== triggeredBy) {
        recipientIds.add(post.user_id)
      }

      // Case 4: Notify previous commenters
      const { data: previousComments } = await supabaseAdmin
        .from('feedback_comments')
        .select('user_id')
        .eq('post_id', postId)
        .neq('user_id', triggeredBy)

      if (previousComments) {
        previousComments.forEach(c => {
          if (c.user_id && c.user_id !== post.user_id) {
            recipientIds.add(c.user_id)
          }
        })
      }

      // Build email for each recipient
      for (const userId of recipientIds) {
        const email = await getUserEmail(userId)
        if (!email) continue

        const isPostAuthor = userId === post.user_id
        const safeTitle = escapeHtml(post.title)
        const safeComment = escapeHtml(commentContent || '')

        const subject = isPostAuthor
          ? `New comment on your post "${post.title}"`
          : `New comment on "${post.title}"`

        const htmlContent = `
          <h2 style="color: #f5f5f5; margin: 0 0 16px 0;">${isPostAuthor ? 'Someone commented on your post' : 'New comment on a post you commented on'}</h2>
          <p style="color: #f5f5f5; font-size: 16px; font-weight: 600; margin: 0 0 12px 0;">${safeTitle}</p>
          <blockquote style="border-left: 3px solid #2dd4bf; padding-left: 12px; margin: 16px 0; color: #a3a3a3;">
            ${safeComment}
          </blockquote>
          <p style="margin: 16px 0 0 0;"><a href="${postUrl}" style="color: #2dd4bf;">View the conversation</a></p>
        `

        emailsToSend.push({
          email,
          subject,
          html: buildEmailTemplate(htmlContent, post.boards.title)
        })
      }
    }

    // Case 2: Status change notification - notify post author
    if (type === 'status_change') {
      if (post.user_id && post.user_id !== triggeredBy) {
        const email = await getUserEmail(post.user_id)
        if (email) {
          const safeTitle2 = escapeHtml(post.title)
          const safeStatus = escapeHtml(newStatus?.replace('_', ' ') || '')
          const subject = `Status update: "${post.title}" is now ${newStatus?.replace('_', ' ')}`
          const htmlContent = `
            <h2 style="color: #f5f5f5; margin: 0 0 16px 0;">Status Update</h2>
            <p style="color: #e5e5e5; margin: 0 0 12px 0;">Your post <strong style="color: #f5f5f5;">"${safeTitle2}"</strong> has been updated to:</p>
            <p style="font-size: 18px; color: #2dd4bf; font-weight: bold; margin: 12px 0;">${safeStatus.toUpperCase()}</p>
            <p style="margin: 16px 0 0 0;"><a href="${postUrl}" style="color: #2dd4bf;">View the post</a></p>
          `
          emailsToSend.push({
            email,
            subject,
            html: buildEmailTemplate(htmlContent, post.boards.title)
          })
        }
      }
    }

    // Case 3: New post notification - notify board admin
    if (type === 'new_post') {
      const safeBoardTitle = escapeHtml(post.boards.title)
      const safePostTitle = escapeHtml(post.title)
      const safeDesc = post.description ? escapeHtml(post.description.substring(0, 200)) + (post.description.length > 200 ? '...' : '') : ''

      const boardOwnerId = post.boards.owner_id
      if (boardOwnerId && boardOwnerId !== triggeredBy) {
        const email = await getUserEmail(boardOwnerId)
        if (email) {
          const subject = `New feedback on ${post.boards.title}: "${post.title}"`
          const htmlContent = `
            <h2 style="color: #f5f5f5; margin: 0 0 16px 0;">New Feedback Submitted</h2>
            <p style="color: #e5e5e5; margin: 0 0 12px 0;">A new post has been submitted to your board <strong style="color: #f5f5f5;">${safeBoardTitle}</strong>:</p>
            <p style="font-size: 18px; font-weight: bold; color: #f5f5f5; margin: 12px 0;">${safePostTitle}</p>
            ${safeDesc ? `<p style="color: #a3a3a3; margin: 0 0 12px 0;">${safeDesc}</p>` : ''}
            <p style="margin: 16px 0 0 0;"><a href="${postUrl}" style="color: #2dd4bf;">View the feedback</a></p>
          `
          emailsToSend.push({
            email,
            subject,
            html: buildEmailTemplate(htmlContent, post.boards.title)
          })
        }
      }

      // Also notify board admins (from user_roles)
      const { data: boardAdmins } = await supabaseAdmin
        .from('user_roles')
        .select('user_id')
        .eq('board_id', post.board_id)
        .in('role', ['admin', 'super_admin'])
        .neq('user_id', triggeredBy)
        .neq('user_id', boardOwnerId)

      if (boardAdmins) {
        for (const admin of boardAdmins) {
          const email = await getUserEmail(admin.user_id)
          if (email) {
            const subject = `New feedback on ${post.boards.title}: "${post.title}"`
            const htmlContent = `
              <h2 style="color: #f5f5f5; margin: 0 0 16px 0;">New Feedback Submitted</h2>
              <p style="color: #e5e5e5; margin: 0 0 12px 0;">A new post has been submitted to <strong style="color: #f5f5f5;">${safeBoardTitle}</strong>:</p>
              <p style="font-size: 18px; font-weight: bold; color: #f5f5f5; margin: 12px 0;">${safePostTitle}</p>
              ${safeDesc ? `<p style="color: #a3a3a3; margin: 0 0 12px 0;">${safeDesc}</p>` : ''}
              <p style="margin: 16px 0 0 0;"><a href="${postUrl}" style="color: #2dd4bf;">View the feedback</a></p>
            `
            emailsToSend.push({
              email,
              subject,
              html: buildEmailTemplate(htmlContent, post.boards.title)
            })
          }
        }
      }
    }

    // Send all emails via Resend
    let sentCount = 0
    for (const { email, subject, html } of emailsToSend) {
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
            html,
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
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function buildEmailTemplate(content: string, rawBoardTitle: string): string {
  const boardTitle = rawBoardTitle.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return `
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
          ${content}
          <hr style="border: none; border-top: 1px solid #333; margin: 24px 0;">
          <p style="font-size: 12px; color: #737373; text-align: center; margin: 0;">
            You're receiving this notification from ${boardTitle} on Telloo.
          </p>
        </div>
      </body>
    </html>
  `
}
