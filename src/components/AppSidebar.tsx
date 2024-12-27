// components/AppSidebar.tsx
import { Link } from "react-router-dom"
import { Sidebar, SidebarContent } from "@/components/ui/sidebar"
import { Users, Gift, UserCircle, Receipt, PiggyBank, Home, CreditCard, Ticket } from "lucide-react"

// Navigation items grouped by category
const mainItems = [
  {
    title: "Dashboard",
    to: "/dashboard",
    icon: Home,
  },
]

const referralItems = [
  {
    title: "Referrals",
    to: "/referrals",
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
    title: "Payments",
    to: "/payments",
    icon: Receipt,
  },

  {
    title: "Crypto",
    to: "/crypto-payment",
    icon: CreditCard,

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
        {/* Main Navigation */}
        <div className="space-y-6">
          {/* Dashboard Section */}
          <nav className="space-y-1">
            {mainItems.map((item) => (
              <Link
                key={item.title}
                to={item.to}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white rounded-md hover:bg-gray-800 transition-colors"
              >
                <item.icon className="w-4 h-4" />
                <span>{item.title}</span>
              </Link>
            ))}
          </nav>

          {/* Referrals Section */}
          <div>
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Referrals
            </h3>
            <nav className="mt-2 space-y-1">
              {referralItems.map((item) => (
                <Link
                  key={item.title}
                  to={item.to}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white rounded-md hover:bg-gray-800 transition-colors"
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.title}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Apps & Games Section */}
          <div>
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Apps & Games
            </h3>
            <nav className="mt-2 space-y-1">
              {appsItems.map((item) => (
                <Link
                  key={item.title}
                  to={item.to}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white rounded-md hover:bg-gray-800 transition-colors"
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.title}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Account & Settings Section */}
          <div>
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Account & Settings
            </h3>
            <nav className="mt-2 space-y-1">
              {accountItems.map((item) => (
                <Link
                  key={item.title}
                  to={item.to}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white rounded-md hover:bg-gray-800 transition-colors"
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.title}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}