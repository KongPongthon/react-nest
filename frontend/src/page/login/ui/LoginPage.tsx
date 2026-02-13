import { Button } from '@/components/ui/button'

const LoginPage = () => {
  const handleLogin = () => {
    try {
      
    } catch (error) {
      console.log(error)
    }
  }
  return (
    <div>
      <Button
        onClick={handleLogin}
        className="border rounded-lg hover:cursor-pointer"
      >
        Login OAuth
      </Button>
    </div>
  )
}

export default LoginPage
