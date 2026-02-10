
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'

import { CreateUserForm } from '../forms/create-user-form'
import { LoginForm } from '../forms/login-form'

export function LoginPage() {
  return (
    <Tabs defaultValue="login" className="w-100">
      <TabsList>
        <TabsTrigger value="login">Login</TabsTrigger>
        <TabsTrigger value="signup">Signup</TabsTrigger>
      </TabsList>
      <TabsContent value="login">
        <LoginForm />
      </TabsContent>
      <TabsContent value="signup">
        <CreateUserForm/>
      </TabsContent>
    </Tabs>
  )
}
