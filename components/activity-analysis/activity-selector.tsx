"use client"

import { Check, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface ActivitySelectorProps {
  activities: { name: string; color: string }[]
  selectedActivity: { name: string; color: string }
  onSelectActivity: (activity: { name: string; color: string }) => void
}

export function ActivitySelector({ activities, selectedActivity, onSelectActivity }: ActivitySelectorProps) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-[200px] justify-between">
          <div className="flex items-center">
            <div className="mr-2 h-3 w-3 rounded-full" style={{ backgroundColor: selectedActivity.color }} />
            {selectedActivity.name}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="활동 유형 검색..." />
          <CommandList>
            <CommandEmpty>활동 유형을 찾을 수 없습니다.</CommandEmpty>
            <CommandGroup>
              {activities.map((activity) => (
                <CommandItem
                  key={activity.name}
                  value={activity.name}
                  onSelect={() => {
                    onSelectActivity(activity)
                    setOpen(false)
                  }}
                >
                  <div className="mr-2 h-3 w-3 rounded-full" style={{ backgroundColor: activity.color }} />
                  {activity.name}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      selectedActivity.name === activity.name ? "opacity-100" : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
