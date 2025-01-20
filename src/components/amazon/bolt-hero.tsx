import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { Menu, Search, ShoppingCart, Globe, ChevronDown } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

function BoltHero() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-[#131921] text-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg"
                alt="Amazon"
                className="h-8"
              />
            </div>

            {/* Deliver to */}
            <div className="hidden md:flex items-center ml-4">
              <Globe className="h-4 w-4 mr-1" />
              <div>
                <p className="text-xs text-gray-300">Deliver to</p>
                <p className="text-sm font-bold">United Kingdom</p>
              </div>
            </div>

            {/* Search */}
            <div className="flex-1 mx-4">
              <div className="flex">
                <Sheet>
                  <SheetTrigger className="bg-gray-100 text-black px-4 py-2 rounded-l-md">
                    All
                    <ChevronDown className="h-4 w-4 inline-block ml-1" />
                  </SheetTrigger>
                  <SheetContent side="left">
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <h2 className="text-lg font-semibold">
                          Shop By Department
                        </h2>
                        <div className="space-y-1">
                          <button className="w-full text-left py-2 hover:bg-gray-100">
                            Electronics
                          </button>
                          <button className="w-full text-left py-2 hover:bg-gray-100">
                            Computers
                          </button>
                          <button className="w-full text-left py-2 hover:bg-gray-100">
                            Smart Home
                          </button>
                          <button className="w-full text-left py-2 hover:bg-gray-100">
                            Arts & Crafts
                          </button>
                        </div>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
                <input
                  type="text"
                  placeholder="Search Amazon"
                  className="flex-1 px-4 py-2 border-0 focus:outline-none"
                />
                <button className="bg-[#febd69] hover:bg-[#f3a847]   px-4 py-2 rounded-r-md">
                  <Search className="h-5 w-5 text-black" />
                </button>
              </div>
            </div>

            {/* Account & Language */}
            <div className="hidden md:flex items-center">
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center space-x-1 hover:text-gray-300">
                  <Globe className="h-4 w-4" />
                  <span>EN</span>
                  <ChevronDown className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>English</DropdownMenuItem>
                  <DropdownMenuItem>Español</DropdownMenuItem>
                  <DropdownMenuItem>Deutsch</DropdownMenuItem>
                  <DropdownMenuItem>Français</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger className="ml-4 hover:text-gray-300">
                  <div>
                    <p className="text-xs">Hello, Sign in</p>
                    <p className="text-sm font-bold">Account & Lists</p>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Your Account</DropdownMenuItem>
                  <DropdownMenuItem>Your Orders</DropdownMenuItem>
                  <DropdownMenuItem>Your Lists</DropdownMenuItem>
                  <DropdownMenuItem>Sign Out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Cart */}
            <div className="ml-4 flex items-center">
              <ShoppingCart className="h-6 w-6" />
              <span className="ml-1 font-bold">Cart</span>
            </div>
          </div>

          {/* Secondary Nav */}
          <nav className="flex items-center space-x-4 h-10 text-sm">
            <Sheet>
              <SheetTrigger className="flex items-center hover:text-gray-300">
                <Menu className="h-6 w-6 mr-1" />
                All
              </SheetTrigger>
              <SheetContent side="left">
                <div className="grid gap-4 py-4">
                  <h2 className="text-xl font-bold">Shop By Category</h2>
                  <div className="space-y-2">
                    <button className="w-full text-left py-2 hover:bg-gray-100">
                      Today Deals
                    </button>
                    <button className="w-full text-left py-2 hover:bg-gray-100">
                      Customer Service
                    </button>
                    <button className="w-full text-left py-2 hover:bg-gray-100">
                      Registry
                    </button>
                    <button className="w-full text-left py-2 hover:bg-gray-100">
                      Gift Cards
                    </button>
                    <button className="w-full text-left py-2 hover:bg-gray-100">
                      Sell
                    </button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <ScrollArea className="w-96 whitespace-nowrap ">
              <div className="flex w-max space-x-4 p-4">
                <a href="#" className="hover:text-gray-300 shrink-0">
                  Today Deals
                </a>
                <a href="#" className="hover:text-gray-300">
                  Customer Service
                </a>
                <a href="#" className="hover:text-gray-300">
                  Registry
                </a>
                <a href="#" className="hover:text-gray-300">
                  Gift Cards
                </a>
                <a href="#" className="hover:text-gray-300">
                  Sell
                </a>
              </div>
            </ScrollArea>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Carousel */}
        <div className="relative">
          <Carousel className="w-full">
            <CarouselContent>
              <CarouselItem>
                <img
                  src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=2000&q=80"
                  alt="New arrivals in Toys"
                  className="w-full h-[400px] object-cover"
                />
              </CarouselItem>
              <CarouselItem>
                <img
                  src="https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=2000&q=80"
                  alt="Electronics"
                  className="w-full h-[400px] object-cover"
                />
              </CarouselItem>
              <CarouselItem>
                <img
                  src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=2000&q=80"
                  alt="Books"
                  className="w-full h-[400px] object-cover"
                />
              </CarouselItem>
            </CarouselContent>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </Carousel>
        </div>

        {/* Product Grid */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Product Cards */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4">
                Pick up where you left off
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <img
                  src="https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=300&q=80"
                  alt="Product"
                  className="rounded-md"
                />
                <img
                  src="https://images.unsplash.com/photo-1627384113743-6bd5a479fffd?auto=format&fit=crop&w=300&q=80"
                  alt="Product"
                  className="rounded-md"
                />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4">Shop for your home</h2>
              <div className="grid grid-cols-2 gap-4">
                <img
                  src="https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=300&q=80"
                  alt="Home"
                  className="rounded-md"
                />
                <img
                  src="https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=300&q=80"
                  alt="Home"
                  className="rounded-md"
                />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4">
                Top categories in Kitchen
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <img
                  src="https://images.unsplash.com/photo-1622673038079-2f502e63f16b?auto=format&fit=crop&w=300&q=80"
                  alt="Kitchen"
                  className="rounded-md"
                />
                <img
                  src="https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=300&q=80"
                  alt="Kitchen"
                  className="rounded-md"
                />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4">Get your game on</h2>
              <div className="grid grid-cols-2 gap-4">
                <img
                  src="https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?auto=format&fit=crop&w=300&q=80"
                  alt="Gaming"
                  className="rounded-md"
                />
                <img
                  src="https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=300&q=80"
                  alt="Gaming"
                  className="rounded-md"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default BoltHero
