import { z } from 'zod';

// ============================================
// LOGIN VALIDATION
// ============================================
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),

  password: z
    .string()
    .min(1, 'Password is required'),
});

// ============================================
// REGISTER VALIDATION
// ============================================
export const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address'),

    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),

    confirmPassword: z
      .string()
      .min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// ============================================
// KYC VALIDATION
// ============================================
export const kycSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  gender: z.string().min(1, 'Gender is required'),
  first_name: z.string().min(1, 'First name is required'),
  middle_name: z.string().optional(),
  last_name: z.string().min(1, 'Last name is required'),
  dob: z.string().min(1, 'Date of birth is required'),
  address: z.string().min(1, 'Address is required'),
  country: z.string().min(1, 'Country is required'),
  state: z.string().min(1, 'State is required'),
  city: z.string().min(1, 'City is required'),
  postal_code: z.string().optional(),
  mobile_no: z.string().min(1, 'Mobile number is required'),
  id_type: z.string().min(1, 'ID type is required'),
  id_number: z.string().min(1, 'ID number is required'),
});

// ============================================
// ASSESSMENT VALIDATION
// ============================================
export const assessmentSchema = z
  .object({
    monthly_income: z
      .number()
      .min(1, 'Monthly income is required')
      .max(999999999, 'Monthly income is too high'),

    monthly_expense: z
      .number()
      .min(1, 'Monthly expense is required')
      .max(999999999, 'Monthly expense is too high'),

    existing_loans: z
      .number()
      .min(0, 'Existing loans cannot be negative')
      .max(999999999, 'Existing loans amount is too high'),
  })
  .refine(
    (data) => data.monthly_expense < data.monthly_income,
    {
      message: 'Monthly expenses must be less than monthly income',
      path: ['monthly_expense'],
    }
  );

// ============================================
// TYPES
// ============================================
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type KYCFormData = z.infer<typeof kycSchema>;
export type AssessmentFormData = z.infer<typeof assessmentSchema>;