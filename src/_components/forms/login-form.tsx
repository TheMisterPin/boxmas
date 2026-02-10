/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks'
import { useErrorModal } from '@/hooks'
import { loginFormSchema } from '@/utils/forms/schemas/login-form'

export function LoginForm() {
  const [serverSuccess, setServerSuccess] = useState<string | null>(null)
  const { openModal } = useErrorModal()
  const { login } = useAuth()

  const form = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema as any),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onSubmit',
  })

  async function onSubmit(values: z.infer<typeof loginFormSchema>) {
    setServerSuccess(null)

    try {
      const success = await login(values.email, values.password)
      if (success) {
        setServerSuccess('Login successful!')
        form.reset()
      } else {
        openModal('Invalid email or password')
      }
    } catch {
      openModal('Failed to login')
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input autoComplete="email" placeholder="jane@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {serverSuccess && (
          <p className="text-sm" role="status">
            {serverSuccess}
          </p>
        )}

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Logging in...' : 'Log in'}
        </Button>
      </form>
    </Form>
  )
}
