import { render, screen } from "@testing-library/react"
import { CommunityImpact } from "../components/community-impact"
import * as i18n from "@/lib/i18n"

// Mock the useTranslation hook
jest.mock("@/lib/i18n", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "community.issuesResolved": "Issues Resolved",
        "community.satisfaction": "Community Satisfaction",
        "community.responseTime": "Avg. Response Time"
      }
      return translations[key] || key
    }
  })
}))

describe("CommunityImpact", () => {
  it("renders community impact stats correctly", () => {
    render(<CommunityImpact />)
    
    // Check that all three stats are rendered
    expect(screen.getByText("1,247")).toBeInTheDocument()
    expect(screen.getByText("89%")).toBeInTheDocument()
    expect(screen.getByText("24h")).toBeInTheDocument()
    
    // Check that all labels are rendered
    expect(screen.getByText("Issues Resolved")).toBeInTheDocument()
    expect(screen.getByText("Community Satisfaction")).toBeInTheDocument()
    expect(screen.getByText("Avg. Response Time")).toBeInTheDocument()
  })
  
  it("renders all icons", () => {
    render(<CommunityImpact />)
    
    // Check that icons are rendered (by checking if elements with icon classes exist)
    const icons = screen.getAllByRole("img", { hidden: true })
    expect(icons.length).toBeGreaterThanOrEqual(3)
  })
})