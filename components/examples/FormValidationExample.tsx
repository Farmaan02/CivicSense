"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { reportSchema, ReportFormData, mapZodErrorsToForm } from "@/lib/form-validation"
import { z } from "zod"

export function FormValidationExample() {
  const form = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      location: {
        lat: 0,
        lng: 0,
      },
      address: "",
      priority: "medium",
      anonymous: false,
    },
  })

  const onSubmit = async (data: ReportFormData) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log("Form submitted:", data)
      alert("Report submitted successfully!")
    } catch (error) {
      if (error instanceof z.ZodError) {
        mapZodErrorsToForm(form, error)
      } else {
        console.error("Submission error:", error)
        alert("Failed to submit report")
      }
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Report Form Example</CardTitle>
        <CardDescription>
          This form demonstrates centralized validation with Zod and react-hook-form
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Input
              label="Title"
              placeholder="Enter report title"
              {...form.register("title")}
              error={form.formState.errors.title?.message}
            />
          </div>
          
          <div>
            <Input
              label="Description"
              placeholder="Describe the issue"
              {...form.register("description")}
              error={form.formState.errors.description?.message}
            />
          </div>
          
          <div>
            <Input
              label="Category"
              placeholder="Select category"
              {...form.register("category")}
              error={form.formState.errors.category?.message}
            />
          </div>
          
          <div>
            <Input
              label="Address"
              placeholder="Enter location address"
              {...form.register("address")}
              error={form.formState.errors.address?.message}
            />
          </div>
          
          <div className="flex gap-4">
            <Button type="submit" loading={form.formState.isSubmitting}>
              Submit Report
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              disabled={form.formState.isSubmitting}
            >
              Reset
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}