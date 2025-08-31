"use client"
import { useState, useEffect } from "react"
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
import { Check, ChevronsUpDown, Search, MapPin, Building2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useInstitutions } from "@/hooks/use-institutions"
import { useBranches } from "@/hooks/use-branches"
import { Institution, Branch } from "@/lib/api"

interface EnhancedSearchDialogProps {
  onBranchSelect: (branch: Branch) => void
}

export function EnhancedSearchDialog({ onBranchSelect }: EnhancedSearchDialogProps) {
  const [open, setOpen] = useState(false)
  const [institutionComboboxOpen, setInstitutionComboboxOpen] = useState(false)
  const [branchComboboxOpen, setBranchComboboxOpen] = useState(false)
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null)
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null)
  const [institutionSearchValue, setInstitutionSearchValue] = useState("")
  const [branchSearchValue, setBranchSearchValue] = useState("")

  const { institutions, loading: institutionsLoading, error: institutionsError } = useInstitutions()
  const { branches, loading: branchesLoading, error: branchesError } = useBranches()

  // Filter institutions based on search
  const filteredInstitutions = institutions.filter(
    (institution) =>
      institution.name.toLowerCase().includes(institutionSearchValue.toLowerCase()) ||
      institution.institutionDescription?.toLowerCase().includes(institutionSearchValue.toLowerCase()) ||
      institution.institutionType?.name.toLowerCase().includes(institutionSearchValue.toLowerCase())
  )

  // Filter branches based on selected institution and search
  const filteredBranches = branches.filter(
    (branch) =>
      (!selectedInstitution || branch.institutionId === selectedInstitution.institutionId) &&
      (branch.name.toLowerCase().includes(branchSearchValue.toLowerCase()) ||
       branch.address?.toLowerCase().includes(branchSearchValue.toLowerCase()))
  )

  const handleInstitutionSelect = (institution: Institution) => {
    setSelectedInstitution(institution)
    setSelectedBranch(null) // Reset branch selection when institution changes
    setInstitutionComboboxOpen(false)
  }

  const handleBranchSelect = (branch: Branch) => {
    setSelectedBranch(branch)
    setBranchComboboxOpen(false)
    onBranchSelect(branch)
    setOpen(false)
    // Reset form after a delay
    setTimeout(() => {
      setSelectedInstitution(null)
      setSelectedBranch(null)
      setInstitutionSearchValue("")
      setBranchSearchValue("")
    }, 300)
  }

  const getCrowdLevel = (crowdCount: number | undefined) => {
    if (!crowdCount) return "Unknown"
    if (crowdCount <= 10) return "Low"
    if (crowdCount <= 25) return "Medium"
    return "High"
  }

  const getCrowdColor = (level: string) => {
    switch (level) {
      case "Low":
        return "bg-green-500"
      case "Medium":
        return "bg-yellow-500"
      case "High":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="cursor-pointer bg-transparent">
          <Search className="h-4 w-4 mr-2" />
          Search Institution
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Search Institution & Branch</DialogTitle>
          <DialogDescription>
            First select an institution, then choose a specific branch to view on the map
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Institution Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Institution</label>
            <Popover open={institutionComboboxOpen} onOpenChange={setInstitutionComboboxOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={institutionComboboxOpen}
                  className="w-full justify-between cursor-pointer bg-transparent"
                  disabled={institutionsLoading}
                >
                  {institutionsLoading ? (
                    "Loading institutions..."
                  ) : selectedInstitution ? (
                    selectedInstitution.name
                  ) : (
                    "Select institution..."
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput
                    placeholder="Search institutions..."
                    value={institutionSearchValue}
                    onValueChange={setInstitutionSearchValue}
                  />
                  <CommandList>
                    <CommandEmpty>
                      {institutionsError ? "Error loading institutions" : "No institution found."}
                    </CommandEmpty>
                    <CommandGroup>
                      {filteredInstitutions.map((institution) => (
                        <CommandItem
                          key={institution.institutionId}
                          value={institution.name}
                          onSelect={() => handleInstitutionSelect(institution)}
                          className="cursor-pointer"
                        >
                          <div className="flex flex-col w-full">
                            <div className="flex items-center">
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedInstitution?.institutionId === institution.institutionId ? "opacity-100" : "opacity-0",
                                )}
                              />
                              <span className="font-medium">{institution.name}</span>
                            </div>
                            <div className="ml-6 text-sm text-muted-foreground flex items-center">
                              <Building2 className="h-3 w-3 mr-1" />
                              {institution.institutionType?.name || "Unknown Type"}
                            </div>
                            <div className="ml-6 text-xs text-muted-foreground">
                              {institution.branches.length} branch(es)
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

          {/* Branch Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Branch</label>
            <Popover open={branchComboboxOpen} onOpenChange={setBranchComboboxOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={branchComboboxOpen}
                  className="w-full justify-between cursor-pointer bg-transparent"
                  disabled={!selectedInstitution || branchesLoading}
                >
                  {branchesLoading ? (
                    "Loading branches..."
                  ) : !selectedInstitution ? (
                    "Please select an institution first"
                  ) : selectedBranch ? (
                    selectedBranch.name
                  ) : (
                    "Select branch..."
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput
                    placeholder="Search branches..."
                    value={branchSearchValue}
                    onValueChange={setBranchSearchValue}
                  />
                  <CommandList>
                    <CommandEmpty>
                      {branchesError ? "Error loading branches" : "No branch found."}
                    </CommandEmpty>
                    <CommandGroup>
                      {filteredBranches.map((branch) => {
                        const crowdLevel = getCrowdLevel(branch.totalCrowdCount)
                        return (
                          <CommandItem
                            key={branch.branchId}
                            value={branch.name}
                            onSelect={() => handleBranchSelect(branch)}
                            className="cursor-pointer"
                          >
                            <div className="flex flex-col w-full">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      selectedBranch?.branchId === branch.branchId ? "opacity-100" : "opacity-0",
                                    )}
                                  />
                                  <span className="font-medium">{branch.name}</span>
                                </div>
                                <div className={`w-3 h-3 rounded-full ${getCrowdColor(crowdLevel)}`}></div>
                              </div>
                              <div className="ml-6 text-sm text-muted-foreground flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {branch.address || "No address"}
                              </div>
                              <div className="ml-6 text-xs text-muted-foreground">
                                {crowdLevel} crowd • {branch.totalCrowdCount || 0} people
                              </div>
                            </div>
                          </CommandItem>
                        )
                      })}
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
