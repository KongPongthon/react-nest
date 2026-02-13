import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protect')({
  beforeLoad({ location }) {
    console.log(location)
  },
})
