import { Toaster as SonnerToaster } from 'sonner'

export const Toaster = (props) => (
  <SonnerToaster theme="light" position="top-right"
    toastOptions={{
      classNames: {
        toast: '!rounded-xl !border !border-ink/10 !bg-white !text-ink !shadow-lift !font-sans',
        title: '!font-semibold',
        description: '!text-ink/60',
      },
    }} {...props} />
)
