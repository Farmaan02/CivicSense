import notificationService from "../services/notificationService.js"

describe("Notification Service", () => {
  beforeEach(() => {
    // Clear notification queues before each test
    notificationService.emailQueue = []
    notificationService.whatsappQueue = []
    notificationService.removeAllListeners()
  })

  describe("In-app notifications", () => {
    it("should emit notification event", (done) => {
      const testData = { message: "Test notification" }

      notificationService.once("notification", (data) => {
        expect(data.type).toBe("test")
        expect(data.data).toEqual(testData)
        expect(data.timestamp).toBeDefined()
        done()
      })

      notificationService.sendInAppNotification("test", testData)
    })
  })

  describe("Email notifications", () => {
    it("should queue email notification", () => {
      const email = "test@example.com"
      const subject = "Test Subject"
      const body = "Test Body"
      const data = { reportId: "123" }

      const notification = notificationService.queueEmailNotification(email, subject, body, data)

      expect(notification).toHaveProperty("id")
      expect(notification).toHaveProperty("to", email)
      expect(notification).toHaveProperty("subject", subject)
      expect(notification).toHaveProperty("body", body)
      expect(notification).toHaveProperty("data", data)
      expect(notification).toHaveProperty("status", "queued")
      expect(notification).toHaveProperty("createdAt")

      expect(notificationService.emailQueue).toHaveLength(1)
      expect(notificationService.emailQueue[0]).toEqual(notification)
    })

    it("should return correct queue status", () => {
      notificationService.queueEmailNotification("test1@example.com", "Subject 1", "Body 1")
      notificationService.queueEmailNotification("test2@example.com", "Subject 2", "Body 2")

      const status = notificationService.getQueueStatus()

      expect(status.email.queued).toBe(2)
      expect(status.email.total).toBe(2)
      expect(status.whatsapp.queued).toBe(0)
      expect(status.whatsapp.total).toBe(0)
    })
  })

  describe("WhatsApp notifications", () => {
    it("should queue WhatsApp notification", () => {
      const phone = "+1234567890"
      const message = "Test WhatsApp message"
      const data = { reportId: "456" }

      const notification = notificationService.queueWhatsAppNotification(phone, message, data)

      expect(notification).toHaveProperty("id")
      expect(notification).toHaveProperty("to", phone)
      expect(notification).toHaveProperty("message", message)
      expect(notification).toHaveProperty("data", data)
      expect(notification).toHaveProperty("status", "queued")
      expect(notification).toHaveProperty("createdAt")

      expect(notificationService.whatsappQueue).toHaveLength(1)
      expect(notificationService.whatsappQueue[0]).toEqual(notification)
    })
  })

  describe("Queue processing", () => {
    it("should process queues without errors", () => {
      notificationService.queueEmailNotification("test@example.com", "Subject", "Body")
      notificationService.queueWhatsAppNotification("+1234567890", "Message")

      expect(() => {
        notificationService.processQueues()
      }).not.toThrow()
    })
  })
})
