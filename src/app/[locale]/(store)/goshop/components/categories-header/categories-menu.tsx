import { cn } from '@/lib/utils'
import { Category, Image } from '@prisma/client'
import { ChevronDown, Menu, X } from 'lucide-react'
import NextImage from 'next/image'
import { Link } from '@/navigation'
import { Dispatch, SetStateAction, useState } from 'react'

export default function CategoriesMenu({
  categories,
  open,
  setOpen,
}: {
  categories: (Category & { images: Image[] })[]
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}) {
  const [dropdownVisible, setDropdownVisible] = useState<boolean>(false)

  const toggleMenu = (state: boolean) => {
    setOpen(state)
    // Delay showing the dropdown until the trigger has finished expanding
    if (state) {
      setTimeout(() => {
        setDropdownVisible(true)
      }, 100)
    } else {
      setDropdownVisible(false)
    }
  }

  return (
    <div
      className="relative w-10 h-10 xl:w-[256px] z-50 transition"
      onClick={() => setOpen((prev) => !prev)}
      onMouseEnter={() => toggleMenu(true)}
      onMouseLeave={() => toggleMenu(false)}
    >
      {/* Trigger and Dropdown Container */}
      <div className="relative">
        {/* Trigger */}
        <div
          className={cn(
            'transition-all w-12 xl:w-[256px] h-12 rounded-full -translate-y-1 xl:translate-y-0 xl:h-11 bg-foreground/30 backdrop-blur-sm text-[20px] relative flex items-center cursor-pointer  duration-100 ease-in-out',
            {
              'w-[256px] bg-foreground/30 backdrop-blur-sm  text-base rounded-t-[20px] rounded-b-none scale-100':
                open,
              'scale-75': !open,
            }
          )}
        >
          {/* Menu Icon with transition to move right when open */}
          <Menu
            className={cn('absolute top-1/2 -translate-y-1/2 xl:ml-1', {
              'left-5 opacity-0': open,
              'left-3 ': !open,
            })}
          />
          <X
            className={cn('absolute top-1/2 -translate-y-1/2 xl:ml-1', {
              'left-5 ': open,
              'left-3 opacity-0': !open,
            })}
          />

          <span
            className={cn('hidden xl:inline-flex xl:ml-11', {
              'inline-flex !ml-14': open,
            })}
          >
            All Categories
          </span>

          <ChevronDown
            className={cn('hidden xl:inline-flex scale-75 absolute right-3', {
              'inline-flex': open,
            })}
          />
        </div>
        {/* Dropdown */}
        <ul
          className={cn(
            'absolute top-10 left-0 w-[256px] bg-foreground/30 backdrop-blur-sm shadow-lg transition-all duration-100 ease-in-out scrollbar overflow-y-auto',
            {
              'max-h-[523px] opacity-100': dropdownVisible, // Show dropdown
              'max-h-0 opacity-0': !dropdownVisible || !open, // Hide dropdown
            }
          )}
        >
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/browse?category=${category.url}`}
              className=" "
            >
              <li className="relative flex items-center m-0 p-3 pl-6 hover:bg-foreground/30 backdrop-blur-lg">
                <NextImage
                  src={category?.images?.map((image) => image.url)[0]}
                  alt={category.name}
                  width={100}
                  height={100}
                  className="w-[18px] h-[18px]"
                />
                <span className="text-sm font-normal ml-2 overflow-hidden line-clamp-2 break-words  ">
                  {category.name}
                </span>
              </li>
            </Link>
          ))}
        </ul>
      </div>
    </div>
  )
}
