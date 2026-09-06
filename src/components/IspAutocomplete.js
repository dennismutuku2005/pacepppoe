"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Search, Check, X, Loader2 } from 'lucide-react'
import { ispService } from '@/services/admin/isps'
import { cn } from '@/lib/utils'

export function IspAutocomplete({
  value,
  onChange,
  placeholder = "Type at least 3 letters to search ISP...",
  className = ""
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIspLabel, setSelectedIspLabel] = useState('')
  const containerRef = useRef(null)

  // Fetch initial label if value exists on mount/change
  useEffect(() => {
    let isMounted = true
    if (value) {
      ispService.getISPSuggestions('').then(res => {
        if (isMounted && res.status === 'success') {
          const found = (res.data || []).find(i => String(i.id) === String(value))
          if (found) {
            const label = found.name ? `${found.name} (${found.username})` : found.username
            setSelectedIspLabel(label)
            setQuery(label)
          }
        }
      }).catch(err => console.error("Initial ISP label fetch error", err))
    } else {
      setSelectedIspLabel('')
      setQuery('')
    }
    return () => { isMounted = false }
  }, [value])

  // Real-time API search on 3+ characters typed (with 300ms debounce)
  useEffect(() => {
    if (query.trim().length < 3) {
      setSuggestions([])
      setIsLoading(false)
      return
    }

    if (query === selectedIspLabel) {
      return
    }

    setIsLoading(true)
    const handler = setTimeout(async () => {
      try {
        const res = await ispService.getISPSuggestions(query.trim())
        if (res && res.status === 'success') {
          setSuggestions(res.data || [])
          setIsOpen(true)
        }
      } catch (err) {
        console.error("Live ISP suggestion error", err)
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => clearTimeout(handler)
  }, [query, selectedIspLabel])

  // Click outside detector
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
        setQuery(selectedIspLabel)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [selectedIspLabel])

  const handleSelect = (isp) => {
    const label = isp.name ? `${isp.name} (${isp.username})` : isp.username
    setQuery(label)
    setSelectedIspLabel(label)
    onChange(isp)
    setIsOpen(false)
  }

  const handleClear = (e) => {
    e.stopPropagation()
    setQuery('')
    setSelectedIspLabel('')
    setSuggestions([])
    onChange({ id: '', name: '', username: '' })
    setIsOpen(false)
  }

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onFocus={() => {
            if (query.trim().length >= 3 && query !== selectedIspLabel) {
              setIsOpen(true)
            }
          }}
          onChange={(e) => {
            const val = e.target.value
            setQuery(val)
            if (val.trim().length < 3) {
              setIsOpen(false)
              if (val.trim() === '') {
                setSelectedIspLabel('')
                onChange({ id: '', name: '', username: '' })
              }
            }
          }}
          placeholder={placeholder}
          className="w-full pl-9 pr-8 py-2 rounded-xl border border-pace-border bg-pace-bg-subtle text-xs font-semibold text-admin-value outline-none focus:border-pace-purple transition-all placeholder:text-admin-dim/60"
        />
        
        {isLoading ? (
          <Loader2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-pace-purple animate-spin" />
        ) : (
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-dim/70 pointer-events-none" />
        )}
        
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-admin-dim hover:text-admin-value p-0.5 rounded-full hover:bg-pace-border/40 transition-all"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* Real-time Suggestions Floating Popover (Only visible after 3+ characters) */}
      {isOpen && query.trim().length >= 3 && (
        <div className="absolute z-50 left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-card-bg border border-pace-border rounded-xl shadow-xl py-1 text-xs font-figtree animate-in fade-in-50 zoom-in-95 duration-150">
          {isLoading ? (
            <div className="px-4 py-3 flex items-center justify-center gap-2 text-admin-dim text-xs">
              <Loader2 size={14} className="animate-spin text-pace-purple" />
              <span>Searching API for &quot;{query}&quot;...</span>
            </div>
          ) : suggestions.length === 0 ? (
            <div className="px-4 py-3 text-center text-admin-dim text-xs">
              No matching ISPs found for &quot;{query}&quot;
            </div>
          ) : (
            suggestions.map((isp) => {
              const isSelected = String(value) === String(isp.id)
              return (
                <div
                  key={isp.id}
                  onClick={() => handleSelect(isp)}
                  className={cn(
                    "px-3 py-2 cursor-pointer flex items-center justify-between hover:bg-pace-purple/5 transition-colors",
                    isSelected && "bg-pace-purple/10 text-pace-purple font-bold"
                  )}
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-admin-value truncate">{isp.name || isp.username}</p>
                    <p className="text-[10px] text-admin-dim truncate">@{isp.username} {isp.phone ? `• ${isp.phone}` : ''}</p>
                  </div>
                  {isSelected && <Check size={14} className="text-pace-purple shrink-0" />}
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
