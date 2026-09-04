import { Bell, Search } from 'lucide-react';

export function Navbar() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <div className="flex items-center">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-coral sm:text-sm sm:leading-6"
            placeholder="Search..."
          />
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <button className="text-gray-400 hover:text-gray-500">
          <span className="sr-only">View notifications</span>
          <Bell className="h-6 w-6" />
        </button>
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-full bg-coral text-white flex items-center justify-center font-bold">
            A
          </div>
          <span className="text-sm font-medium text-gray-700">Admin</span>
        </div>
      </div>
    </header>
  );
}
