import { describe, it, expect, vi } from "vitest"
import { handleRequest } from "./index"

describe("handleRequest", () => {
  it("returns 200 with received: true", async () => {
    const request = new Request("https://worker.example.com/", {
      method: "POST",
      body: JSON.stringify({ type: "user.created", data: { id: "user_123" } }),
      headers: { "Content-Type": "application/json" },
    })

    const response = await handleRequest(request)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual({ received: true })
  })

  it("logs the webhook payload", async () => {
    const consoleSpy = vi.spyOn(console, "log")
    const payload = { type: "user.created", data: { id: "user_456" } }
    const request = new Request("https://worker.example.com/", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    })

    await handleRequest(request)

    expect(consoleSpy).toHaveBeenCalledWith("Clerk webhook received", payload)
  })
})
