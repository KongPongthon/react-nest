import { Separator } from '../ui/separator'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { Lock, User } from 'lucide-react'
import { Button } from '../ui/button'
import BaseFormInput from '../custom-ui/BaseFormInput'
import {
  clientID,
  codeVerifier,
  generateCodeChallenge,
  generateRandomString,
  getScope,
  MSAuthUrl,
  redirectUrl,
} from '@/lib/oauth-script'

const formSchema = z.object({
  username: z.string().min(1, { message: 'กรุณากรอกบัญชีผู้ใช้งาน' }),
  password: z.string().min(1, { message: 'กรุณากรอกรหัสผ่าน' }),
})

const TITLE = 'กรมทรัพยากรน้ำบาดาล'
const SUBTITLE = 'Department of Groundwater Resources'

const LoginPage = () => {
  const form = useForm({
    defaultValues: {
      username: '',
      password: '',
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async (values) => {
      console.log('values', values)
    },
  })

  const handleLogin = async () => {
    try {
      const codeChallenge = await generateCodeChallenge(codeVerifier)
      const state = generateRandomString(16)
      const nonce = generateRandomString(16)
      localStorage.setItem('state', state)
      localStorage.setItem('nonce', nonce)
      localStorage.setItem('code_verifier', codeVerifier)
      localStorage.setItem('code_challenge', codeChallenge)

      const param = new URLSearchParams({
        client_id: clientID,
        response_type: 'code',
        redirect_url: redirectUrl,
        response_mode: 'fragment',
        scope: getScope(),
        state: state,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
      })

      location.href = `${MSAuthUrl}?${param.toString()}`
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-12 min-h-screen">
      <div className="col-span-1 sm:col-span-6 lg:col-span-4 flex flex-col w-full p-[clamp(1rem,5vw,5rem)]">
        <div className="flex flex-col justify-between flex-1 h-full gap-8">
          <div className="flex flex-col gap-6">
            <div className="w-[100px] h-[100px] bg-neutral-300 flex flex-col justify-center items-center rounded-xl shrink-0">
              <p className="text-xl font-bold">100 X 100</p>
            </div>

            <div className="space-y-1">
              <p className="text-2xl sm:text-3xl font-bold text-primary wrap-break-word leading-tight">
                {TITLE}
              </p>
              <p className="font-medium text-foreground text-sm sm:text-base wrap-break-word">
                {SUBTITLE}
              </p>
            </div>

            <Separator />

            <div className="flex flex-col gap-6">
              <p className="text-xl font-bold">เข้าสู่ระบบ</p>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  form.handleSubmit()
                }}
                className="space-y-6"
              >
                <form.Field
                  name="username"
                  children={(field) => (
                    <BaseFormInput
                      field={field}
                      name="username"
                      title="บัญชีผู้ใช้งาน"
                      icon={<User size={16} className="text-primary" />}
                      type="text"
                    />
                  )}
                />

                <div className="space-y-2">
                  <div className="w-full flex justify-end">
                    <Button
                      variant="link"
                      className="px-0 h-auto font-normal text-sm"
                    >
                      ลืมรหัสผ่าน?
                    </Button>
                  </div>

                  <form.Field
                    name="password"
                    children={(field) => (
                      <BaseFormInput
                        field={field}
                        name="password"
                        title="รหัสผ่าน"
                        icon={<Lock size={16} className="text-primary" />}
                        type="password"
                      />
                    )}
                  />
                </div>

                <form.Subscribe
                  selector={(state) => [state.canSubmit, state.isSubmitting]}
                  children={([canSubmit, isSubmitting]) => (
                    <Button
                      className="w-full mt-2"
                      variant="default"
                      type="submit"
                      disabled={!canSubmit}
                    >
                      {isSubmitting ? '...' : 'เข้าสู่ระบบ'}
                    </Button>
                  )}
                />
              </form>
              <Button
                className="w-full mt-2"
                variant="default"
                type="submit"
                onClick={handleLogin}
              >
                เข้าสู่ระบบ
              </Button>
            </div>
          </div>

          <div className="flex flex-col items-center mt-auto pt-8">
            <p className="font-medium text-center text-sm sm:text-base">
              โดยการดำเนินการต่อ แสดงว่าคุณยอมรับ
            </p>
            <div className="flex items-center gap-1 sm:gap-2 text-sm sm:text-base flex-wrap justify-center">
              <Button
                className="p-0 underline h-auto font-medium"
                variant="link"
              >
                ข้อกำหนดการให้บริการ
              </Button>
              <p className="font-medium">และ</p>
              <Button
                className="p-0 underline h-auto font-medium"
                variant="link"
              >
                นโยบายความเป็นส่วนตัว
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden sm:block sm:col-span-6 lg:col-span-8 w-full h-full min-h-screen relative overflow-hidden bg-primary/10">
        <div className="absolute inset-0 bg-linear-to-br from-primary/90 via-primary/70 to-primary/50" />
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/20 backdrop-blur-2xl" />
        <div className="absolute top-1/2 -left-32 w-80 h-80 rounded-full bg-white/15 backdrop-blur-3xl" />
        <div className="absolute bottom-20 right-1/3 w-64 h-64 rounded-full bg-white/10 backdrop-blur-2xl" />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-linear-to-t from-black/10 to-transparent" />
      </div>
    </div>
  )
}

export default LoginPage
