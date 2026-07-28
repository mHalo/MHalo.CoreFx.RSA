import { Toaster as Sonner } from 'sonner'
import { useSettingsStore } from '@/stores/settingsStore'

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const isDark = useSettingsStore((s) => s.isDark)
  return (
    <Sonner
      theme={isDark ? 'dark' : 'light'}
      className="toaster group"
      richColors
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:border group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-muted-foreground'
        }
      }}
      {...props}
    />
  )
}

export { Toaster }
