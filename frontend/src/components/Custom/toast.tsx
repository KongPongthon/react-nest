import { Alert, AlertDescription, AlertTitle } from '../ui/alert'

export function CustomToast() {
  return (
    <div className="grid w-full max-w-md items-start gap-4">
      <Alert>
        <AlertTitle>Heads up!</AlertTitle>
        <AlertDescription>
          You can add components and dependencies to your app using the cli.
        </AlertDescription>
      </Alert>
    </div>
  )
}
