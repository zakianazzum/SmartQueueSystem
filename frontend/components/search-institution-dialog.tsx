"use client"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown, Search, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import { mockInstitutions } from "@/lib/mock-data"

interface SearchInstitutionDialogProps {
  onInstitutionSelect: (institution: any) => void
}

export function SearchInstitutionDialog({ onInstitutionSelect }: SearchInstitutionDialogProps) {
  const [open, setOpen] = useState(false)
  const [comboboxOpen, setComboboxOpen] = useState(false)
  const [selectedInstitution, setSelectedInstitution] = useState<any>(null)
  const [searchValue, setSearchValue] = useState("")

  const filteredInstitutions = mockInstitutions.filter(
    (institution) =>
      institution.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      institution.address.toLowerCase().includes(searchValue.toLowerCase()) ||
      institution.type.toLowerCase().includes(searchValue.toLowerCase()),
  )

  const handleInstitutionSelect = (institution: any) => {
    setSelectedInstitution(institution)
    setComboboxOpen(false)
    onInstitutionSelect(institution)
    setOpen(false)
    // Reset form
    setTimeout(() => {
      setSelectedInstitution(null)
      setSearchValue("")
    }, 300)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="cursor-pointer bg-transparent">
          <Search className="h-4 w-4 mr-2" />
          Search Institution
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Search Institution</DialogTitle>
          <DialogDescription>Search for an institution by name or location to view it on the map</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Institution Name or Location</label>
            <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={comboboxOpen}
                  className="w-full justify-between cursor-pointer bg-transparent"
                >
                  {selectedInstitution ? selectedInstitution.name : "Select institution..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput
                    placeholder="Search institutions..."
                    value={searchValue}
                    onValueChange={setSearchValue}
                  />
                  <CommandList>
                    <CommandEmpty>No institution found.</CommandEmpty>
                    <CommandGroup>
                      {filteredInstitutions.map((institution) => (
                        <CommandItem
                          key={institution.id}
                          value={institution.name}
                          onSelect={() => handleInstitutionSelect(institution)}
                          className="cursor-pointer"
                        >
                          <div className="flex flex-col w-full">
                            <div className="flex items-center">
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedInstitution?.id === institution.id ? "opacity-100" : "opacity-0",
                                )}
                              />
                              <span className="font-medium">{institution.name}</span>
                            </div>
                            <div className="ml-6 text-sm text-muted-foreground flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {institution.address}
                            </div>
                            <div className="ml-6 text-xs text-muted-foreground">
                              {institution.type} • {institution.currentCrowdLevel} crowd level
                            </div>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
