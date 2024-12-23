import { Link } from "react-router-dom"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { 
  Users, 
  Gift, 
  UserCircle, 
  Receipt, 
  PiggyBank 
} from "lucide-react"

const items = [
  {
    title: "Referrals",
    to: "/referrals",  // Changed from url to to
    icon: Users,
  },
]

const appsItems = [
  {
    title: "Offers",
    to: "/offers",
    icon: Gift,
  },
]

const accountItems = [
  {
    title: "Dashboard",
    to: "/dashboard",
    icon: UserCircle,
  },
  {
    title: "Entry Prize Pot Donation ",
    to: "/payments",
    icon: Receipt,
  },
  {
    title: "Withdraw",
    to: "/withdraw",
    icon: PiggyBank,
  },
]

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.to} className="text-gray-400 hover:text-white">
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-500">APPS & GAMES</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {appsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.to} className="text-gray-400 hover:text-white">
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-500">ACCOUNT AND SETTINGS</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.to} className="text-gray-400 hover:text-white">
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}