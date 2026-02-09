import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { LoginForm } from "../forms/login-form"
import { CreateUserForm } from "../forms/create-user-form"

export function LoginPage() {
  return (
    <Tabs defaultValue="login" className="w-[400px]">
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
