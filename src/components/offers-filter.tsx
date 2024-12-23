import { Search } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface OffersFilterProps {
  onFilterChange: (category: string) => void;
  onSearchChange: (search: string) => void;
  activeCategory: string;
}

export function OffersFilter({ onFilterChange, onSearchChange, activeCategory }: OffersFilterProps) {
  const categories = ['All', 'Games', 'Surveys', 'Tasks']

  return (
    <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-x-4 md:space-y-0">
      <div className="relative flex-1">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search offers..."
          className="pl-8"
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="flex space-x-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={activeCategory === category ? "default" : "outline"}
            onClick={() => onFilterChange(category)}
            className="min-w-[80px]"
          >
            {category}
          </Button>
        ))}
      </div>
    </div>
  )
}

