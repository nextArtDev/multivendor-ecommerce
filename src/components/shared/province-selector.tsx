'use client'

import { Check, ChevronsUpDown } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

import CITIES from '@/constants/cities.json'
import { AnimatePresence, motion } from 'framer-motion'
import React, { MutableRefObject, useEffect, useRef, useState } from 'react'

export interface CitySelectorProps {
  id: string
  open: boolean
  disabled?: boolean
  onToggle: () => void
  onChange: (value: SelectCityMenuOption['name']) => void
  selectedValue: SelectCityMenuOption
}

export type SelectCityMenuOption = (typeof CITIES)[number]

export default function CitySelector({
  id,
  open,
  disabled = false,
  onToggle,
  onChange,
  selectedValue,
}: CitySelectorProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mutableRef = ref as MutableRefObject<HTMLDivElement | null>

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleClickOutside = (event: any) => {
      if (
        mutableRef.current &&
        !mutableRef.current.contains(event.target) &&
        open
      ) {
        onToggle()
        setQuery('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [onToggle, open, ref])

  const [query, setQuery] = useState('')

  return (
    <div ref={ref}>
      <div className="mt-1 relative">
        <button
          type="button"
          className={`${
            disabled ? 'bg-neutral-100' : 'bg-white'
          } relative w-full border border-black/20 rounded-md pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1  sm:text-sm`}
          aria-haspopup="listbox"
          aria-expanded="true"
          aria-labelledby="listbox-label"
          onClick={onToggle}
          disabled={disabled}
        >
          <span
            className={`absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none ${
              disabled ? 'hidden' : ''
            }`}
          >
            <svg
              className="h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </button>

        <AnimatePresence>
          {open && (
            <motion.ul
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="absolute z-10 mt-1 shadow-sm w-full  max-h-80 rounded-md text-base ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm bg-foreground/50 backdrop-blur-xl"
              tabIndex={-1}
              role="listbox"
              aria-labelledby="listbox-label"
              aria-activedescendant="listbox-option-3"
            >
              <div className="sticky top-0 z-10 ">
                <li className=" text-gray-900 cursor-default select-none relative py-2 px-3">
                  <input
                    type="search"
                    name="search"
                    autoComplete={'off'}
                    className=" p-1 bg-foreground/30 backdrop-blur-sm block w-full sm:text-sm rounded-md outline-none placeholder:text-secondary "
                    placeholder={'Search a country'}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </li>
                <hr />
              </div>

              <div
                className={
                  'max-h-64 scrollbar scrollbar-track-gray-100 scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-600 scrollbar-thumb-rounded scrollbar-thin overflow-y-scroll'
                }
              >
                {CITIES.filter((country) =>
                  country.name.toLowerCase().startsWith(query.toLowerCase())
                ).length === 0 ? (
                  <li className="text-gray-900 cursor-default select-none relative py-2 pl-3 pr-9">
                    No cities found
                  </li>
                ) : (
                  CITIES.filter((country) =>
                    country.name.toLowerCase().startsWith(query.toLowerCase())
                  ).map((value, index) => {
                    return (
                      <li
                        key={`${id}-${index}`}
                        className="text-gray-900 cursor-default select-none relative py-2 pl-3 pr-9 flex items-center hover:bg-gray-50 transition"
                        id="listbox-option-0"
                        role="option"
                        onClick={() => {
                          onChange(value.name)
                          setQuery('')
                          onToggle()
                        }}
                      >
                        <span className="font-normal truncate">
                          {value.name}
                        </span>
                        {value.name === selectedValue.name ? (
                          <span className="text-blue-600 absolute inset-y-0 right-0 flex items-center pr-8">
                            <svg
                              className="h-5 w-5"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              aria-hidden="true"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </span>
                        ) : null}
                      </li>
                    )
                  })
                )}
              </div>
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
