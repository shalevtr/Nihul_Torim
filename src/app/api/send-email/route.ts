import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { to, subject, message } = body

    // For now, just log the email
    // In production, integrate with email service like SendGrid, Resend, etc.
    console.log("📧 Email notification:")
    console.log("To:", to)
    console.log("Subject:", subject)
    console.log("Message:", message)

    // TODO: Integrate with email service
    // Example with Resend:
    // const { data, error } = await resend.emails.send({
    //   from: 'noreply@yourapp.com',
    //   to: [to],
    //   subject: subject,
    //   html: message,
    // });

    return NextResponse.json({ success: true, message: "Email logged (not sent in dev)" })
  } catch (error) {
    console.error("Error sending email:", error)
    return NextResponse.json(
      { error: "שגיאה בשליחת מייל" },
      { status: 500 }
    )
  }
}

