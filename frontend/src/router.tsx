import { createRouter } from '@tanstack/react-router'
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'
import * as TanstackQuery from './integrations/tanstack-query/root-provider'
import './styles.css'

// Import the generated route tree
import { routeTree } from './routeTree.gen'

// Create a new router instance
export const getRouter = () => {
  const rqContext = TanstackQuery.getContext()

  const router = createRouter({
    routeTree,
    context: { ...rqContext },
    defaultPreload: 'intent',
    defaultNotFoundComponent: () => {
      return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>404 - Page Not Found</h2>
          <p>ขออภัย ไม่พบหน้าที่คุณต้องการ</p>
          <button onClick={() => window.history.back()}>ย้อนกลับ</button>
        </div>
      )
    },
    Wrap: (props: { children: React.ReactNode }) => {
      return (
        <TanstackQuery.Provider {...rqContext}>
          {props.children}
        </TanstackQuery.Provider>
      )
    },
  })

  setupRouterSsrQueryIntegration({ router, queryClient: rqContext.queryClient })

  return router
}
