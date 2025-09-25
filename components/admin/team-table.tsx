"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Users, Clock } from "lucide-react"

interface Team {
  id: string
  name: string
  department: string
  currentLoad: number
  capacity: number
  availableCapacity: number
  canTakeAssignment: boolean
  members?: Array<{
    name: string
    email: string
    role: string
  }>
  assignedReports?: Array<{
    reportId: string
    assignedAt: string
    priority: string
  }>
}

interface TeamTableProps {
  teams: Team[]
}

const departmentColors = {
  "public-works": "bg-blue-100 text-blue-800",
  "emergency-services": "bg-red-100 text-red-800",
  environmental: "bg-green-100 text-green-800",
  "parks-recreation": "bg-yellow-100 text-yellow-800",
  utilities: "bg-purple-100 text-purple-800",
  transportation: "bg-orange-100 text-orange-800",
}

export function TeamTable({ teams }: TeamTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Team Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team) => {
            const utilizationRate = Math.round((team.currentLoad / team.capacity) * 100)
            const isOverloaded = utilizationRate > 90
            const isAvailable = team.canTakeAssignment

            return (
              <Card
                key={team.id}
                className={`${isOverloaded ? "border-red-200" : isAvailable ? "border-green-200" : "border-gray-200"}`}
              >
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-sm truncate max-w-[200px]">{team.name}</h3>
                      <Badge
                        className={
                          departmentColors[team.department as keyof typeof departmentColors] ||
                          "bg-gray-100 text-gray-800"
                        }
                      >
                        {team.department.replace("-", " ")}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Workload</span>
                        <span>
                          {team.currentLoad}/{team.capacity}
                        </span>
                      </div>
                      <Progress
                        value={utilizationRate}
                        className={`h-2 ${isOverloaded ? "bg-red-100" : "bg-gray-100"}`}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{utilizationRate}% utilized</span>
                        <span className={isAvailable ? "text-green-600" : "text-red-600"}>
                          {isAvailable ? "Available" : "At Capacity"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{team.members?.length || 0} members</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{team.assignedReports?.length || 0} active</span>
                      </div>
                    </div>

                    {team.assignedReports && team.assignedReports.length > 0 && (
                      <div className="space-y-1">
                        <div className="text-xs font-medium text-muted-foreground">Recent Assignments:</div>
                        {team.assignedReports.slice(0, 2).map((assignment, index) => (
                          <div key={index} className="text-xs flex items-center justify-between">
                            <span>Report #{assignment.reportId}</span>
                            <Badge variant="outline" className="text-xs">
                              {assignment.priority}
                            </Badge>
                          </div>
                        ))}
                        {team.assignedReports.length > 2 && (
                          <div className="text-xs text-muted-foreground">+{team.assignedReports.length - 2} more</div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {teams.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No teams found</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
