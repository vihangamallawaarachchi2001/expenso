
import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import { useState } from "react"
import { toast, ToastContainer } from "react-toast"
import Button from "~/components/common/button"
import { api } from "~/utils/api"


export default function ForgotPassword () {

    const [email, setEmail] = useState('')
    const [newPassword, setNewPassword] = useState('')

    const router = useRouter()

    const mutation = api.user.resetPassword.useMutation()

    const handleResetPassword = async () => {
        try{
            await mutation.mutateAsync({ email, newPassword })
            toast.success('Password reset successfully!')
            await router.push('/dashboard')
        } catch (error) {
            console.error(error)
        }

    }

  return (
    <>
    <Head>
      <title>Expenso - Reset Password </title>
      <meta name="description" content="Generated by create-t3-app" />
      <link rel="icon" href="/favicon.ico" />
    </Head>

    <main className="flex items-center justify-center w-full h-screen bg-gray-100">
<form className="min-w-96 max-w-[440px] w-full bg-white rounded-lg shadow-xl p-10 space-y-8">
  {/* Form Header */}
  <div className="text-center">
    <h1 className="text-3xl font-semibold text-gray-800 mb-6">Welcome to Expenso</h1>
    <p className="text-lg text-gray-600">Enter new email and password to continue</p>
  </div>

  {/* Email Input */}
  <div className="flex flex-col items-start justify-center space-y-2">
    <label htmlFor="email" className="text-lg font-semibold text-gray-700">Email</label>
    <input
      type="email"
      name="email"
      id="email"
      className="w-full px-4 py-2 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
      onChange={(e) => setEmail(e.target.value)}
      value={email}
      required
      placeholder="Enter your email"
    />
  </div>

  {/* Password Input */}
  <div className="flex flex-col items-start justify-center space-y-2">
    <label htmlFor="password" className="text-lg font-semibold text-gray-700">Password</label>
    <input
      type="password"
      name="password"
      id="password"
      className="w-full px-4 py-2 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
      onChange={(e) => setNewPassword(e.target.value)}
      value={newPassword}
      required
      placeholder="Enter your password"
    />
  </div>

  {/* Submit Button */}
  <Button
    title="Reset"
    onclick={() => handleResetPassword()}
    classNameBtn="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all ease-in-out duration-300"
  />

<p className="text-center text-gray-600"> have an account?<Link href={'/'}>Login</Link> </p>
</form>



{/* Toast Container for notifications */}
<ToastContainer />
</main>

  </>
  )
}

