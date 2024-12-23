import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, DollarSign, Target, Zap } from "lucide-react"
import type { UserStats } from '../types/offers'

interface StatsCardsProps {
  stats: UserStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="backdrop-blur bg-card/50 border-purple-500/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white">Total Earned</CardTitle>
          <DollarSign className="h-4 w-4 text-green-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">${stats.total_earned.toFixed(2)}</div>
        </CardContent>
      </Card>
      <Card className="backdrop-blur bg-card/50 border-purple-500/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white">Completed Offers</CardTitle>
          <Target className="h-4 w-4 text-blue-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{stats.completed_offers}</div>
        </CardContent>
      </Card>
      <Card className="backdrop-blur bg-card/50 border-purple-500/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white">Current Streak</CardTitle>
          <Zap className="h-4 w-4 text-yellow-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{stats.current_streak} days</div>
        </CardContent>
      </Card>
    </div>
  )
}