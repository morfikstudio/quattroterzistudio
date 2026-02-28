import Link from "next/link"

import { Title } from "@/components/title"

export default function Page() {
  return (
    <section className="container mx-auto grid grid-cols-1 gap-6 p-12">
      <Title>Quattro Terzi Studio</Title>
      <p className="text-slate-600 max-w-xl">
        Portfolio e progetti.
      </p>
      <hr />
      <nav className="flex gap-4">
        <Link href="/projects" className="text-pink-600 hover:underline">
          Projects &rarr;
        </Link>
        <Link href="/about" className="text-pink-600 hover:underline">
          About &rarr;
        </Link>
      </nav>
    </section>
  )
}
