// src/components/ui/sidebar.tsx
import * as React from "react"
import { cn } from "@/lib/utils"

type SidebarState = "expanded" | "collapsed"

type SidebarContext = {
  state: SidebarState
  open: boolean
  setOpen: (open: boolean) => void
}

const SidebarContext = React.createContext<SidebarContext | null>(null)

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

interface SidebarProviderProps {
  children: React.ReactNode
  defaultOpen?: boolean
}

export function SidebarProvider({
  children,
  defaultOpen = true,
}: SidebarProviderProps) {
  const [open, setOpen] = React.useState(defaultOpen)

  const value = React.useMemo<SidebarContext>(() => ({
    open,
    setOpen,
    state: open ? "expanded" : "collapsed" as SidebarState,
  }), [open])

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  )
}

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function Sidebar({ children, className, ...props }: SidebarProps) {
  const { state } = useSidebar()
  
  return (
    <div
      className={cn(
        "flex h-screen flex-col bg-background border-r transition-all duration-300",
        state === "expanded" ? "w-64" : "w-16",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function SidebarContent({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-1 flex-col overflow-auto p-4", className)}
      {...props}
    >
      {children}
    </div>
  )
}