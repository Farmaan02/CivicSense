"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Modal, ModalContent, ModalDescription, ModalHeader, ModalTitle, ModalTrigger } from "@/components/ui/Modal"
import { Avatar } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/ui/ThemeToggle"
import { DataTable } from "@/components/ui/DataTable"
import { MapContainer } from "@/components/ui/MapContainer"
import { SidebarItem } from "@/components/ui/sidebar"
import { 
  Home, 
  MapPin, 
  Search,
  Bell,
  Settings
} from "lucide-react"
import { FormValidationExample } from "@/components/examples/FormValidationExample"

export default function UIKitPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Sample data for DataTable
  const sampleData = [
    { id: 1, name: "Report 1", status: "Pending", priority: "High" },
    { id: 2, name: "Report 2", status: "In Progress", priority: "Medium" },
    { id: 3, name: "Report 3", status: "Resolved", priority: "Low" },
  ]

  const columns = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "status",
      header: "Status",
    },
    {
      accessorKey: "priority",
      header: "Priority",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">CivicPulse UI Kit</h1>
          <p className="text-muted-foreground mt-2">
            Modernized component library for the CivicPulse application
          </p>
        </div>

        {/* Color Palette */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Color Palette</CardTitle>
            <CardDescription>Primary and semantic colors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-primary mb-2"></div>
                <span className="text-sm">Primary</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-secondary mb-2"></div>
                <span className="text-sm">Secondary</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-success mb-2"></div>
                <span className="text-sm">Success</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-destructive mb-2"></div>
                <span className="text-sm">Error</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Buttons */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Buttons</CardTitle>
            <CardDescription>Various button styles and states</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
            <Button variant="destructive">Destructive</Button>
            <Button disabled>Disabled</Button>
            <Button loading>Loading</Button>
          </CardContent>
        </Card>

        {/* Inputs */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Inputs</CardTitle>
            <CardDescription>Form inputs with validation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Default input" />
            <Input placeholder="Input with label" label="Label" />
            <Input placeholder="Input with helper text" helperText="This is helper text" />
            <Input placeholder="Input with error" error="This is an error message" />
            <Input 
              placeholder="Input with icon" 
              icon={<Search className="h-4 w-4" />} 
              iconPosition="left"
            />
          </CardContent>
        </Card>

        {/* Cards */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Cards</CardTitle>
            <CardDescription>Card components with various content</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Card Title</CardTitle>
                  <CardDescription>Card description text</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>This is the card content area.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Another Card</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Card with content only.</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Modals */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Modals</CardTitle>
            <CardDescription>Dialog components</CardDescription>
          </CardHeader>
          <CardContent>
            <Modal open={isModalOpen} onOpenChange={setIsModalOpen}>
              <ModalTrigger asChild>
                <Button>Open Modal</Button>
              </ModalTrigger>
              <ModalContent>
                <ModalHeader>
                  <ModalTitle>Modal Title</ModalTitle>
                  <ModalDescription>
                    This is a modal description text.
                  </ModalDescription>
                </ModalHeader>
                <div className="p-6">
                  <p>This is the modal content area.</p>
                </div>
              </ModalContent>
            </Modal>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Data Table</CardTitle>
            <CardDescription>Sortable and filterable data table</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable 
              columns={columns} 
              data={sampleData} 
              title="Sample Reports"
            />
          </CardContent>
        </Card>

        {/* Avatars */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Avatars</CardTitle>
            <CardDescription>User profile images</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <Avatar fallback="JD" />
            <Avatar fallback="AS" size="lg" />
            <Avatar src="https://github.com/shadcn.png" alt="User" size="xl" />
          </CardContent>
        </Card>

        {/* Theme Toggle */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Theme Toggle</CardTitle>
            <CardDescription>Light/dark mode switcher</CardDescription>
          </CardHeader>
          <CardContent>
            <ThemeToggle />
          </CardContent>
        </Card>

        {/* Map Container */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Map Container</CardTitle>
            <CardDescription>Interactive map component</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <MapContainer className="h-full">
                <div className="flex h-full items-center justify-center bg-muted">
                  <MapPin className="h-8 w-8 text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Map Placeholder</span>
                </div>
              </MapContainer>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Components */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Navigation</CardTitle>
            <CardDescription>Sidebar and header components</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <SidebarItem>
                  <Home className="h-4 w-4" />
                  <span>Home</span>
                </SidebarItem>
                <SidebarItem isActive>
                  <MapPin className="h-4 w-4" />
                  <span>Map</span>
                </SidebarItem>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </Button>
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Validation Example */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Form Validation</CardTitle>
            <CardDescription>Centralized validation with Zod and react-hook-form</CardDescription>
          </CardHeader>
          <CardContent>
            <FormValidationExample />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}