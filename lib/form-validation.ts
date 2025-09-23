import { z } from 'zod'
import { UseFormReturn, FieldValues, Path } from 'react-hook-form'

// Common validation schemas
export const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .min(1, 'Email is required')

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters')

export const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(100, 'Name must be less than 100 characters')

export const phoneSchema = z
  .string()
  .min(10, 'Phone number must be at least 10 digits')
  .max(15, 'Phone number must be less than 15 digits')
  .regex(/^\+?[0-9]+$/, 'Phone number can only contain numbers and optional +')

// Report form validation schema - Updated to match backend expectations
export const reportSchema = z.object({
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must be less than 2000 characters'),
  media: z.array(z.instanceof(File)).optional(),
  anonymous: z.boolean().default(false),
  useLocation: z.boolean().default(true),
  contactInfo: z.string().email('Please enter a valid email address').optional().or(z.string().max(0)),
})

// User profile validation schema
export const userProfileSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema.optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
})

// Login form validation schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

// Registration form validation schema
export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

// Type inference
export type ReportFormData = z.infer<typeof reportSchema>
export type UserProfileFormData = z.infer<typeof userProfileSchema>
export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>

// Helper function to map Zod errors to form errors
export function mapZodErrorsToForm<T extends FieldValues>(form: UseFormReturn<T>, zodError: z.ZodError) {
  const fieldErrors = zodError.flatten().fieldErrors
  Object.keys(fieldErrors).forEach((field) => {
    const messages = fieldErrors[field]
    if (messages && messages.length > 0) {
      form.setError(field as Path<T>, {
        type: 'manual',
        message: messages[0],
      })
    }
  })
}

// Helper function to clear form errors
export function clearFormErrors<T extends FieldValues>(form: UseFormReturn<T>) {
  Object.keys(form.formState.errors).forEach((field) => {
    form.clearErrors(field as Path<T>)
  })
}